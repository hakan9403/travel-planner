import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MapPin, Globe, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/attractions', icon: MapPin, label: 'Attraktionen' },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-slate-900 text-white flex flex-col transition-all duration-300 z-10',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-slate-700">
        <Globe className="w-7 h-7 text-sky-400 shrink-0" />
        {sidebarOpen && (
          <span className="ml-3 font-semibold text-lg tracking-tight truncate">
            Travel Planner
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-10 mx-2 mb-4 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        aria-label="Sidebar umschalten"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>
    </aside>
  )
}
