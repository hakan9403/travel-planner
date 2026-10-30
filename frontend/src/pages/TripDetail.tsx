import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit2, Users, Map, ListChecks, Wand2, Plus, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Trip, Attraction, TripAttraction, Route } from '../types'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import { COUNTRY_FLAGS, COUNTRY_LABELS, STATUS_COLORS, STATUS_LABELS, tripDuration } from '../lib/utils'
import RouteMap from '../components/map/RouteMap'
import AttractionSearch from '../components/attractions/AttractionSearch'
import AttractionCard from '../components/attractions/AttractionCard'
import GroupMembers from '../components/planning/GroupMembers'
import DayPlanner from '../components/planning/DayPlanner'
import TripForm from '../components/trips/TripForm'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import StarRating from '../components/ui/StarRating'

type Tab = 'overview' | 'attractions' | 'planning'

export default function TripDetail() {
  const { id } = useParams<{ id: string }>()
  const { updateTrip } = useAppStore()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [showEdit, setShowEdit] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [{ data: tripData }, { data: taData }, { data: routeData }] = await Promise.all([
        supabase.from('trips').select('*, group_members(*)').eq('id', id!).single(),
        supabase.from('trip_attractions').select('*, attraction:attractions(*)').eq('trip_id', id!),
        supabase.from('routes').select('*, stages:route_stages(*, stage_attractions(*, attraction:attractions(*)))').eq('trip_id', id!),
      ])
      if (tripData) setTrip(tripData as Trip)
      if (taData) setAttractions((taData as TripAttraction[]).map((ta) => ta.attraction!).filter(Boolean))
      if (routeData) setRoutes(routeData as Route[])
      setLoading(false)
    }
    load()
  }, [id])

  async function handleAttractionAdded(attraction: Attraction) {
    setAttractions((prev) => [...prev, attraction])
  }

  async function handleRemoveAttraction(attractionId: string) {
    await supabase
      .from('trip_attractions')
      .delete()
      .eq('trip_id', id!)
      .eq('attraction_id', attractionId)
    setAttractions((prev) => prev.filter((a) => a.id !== attractionId))
  }

  async function handleRating(rating: number) {
    await supabase.from('trips').update({ rating }).eq('id', id!)
    setTrip((t) => t ? { ...t, rating } : t)
  }

  async function createRoute() {
    const { data } = await supabase
      .from('routes')
      .insert({ trip_id: id!, name: `Route ${routes.length + 1}`, is_active: routes.length === 0 })
      .select()
      .single()
    if (data) setRoutes((r) => [...r, data as Route])
  }

  function handleTripSaved(updated: Trip) {
    setTrip(updated)
    updateTrip(updated)
    setShowEdit(false)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!trip) return <div className="p-6 text-slate-500">Reise nicht gefunden.</div>

  const duration = tripDuration(trip.start_date, trip.end_date)
  const activeRoute = routes.find((r) => r.is_active) ?? routes[0]

  const TABS: Array<{ key: Tab; label: string; icon: typeof Map }> = [
    { key: 'overview', label: 'Übersicht', icon: Map },
    { key: 'attractions', label: `Attraktionen (${attractions.length})`, icon: ListChecks },
    { key: 'planning', label: 'Planung', icon: Wand2 },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{COUNTRY_FLAGS[trip.country]}</span>
              <h1 className="text-2xl font-bold text-slate-900">{trip.name}</h1>
              <Badge className={STATUS_COLORS[trip.status]}>{STATUS_LABELS[trip.status]}</Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span>{COUNTRY_LABELS[trip.country]}</span>
              {trip.start_date && (
                <span>
                  {format(parseISO(trip.start_date), 'dd. MMM yyyy', { locale: de })}
                  {trip.end_date && ` – ${format(parseISO(trip.end_date), 'dd. MMM yyyy', { locale: de })}`}
                  {duration && ` (${duration} Tage)`}
                </span>
              )}
            </div>
            <div className="mt-2">
              <StarRating value={trip.rating} onChange={handleRating} />
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
            <Edit2 className="w-4 h-4" />
            Bearbeiten
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {attractions.length > 0 ? (
            <RouteMap attractions={attractions} height="420px" />
          ) : (
            <div className="h-48 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">
              Füge Attraktionen hinzu, um die Karte zu sehen.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-900">Reisegruppe</h3>
              </div>
              <GroupMembers members={trip.group_members ?? []} />
            </div>

            {activeRoute && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">Aktive Route</h3>
                  <Link
                    to={`/trips/${trip.id}/routes/${activeRoute.id}`}
                    className="text-sm text-sky-600 hover:text-sky-700"
                  >
                    Detailansicht →
                  </Link>
                </div>
                <p className="text-sm text-slate-600">{activeRoute.name}</p>
                <p className="text-sm text-slate-500">
                  {activeRoute.stages?.length ?? 0} Etappen · {activeRoute.total_days ?? '?'} Tage
                </p>
              </div>
            )}
          </div>

          {trip.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">{trip.notes}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'attractions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Attraktion suchen & hinzufügen</h3>
            <AttractionSearch
              country={trip.country}
              tripId={trip.id}
              onAttractionAdded={handleAttractionAdded}
            />
          </div>

          {attractions.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Gespeicherte Attraktionen</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {attractions.map((a) => (
                  <div key={a.id} className="relative group">
                    <AttractionCard attraction={a} />
                    <button
                      onClick={() => handleRemoveAttraction(a.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow border border-slate-200 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'planning' && (
        <div className="space-y-4">
          {routes.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
              <p className="text-slate-500 text-sm mb-4">Noch keine Route angelegt.</p>
              <Button onClick={createRoute} size="sm">
                <Plus className="w-4 h-4" />
                Route erstellen
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <DayPlanner
                trip={trip}
                attractions={attractions}
                routeId={activeRoute?.id}
                onPlanSaved={() => {}}
              />
            </div>
          )}
        </div>
      )}

      {showEdit && (
        <TripForm trip={trip} onSave={handleTripSaved} onClose={() => setShowEdit(false)} />
      )}
    </div>
  )
}
