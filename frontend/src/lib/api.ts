import axios from 'axios'
import type { AISuggestion, Attraction, SearchResult } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

export async function searchAttractions(q: string, country?: string): Promise<SearchResult[]> {
  const { data } = await api.get('/attractions/search', { params: { q, country } })
  return data
}

export async function fetchWikipedia(title: string): Promise<{
  title: string
  description: string
  image: string | null
  url: string | null
}> {
  const { data } = await api.get('/attractions/wikipedia', { params: { title } })
  return data
}

export async function suggestPlan(payload: {
  trip: {
    name: string
    country: string
    start_date: string
    end_date: string
    total_days: number
  }
  group: Array<{ name: string; age?: number }>
  attractions: Attraction[]
}): Promise<AISuggestion> {
  const { data } = await api.post('/planning/suggest', payload)
  return data
}
