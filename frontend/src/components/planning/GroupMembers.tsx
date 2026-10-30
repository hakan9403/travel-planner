import { User } from 'lucide-react'
import type { GroupMember } from '../../types'

interface GroupMembersProps {
  members: GroupMember[]
}

export default function GroupMembers({ members }: GroupMembersProps) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic">Keine Reisegruppe definiert.</p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {members.map((m) => (
        <div
          key={m.id}
          className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5"
        >
          <div className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold">
            {m.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-slate-800">{m.name}</span>
          {m.age && <span className="text-xs text-slate-500">{m.age} J.</span>}
        </div>
      ))}
    </div>
  )
}
