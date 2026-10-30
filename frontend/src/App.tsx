import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import TripDetail from './pages/TripDetail'
import RouteView from './pages/RouteView'
import AttractionsPage from './pages/Attractions'
import { useAppStore } from './store/useAppStore'
import { cn } from './lib/utils'

export default function App() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main
          className={cn(
            'flex-1 overflow-y-auto transition-all duration-300',
            sidebarOpen ? 'ml-64' : 'ml-16'
          )}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips/:id" element={<TripDetail />} />
            <Route path="/trips/:tripId/routes/:routeId" element={<RouteView />} />
            <Route path="/attractions" element={<AttractionsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
