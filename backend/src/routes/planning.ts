import { Router, Request, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface Attraction {
  id: string
  name: string
  city: string
  lat: number
  lng: number
  category: string
  duration_hours?: number
}

interface PlanRequest {
  trip: {
    name: string
    country: string
    start_date: string
    end_date: string
    total_days: number
  }
  group: Array<{ name: string; age?: number }>
  attractions: Attraction[]
}

router.post('/suggest', async (req: Request, res: Response) => {
  const { trip, group, attractions } = req.body as PlanRequest

  if (!attractions?.length) {
    res.status(400).json({ error: 'Keine Attraktionen angegeben' })
    return
  }

  const groupDesc = group.length
    ? group.map(m => `${m.name}${m.age ? ` (${m.age} Jahre)` : ''}`).join(', ')
    : 'Alleinreisend'

  const attractionsList = attractions
    .map(a => `- ${a.name} (${a.city}, Kategorie: ${a.category}, ca. ${a.duration_hours ?? 2}h)`)
    .join('\n')

  const prompt = `Du bist ein erfahrener Reiseplaner für Asien. Erstelle einen detaillierten Tagesplan für folgende Reise:

**Reise:** ${trip.name}
**Land:** ${trip.country}
**Zeitraum:** ${trip.start_date} bis ${trip.end_date} (${trip.total_days} Tage)
**Reisegruppe:** ${groupDesc}

**Geplante Attraktionen:**
${attractionsList}

Erstelle einen optimierten Tagesplan. Berücksichtige:
- Geografische Nähe der Attraktionen (kurze Wege)
- Sinnvolle Reihenfolge (z.B. Märkte morgens, Tempel mittags, Abendessen abends)
- Reisezeit zwischen Städten (eigene Reisetage einplanen)
- Öffnungszeiten und beste Besuchszeiten

Antworte ausschließlich als JSON in diesem Format:
{
  "stages": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Titel des Tages",
      "location": "Hauptort",
      "attractions": ["Attraction ID 1", "Attraction ID 2"],
      "notes": "Hinweise für den Tag",
      "transport": "Transportmittel zum nächsten Tag"
    }
  ],
  "summary": "Kurze Zusammenfassung der Gesamtroute"
}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      res.status(500).json({ error: 'Ungültige Antwort vom Planungs-Service' })
      return
    }

    res.json(JSON.parse(jsonMatch[0]))
  } catch (err) {
    console.error('Planning error:', err)
    res.status(500).json({ error: 'Planungs-Service nicht verfügbar' })
  }
})

export default router
