import { useState } from 'react'
import { Search, Loader2, Plus } from 'lucide-react'
import type { Attraction, Country, AttractionCategory } from '../../types'
import { searchAttractions, fetchWikipedia } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import { CATEGORY_LABELS } from '../../lib/utils'
import type { SearchResult } from '../../types'

interface AttractionSearchProps {
  country?: Country
  tripId?: string
  onAttractionAdded?: (attraction: Attraction) => void
}

const CATEGORIES = Object.entries(CATEGORY_LABELS) as Array<[AttractionCategory, string]>

export default function AttractionSearch({ country, tripId, onAttractionAdded }: AttractionSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [category, setCategory] = useState<AttractionCategory>('other')
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await searchAttractions(query, country)
      setResults(data)
      if (data.length === 0) setError('Keine Ergebnisse gefunden.')
    } catch {
      setError('Suche fehlgeschlagen. Ist das Backend erreichbar?')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(result: SearchResult) {
    setSaving(result.osm_id)
    try {
      let wikiData: { description: string; image: string | null; url: string | null } | null = null
      try {
        wikiData = await fetchWikipedia(result.name)
      } catch {
        // Wikipedia optional
      }

      const { data, error: err } = await supabase
        .from('attractions')
        .insert({
          name: result.name,
          description: wikiData?.description ?? null,
          lat: result.lat,
          lng: result.lng,
          city: result.city,
          country: result.country,
          category,
          image_urls: wikiData?.image ? [wikiData.image] : null,
          wikipedia_url: wikiData?.url ?? null,
          osm_id: result.osm_id,
        })
        .select()
        .single()

      if (err) throw err
      const attraction = data as Attraction

      if (tripId) {
        await supabase.from('trip_attractions').insert({
          trip_id: tripId,
          attraction_id: attraction.id,
        })
      }

      onAttractionAdded?.(attraction)
      setResults(results.filter((r) => r.osm_id !== result.osm_id))
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Attraktion suchen, z.B. Fushimi Inari..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as AttractionCategory)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          {CATEGORIES.map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Suchen
        </button>
      </form>

      {error && <p className="text-sm text-slate-500">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <div
              key={r.osm_id}
              className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate">{r.name}</p>
                <p className="text-xs text-slate-500 truncate">{r.display_name}</p>
              </div>
              <button
                onClick={() => handleAdd(r)}
                disabled={saving === r.osm_id}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs rounded-lg hover:bg-sky-700 disabled:opacity-50"
              >
                {saving === r.osm_id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Hinzufügen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
