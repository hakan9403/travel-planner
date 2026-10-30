import { MapPin, ExternalLink } from 'lucide-react'
import type { Attraction } from '../../types'
import Badge from '../ui/Badge'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../lib/utils'

interface AttractionCardProps {
  attraction: Attraction
  onAdd?: () => void
  added?: boolean
}

export default function AttractionCard({ attraction, onAdd, added }: AttractionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      {attraction.image_urls?.[0] && (
        <div className="h-36 overflow-hidden">
          <img
            src={attraction.image_urls[0]}
            alt={attraction.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 leading-tight">{attraction.name}</h3>
          {attraction.category && (
            <Badge className={CATEGORY_COLORS[attraction.category]}>
              {CATEGORY_LABELS[attraction.category]}
            </Badge>
          )}
        </div>

        {(attraction.city || attraction.country) && (
          <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{[attraction.city, attraction.country].filter(Boolean).join(', ')}</span>
          </div>
        )}

        {attraction.description && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-3">{attraction.description}</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          {attraction.wikipedia_url && (
            <a
              href={attraction.wikipedia_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Wikipedia
            </a>
          )}
          {onAdd && (
            <button
              onClick={onAdd}
              disabled={added}
              className={`ml-auto text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                added
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-sky-600 text-white hover:bg-sky-700'
              }`}
            >
              {added ? 'Hinzugefügt' : '+ Zur Reise'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
