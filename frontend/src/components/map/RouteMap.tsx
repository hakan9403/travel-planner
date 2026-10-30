import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
import type { Attraction } from '../../types'
import { CATEGORY_COLORS } from '../../lib/utils'

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface RouteMapProps {
  attractions: Attraction[]
  height?: string
  showRoute?: boolean
}

function FitBounds({ attractions }: { attractions: Attraction[] }) {
  const map = useMap()
  useEffect(() => {
    if (attractions.length === 0) return
    if (attractions.length === 1) {
      map.setView([attractions[0].lat, attractions[0].lng], 13)
    } else {
      const bounds = L.latLngBounds(attractions.map((a) => [a.lat, a.lng]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [attractions, map])
  return null
}

function categoryColor(category: string | null): string {
  const cls = CATEGORY_COLORS[category ?? 'other'] ?? ''
  if (cls.includes('purple')) return '#9333ea'
  if (cls.includes('blue')) return '#2563eb'
  if (cls.includes('green')) return '#16a34a'
  if (cls.includes('orange')) return '#ea580c'
  if (cls.includes('pink')) return '#db2777'
  if (cls.includes('amber')) return '#d97706'
  if (cls.includes('indigo')) return '#4f46e5'
  if (cls.includes('teal')) return '#0d9488'
  return '#64748b'
}

export default function RouteMap({ attractions, height = '400px', showRoute = true }: RouteMapProps) {
  const center: [number, number] = attractions.length > 0
    ? [attractions[0].lat, attractions[0].lng]
    : [35.6762, 139.6503] // Tokyo default

  const routePoints: [number, number][] = attractions.map((a) => [a.lat, a.lng])

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-slate-200">
      <MapContainer
        center={center}
        zoom={attractions.length === 1 ? 13 : 5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showRoute && routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: '#0ea5e9', weight: 2.5, dashArray: '6, 6', opacity: 0.8 }}
          />
        )}

        {attractions.map((a, idx) => {
          const icon = L.divIcon({
            className: '',
            html: `<div style="
              background:${categoryColor(a.category)};
              color:white;
              width:28px;height:28px;
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              display:flex;align-items:center;justify-content:center;
              border:2px solid white;
              box-shadow:0 2px 6px rgba(0,0,0,0.3);
              font-size:11px;font-weight:700;
            ">
              <span style="transform:rotate(45deg)">${idx + 1}</span>
            </div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
          })

          return (
            <Marker key={a.id} position={[a.lat, a.lng]} icon={icon}>
              <Popup>
                <div className="min-w-[160px]">
                  <p className="font-semibold text-sm">{a.name}</p>
                  {a.city && <p className="text-xs text-gray-500 mt-0.5">{a.city}</p>}
                  {a.description && (
                    <p className="text-xs mt-1 text-gray-600 line-clamp-3">{a.description}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        <FitBounds attractions={attractions} />
      </MapContainer>
    </div>
  )
}
