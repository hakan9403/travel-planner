import { useState } from 'react'
import { Loader2, Wand2, MapPin, Clock } from 'lucide-react'
import type { Trip, Attraction, AISuggestion } from '../../types'
import { suggestPlan } from '../../lib/api'
import { tripDuration } from '../../lib/utils'
import Button from '../ui/Button'
import { supabase } from '../../lib/supabase'
import { format, addDays, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface DayPlannerProps {
  trip: Trip
  attractions: Attraction[]
  routeId?: string
  onPlanSaved?: () => void
}

export default function DayPlanner({ trip, attractions, routeId, onPlanSaved }: DayPlannerProps) {
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const duration = tripDuration(trip.start_date, trip.end_date)

  async function handleSuggest() {
    if (!attractions.length) {
      setError('Füge zuerst Attraktionen zur Reise hinzu.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await suggestPlan({
        trip: {
          name: trip.name,
          country: trip.country,
          start_date: trip.start_date ?? '',
          end_date: trip.end_date ?? '',
          total_days: duration ?? 7,
        },
        group: trip.group_members ?? [],
        attractions,
      })
      setSuggestion(result)
    } catch {
      setError('KI-Planung fehlgeschlagen. Prüfe ob das Backend läuft und ANTHROPIC_API_KEY gesetzt ist.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!suggestion || !routeId) return
    setSaving(true)
    try {
      // Delete existing stages
      await supabase.from('route_stages').delete().eq('route_id', routeId)

      for (const stage of suggestion.stages) {
        const { data: stageData } = await supabase
          .from('route_stages')
          .insert({
            route_id: routeId,
            day_number: stage.day,
            date: stage.date || null,
            title: stage.title,
            notes: stage.notes,
          })
          .select()
          .single()

        if (stageData && stage.attractions.length > 0) {
          const attractionInserts = stage.attractions
            .map((attrId, idx) => {
              const attraction = attractions.find((a) => a.id === attrId || a.name === attrId)
              return attraction
                ? { stage_id: stageData.id, attraction_id: attraction.id, order_index: idx }
                : null
            })
            .filter(Boolean)

          if (attractionInserts.length > 0) {
            await supabase.from('stage_attractions').insert(attractionInserts)
          }
        }
      }

      onPlanSaved?.()
    } catch (err) {
      console.error(err)
      setError('Plan konnte nicht gespeichert werden.')
    } finally {
      setSaving(false)
    }
  }

  function dayDate(dayNumber: number): string {
    if (!trip.start_date) return `Tag ${dayNumber}`
    const date = addDays(parseISO(trip.start_date), dayNumber - 1)
    return format(date, 'EEE, dd. MMM', { locale: de })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">KI-Tagesplanung</h3>
          <p className="text-sm text-slate-500">
            {attractions.length} Attraktionen · {duration ?? '?'} Tage
          </p>
        </div>
        <Button onClick={handleSuggest} disabled={loading} size="sm">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          Plan vorschlagen
        </Button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      {suggestion && (
        <div className="space-y-3">
          {suggestion.summary && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
              <p className="text-sm text-sky-800">{suggestion.summary}</p>
            </div>
          )}

          <div className="space-y-3">
            {suggestion.stages.map((stage) => {
              const stageAttractions = stage.attractions
                .map((id) => attractions.find((a) => a.id === id || a.name === id))
                .filter(Boolean) as Attraction[]

              return (
                <div key={stage.day} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
                        {dayDate(stage.day)}
                      </span>
                      <h4 className="font-semibold text-slate-900">{stage.title}</h4>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {stage.location}
                    </div>
                  </div>

                  {stageAttractions.length > 0 ? (
                    <div className="space-y-1.5">
                      {stageAttractions.map((a, idx) => (
                        <div key={a.id} className="flex items-center gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-slate-800 truncate">{a.name}</span>
                          {a.category && (
                            <span className="ml-auto text-xs text-slate-400 shrink-0">{a.category}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {stage.attractions.map((name, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          {name}
                        </div>
                      ))}
                    </div>
                  )}

                  {stage.notes && (
                    <p className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">{stage.notes}</p>
                  )}
                  {stage.transport && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      Weiter: {stage.transport}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {routeId && (
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Plan als Route speichern
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
