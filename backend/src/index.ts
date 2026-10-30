import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import planningRoutes from './routes/planning'
import attractionsRoutes from './routes/attractions'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:80'] }))
app.use(express.json())

app.use('/api/planning', planningRoutes)
app.use('/api/attractions', attractionsRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
