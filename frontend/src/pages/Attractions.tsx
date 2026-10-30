import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import type { Attraction, Country } from '../types'
import { supabase } from '../lib/supabase'
import AttractionCard from '../components/attractions/AttractionCard'
import AttractionSearch from '../components/attractions/AttractionSearch'
import { COUNTRY_FLAGS, COUNTRY_LABELS } from '../lib/utils'

const COUNTRIES: Array<{ key: Country | 'all'; label: string; flag?: string }> = [
  { key: 'all', label: 'Alle' },
  { key: 'china', label: COUNTRY_LABELS.china, flag: COUNTRY_FLAGS.china },
  { key: 'japan', label: COUNTRY_LABELS.japan, flag: COUNTRY_FLAGS.japan },
  { key: 'taiwan', label: COUNTRY_LABELS.taiwan, flag: COUNTRY_FLAGS.taiwan },
]

export default function AttractionsPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [filter, setFilter] = useState<Country | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('attractions')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setAttractions(data as Attraction[])
      setLoading(false)
    }
    load()
  }, [])

  function handleAdded(attraction: Attraction) {
    setAttractions((prev) => [attraction, ...prev])
  }

  const filtered = attractions.filter((a) => {
    const matchCountry =
      filter === 'all' ||
      a.country?.toLowerCase().includes(COUNTRY_LABELS[filter].toLowerCase()) ||
      a.country?.toLowerCase() === filter
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.city?.toLowerCase().includes(search.toLowerCase())
    return matchCountry && matchSearch
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Attraktionen</h1>
        <p className="text-sm text-slate-500 mt-0.5">Alle gespeicherten Sehenswürdigkeiten</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h3 className="font-semibold text-slate-900 mb-4">Neue Attraktion suchen</h3>
        <AttractionSearch onAttractionAdded={handleAdded} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-2">
          {COUNTRIES.map(({ key, label, flag }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-sky-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {flag && <span>{flag}</span>}
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtern..."
            className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Keine Attraktionen gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <AttractionCard key={a.id} attraction={a} />
          ))}
        </div>
      )}
    </div>
  )
}
