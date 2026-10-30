import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function tripDuration(start: string | null, end: string | null): number | null {
  if (!start || !end) return null
  return differenceInDays(parseISO(end), parseISO(start)) + 1
}

export const COUNTRY_LABELS: Record<string, string> = {
  china: 'China',
  japan: 'Japan',
  taiwan: 'Taiwan',
}

export const COUNTRY_FLAGS: Record<string, string> = {
  china: '🇨🇳',
  japan: '🇯🇵',
  taiwan: '🇹🇼',
}

export const STATUS_LABELS: Record<string, string> = {
  planning: 'In Planung',
  confirmed: 'Bestätigt',
  completed: 'Abgeschlossen',
}

export const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
}

export const CATEGORY_LABELS: Record<string, string> = {
  temple: 'Tempel',
  museum: 'Museum',
  nature: 'Natur',
  food: 'Essen & Trinken',
  shopping: 'Shopping',
  historic: 'Historie',
  entertainment: 'Unterhaltung',
  accommodation: 'Unterkunft',
  transport: 'Transport',
  other: 'Sonstiges',
}

export const CATEGORY_COLORS: Record<string, string> = {
  temple: 'bg-purple-100 text-purple-700',
  museum: 'bg-blue-100 text-blue-700',
  nature: 'bg-green-100 text-green-700',
  food: 'bg-orange-100 text-orange-700',
  shopping: 'bg-pink-100 text-pink-700',
  historic: 'bg-amber-100 text-amber-700',
  entertainment: 'bg-indigo-100 text-indigo-700',
  accommodation: 'bg-teal-100 text-teal-700',
  transport: 'bg-gray-100 text-gray-700',
  other: 'bg-slate-100 text-slate-700',
}
