import { Link } from 'react-router-dom'
import { Calendar, Users, MapPin } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Trip } from '../../types'
import Badge from '../ui/Badge'
import StarRating from '../ui/StarRating'
import { COUNTRY_FLAGS, COUNTRY_LABELS, STATUS_COLORS, STATUS_LABELS, tripDuration } from '../../lib/utils'

interface TripCardProps {
  trip: Trip
}

export default function TripCard({ trip }: TripCardProps) {
  const duration = tripDuration(trip.start_date, trip.end_date)
  const memberCount = trip.group_members?.length ?? 0

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{COUNTRY_FLAGS[trip.country]}</span>
            <h3 className="font-semibold text-slate-900 truncate group-hover:text-sky-700 transition-colors">
              {trip.name}
            </h3>
          </div>
          <p className="text-sm text-slate-500">{COUNTRY_LABELS[trip.country]}</p>
        </div>
        <Badge className={STATUS_COLORS[trip.status]}>{STATUS_LABELS[trip.status]}</Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        {trip.start_date && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {format(parseISO(trip.start_date), 'dd. MMM yyyy', { locale: de })}
              {duration && ` · ${duration} Tage`}
            </span>
          </div>
        )}
        {memberCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{memberCount} {memberCount === 1 ? 'Person' : 'Personen'}</span>
          </div>
        )}
        {trip.routes && trip.routes.length > 0 && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{trip.routes.length} Route{trip.routes.length !== 1 ? 'n' : ''}</span>
          </div>
        )}
      </div>

      {trip.rating && (
        <div className="mt-3">
          <StarRating value={trip.rating} readOnly />
        </div>
      )}
    </Link>
  )
}
