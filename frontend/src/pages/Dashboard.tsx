import { useEffect, useState } from 'react'
import { Plus, Globe, CheckCircle, Clock } from 'lucide-react'
import type { Trip } from '../types'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import TripCard from '../components/trips/TripCard'
import TripForm from '../components/trips/TripForm'
import Button from '../components/ui/Button'

export default function Dashboard() {
  const { trips, setTrips, addTrip, updateTrip } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('trips')
        .select('*, group_members(*), routes(*)')
        .order('created_at', { ascending: false })
      if (data) setTrips(data as Trip[])
      setLoading(false)
    }
    load()
  }, [setTrips])

  const stats = {
    total: trips.length,
    planning: trips.filter((t) => t.status === 'planning').length,
    completed: trips.filter((t) => t.status === 'completed').length,
    countries: new Set(trips.map((t) => t.country)).size,
  }

  function handleSave(trip: Trip) {
    if (trips.find((t) => t.id === trip.id)) {
      updateTrip(trip)
    } else {
      addTrip(trip)
    }
    setShowForm(false)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reisen</h1>
          <p className="text-sm text-slate-500 mt-0.5">Deine Reiseplanung auf einen Blick</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Neue Reise
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Reisen gesamt', value: stats.total, icon: Globe, color: 'text-sky-600 bg-sky-50' },
          { label: 'In Planung', value: stats.planning, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Abgeschlossen', value: stats.completed, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Länder', value: stats.countries, icon: Globe, color: 'text-violet-600 bg-violet-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Trip list */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20">
          <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-700 mb-1">Noch keine Reise geplant</h3>
          <p className="text-sm text-slate-500 mb-4">Leg jetzt deine erste Reise nach China, Japan oder Taiwan an.</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Erste Reise anlegen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      {showForm && (
        <TripForm onSave={handleSave} onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
