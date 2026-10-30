import { Router, Request, Response } from 'express'
import axios from 'axios'

const router = Router()

const COUNTRY_CODES: Record<string, string> = {
  china: 'CN',
  japan: 'JP',
  taiwan: 'TW',
}

router.get('/search', async (req: Request, res: Response) => {
  const { q, country } = req.query as { q: string; country?: string }

  if (!q) {
    res.status(400).json({ error: 'Suchbegriff fehlt' })
    return
  }

  try {
    const params: Record<string, string | number> = {
      q,
      format: 'json',
      limit: 10,
      addressdetails: 1,
      extratags: 1,
      'accept-language': 'de,en',
    }

    if (country && COUNTRY_CODES[country]) {
      params.countrycodes = COUNTRY_CODES[country].toLowerCase()
    }

    const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
      params,
      headers: { 'User-Agent': 'TravelPlanner/1.0 (hakan.oe94@icloud.com)' },
    })

    const results = data.map((item: Record<string, unknown>) => ({
      osm_id: String(item.osm_id),
      name: (item.display_name as string).split(',')[0],
      display_name: item.display_name,
      lat: parseFloat(item.lat as string),
      lng: parseFloat(item.lon as string),
      city: (item.address as Record<string, string>)?.city
        ?? (item.address as Record<string, string>)?.town
        ?? (item.address as Record<string, string>)?.county
        ?? '',
      country: (item.address as Record<string, string>)?.country ?? '',
      type: item.type,
    }))

    res.json(results)
  } catch (err) {
    console.error('Nominatim error:', err)
    res.status(500).json({ error: 'Suche nicht verfügbar' })
  }
})

router.get('/wikipedia', async (req: Request, res: Response) => {
  const { title, lang = 'de' } = req.query as { title: string; lang?: string }

  if (!title) {
    res.status(400).json({ error: 'Titel fehlt' })
    return
  }

  try {
    const { data } = await axios.get(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { 'User-Agent': 'TravelPlanner/1.0' } }
    )

    res.json({
      title: data.title,
      description: data.extract,
      image: data.thumbnail?.source ?? null,
      url: data.content_urls?.desktop?.page ?? null,
    })
  } catch {
    // Fallback auf Englisch wenn Deutsch nicht verfügbar
    if (lang === 'de') {
      try {
        const { data } = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
          { headers: { 'User-Agent': 'TravelPlanner/1.0' } }
        )
        res.json({
          title: data.title,
          description: data.extract,
          image: data.thumbnail?.source ?? null,
          url: data.content_urls?.desktop?.page ?? null,
        })
      } catch {
        res.status(404).json({ error: 'Kein Wikipedia-Artikel gefunden' })
      }
    } else {
      res.status(404).json({ error: 'Kein Wikipedia-Artikel gefunden' })
    }
  }
})

export default router
