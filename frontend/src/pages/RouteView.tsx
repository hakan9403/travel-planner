import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Route, Attraction } from '../types'
import { supabase } from '../lib/supabase'
import RouteMap from '../components/map/RouteMap'
import { CATEGORY_LABELS } from '../lib/utils'
import Badge from '../components/ui/Badge'

export default function RouteView() {
  const { tripId, routeId } = useParams<{ tripId: string; routeId: string }>()
  const [route, setRoute] = useState<Route | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!routeId) return
    async function load() {
      const { data } = await supabase
        .from('routes')
        .select(`
          *,
          stages:route_stages(
            *,
            stage_attractions(
              *,
              attraction:attractions(*)
            )
          )
        `)
        .eq('id', routeId!)
        .single()

      if (data) {
        const r = data as Route
        // Sort stages by day_number
        r.stages = r.stages?.sort((a, b) => a.day_number - b.day_number)
        setRoute(r)
        setSelectedDay(r.stages?.[0]?.day_number ?? null)
      }
      setLoading(false)
    }
    load()
  }, [routeId])

  if (loading) {
    return <div className="p-6"><div className="h-64 bg-slate-100 rounded-xl animate-pulse" /></div>
  }
  if (!route) return <div className="p-6 text-slate-500">Route nicht gefunden.</div>

  const selectedStage = route.stages?.find((s) => s.day_number === selectedDay)
  const selectedAttractions = (selectedStage?.stage_attractions ?? [])
    .sort((a, b) => a.order_index - b.order_index)
    .map((sa) => sa.attraction)
    .filter(Boolean) as Attraction[]

  const allAttractions = (route.stages ?? [])
    .flatMap((s) =>
      (s.stage_attractions ?? [])
        .sort((a, b) => a.order_index - b.order_index)
        .map((sa) => sa.attraction)
        .filter(Boolean)
    ) as Attraction[]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link to={`/trips/${tripId}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Zurück zur Reise
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{route.name}</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {route.stages?.length ?? 0} Tage · {allAttractions.length} Attraktionen
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: day list */}
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide mb-3">Etappen</h3>
          {route.stages?.map((stage) => {
            const count = stage.stage_attractions?.length ?? 0
            return (
              <button
                key={stage.day_number}
                onClick={() => setSelectedDay(stage.day_number)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedDay === stage.day_number
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
                    Tag {stage.day_number}
                  </span>
                  <span className="text-xs text-slate-400">{count} Stops</span>
                </div>
                <p className="font-medium text-slate-900 text-sm mt-0.5 truncate">
                  {stage.title ?? `Tag ${stage.day_number}`}
                </p>
                {stage.date && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {format(parseISO(stage.date), 'EEE, dd. MMM', { locale: de })}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Right: map + detail */}
        <div className="lg:col-span-2 space-y-4">
          <RouteMap
            attractions={selectedAttractions.length > 0 ? selectedAttractions : allAttractions}
            height="380px"
            showRoute
          />

          {selectedStage && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-1">
                {selectedStage.title ?? `Tag ${selectedStage.day_number}`}
              </h3>
              {selectedStage.notes && (
                <p className="text-sm text-slate-600 mb-4">{selectedStage.notes}</p>
              )}

              <div className="space-y-2">
                {selectedAttractions.map((a, idx) => {
                  const sa = selectedStage.stage_attractions?.find(
                    (x) => x.attraction_id === a.id
                  )
                  return (
                    <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                      <div className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-slate-900">{a.name}</p>
                          {a.category && (
                            <Badge className="bg-slate-100 text-slate-600">
                              {CATEGORY_LABELS[a.category]}
                            </Badge>
                          )}
                        </div>
                        {a.city && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {a.city}
                          </div>
                        )}
                        {sa?.duration_hours && (
                          <p className="text-xs text-slate-400 mt-0.5">ca. {sa.duration_hours}h</p>
                        )}
                        {sa?.transport_to_next && (
                          <p className="text-xs text-slate-400">→ {sa.transport_to_next}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
