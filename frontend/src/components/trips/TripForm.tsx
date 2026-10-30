import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Trip, GroupMember, Country, TripStatus } from '../../types'
import Button from '../ui/Button'
import { COUNTRY_FLAGS, COUNTRY_LABELS } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

interface TripFormProps {
  trip?: Trip
  onSave: (trip: Trip) => void
  onClose: () => void
}

const COUNTRIES: Country[] = ['china', 'japan', 'taiwan']
const STATUSES: TripStatus[] = ['planning', 'confirmed', 'completed']
const STATUS_LABELS: Record<TripStatus, string> = {
  planning: 'In Planung',
  confirmed: 'Bestätigt',
  completed: 'Abgeschlossen',
}

export default function TripForm({ trip, onSave, onClose }: TripFormProps) {
  const [name, setName] = useState(trip?.name ?? '')
  const [country, setCountry] = useState<Country>(trip?.country ?? 'japan')
  const [startDate, setStartDate] = useState(trip?.start_date ?? '')
  const [endDate, setEndDate] = useState(trip?.end_date ?? '')
  const [status, setStatus] = useState<TripStatus>(trip?.status ?? 'planning')
  const [notes, setNotes] = useState(trip?.notes ?? '')
  const [members, setMembers] = useState<Array<{ name: string; age: string }>>(
    trip?.group_members?.map((m) => ({ name: m.name, age: String(m.age ?? '') })) ?? []
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addMember = () => setMembers([...members, { name: '', age: '' }])
  const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i))
  const updateMember = (i: number, field: 'name' | 'age', value: string) =>
    setMembers(members.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)

    try {
      let savedTrip: Trip

      if (trip?.id) {
        const { data, error: err } = await supabase
          .from('trips')
          .update({ name, country, start_date: startDate || null, end_date: endDate || null, status, notes: notes || null })
          .eq('id', trip.id)
          .select()
          .single()
        if (err) throw err
        savedTrip = data as Trip
      } else {
        const { data, error: err } = await supabase
          .from('trips')
          .insert({ name, country, start_date: startDate || null, end_date: endDate || null, status, notes: notes || null })
          .select()
          .single()
        if (err) throw err
        savedTrip = data as Trip
      }

      // Sync group members
      if (trip?.id) {
        await supabase.from('group_members').delete().eq('trip_id', trip.id)
      }
      const validMembers = members.filter((m) => m.name.trim())
      if (validMembers.length > 0) {
        await supabase.from('group_members').insert(
          validMembers.map((m) => ({
            trip_id: savedTrip.id,
            name: m.name.trim(),
            age: m.age ? parseInt(m.age) : null,
          }))
        )
      }

      const { data: groupData } = await supabase
        .from('group_members')
        .select()
        .eq('trip_id', savedTrip.id)

      onSave({ ...savedTrip, group_members: groupData as GroupMember[] ?? [] })
    } catch (err) {
      setError('Speichern fehlgeschlagen. Bitte prüfe deine Supabase-Verbindung.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{trip ? 'Reise bearbeiten' : 'Neue Reise'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="z.B. Japan Herbst 2025"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Land</label>
            <div className="flex gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCountry(c)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    country === c
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{COUNTRY_FLAGS[c]}</span>
                  <span>{COUNTRY_LABELS[c]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Startdatum</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Enddatum</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TripStatus)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Reisegruppe</label>
              <button type="button" onClick={addMember} className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700">
                <Plus className="w-3.5 h-3.5" /> Person hinzufügen
              </button>
            </div>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={m.name}
                    onChange={(e) => updateMember(i, 'name', e.target.value)}
                    placeholder="Name"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    value={m.age}
                    onChange={(e) => updateMember(i, 'age', e.target.value)}
                    placeholder="Alter"
                    type="number"
                    className="w-20 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button type="button" onClick={() => removeMember(i)} className="p-2 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notizen</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              placeholder="Besondere Wünsche, Hinweise..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Speichern…' : 'Speichern'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
