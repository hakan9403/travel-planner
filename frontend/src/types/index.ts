export type Country = 'china' | 'japan' | 'taiwan'
export type TripStatus = 'planning' | 'confirmed' | 'completed'
export type AttractionCategory =
  | 'temple'
  | 'museum'
  | 'nature'
  | 'food'
  | 'shopping'
  | 'historic'
  | 'entertainment'
  | 'accommodation'
  | 'transport'
  | 'other'

export interface Trip {
  id: string
  name: string
  country: Country
  start_date: string | null
  end_date: string | null
  rating: number | null
  status: TripStatus
  notes: string | null
  created_at: string
  updated_at: string
  group_members?: GroupMember[]
  routes?: Route[]
}

export interface GroupMember {
  id: string
  trip_id: string
  name: string
  age: number | null
  notes: string | null
}

export interface Attraction {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  country: string | null
  city: string | null
  category: AttractionCategory | null
  image_urls: string[] | null
  wikipedia_url: string | null
  osm_id: string | null
  created_at: string
}

export interface TripAttraction {
  id: string
  trip_id: string
  attraction_id: string
  notes: string | null
  attraction?: Attraction
}

export interface Route {
  id: string
  trip_id: string
  name: string
  description: string | null
  total_days: number | null
  rating: number | null
  is_active: boolean
  created_at: string
  stages?: RouteStage[]
}

export interface RouteStage {
  id: string
  route_id: string
  day_number: number
  date: string | null
  title: string | null
  notes: string | null
  stage_attractions?: StageAttraction[]
}

export interface StageAttraction {
  id: string
  stage_id: string
  attraction_id: string
  order_index: number
  duration_hours: number | null
  transport_to_next: string | null
  notes: string | null
  attraction?: Attraction
}

export interface SearchResult {
  osm_id: string
  name: string
  display_name: string
  lat: number
  lng: number
  city: string
  country: string
  type: string
}

export interface AISuggestion {
  stages: Array<{
    day: number
    date: string
    title: string
    location: string
    attractions: string[]
    notes: string
    transport: string
  }>
  summary: string
}
