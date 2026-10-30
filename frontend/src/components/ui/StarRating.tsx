import { Star } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StarRatingProps {
  value: number | null
  onChange?: (value: number) => void
  readOnly?: boolean
}

export default function StarRating({ value, onChange, readOnly }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange?.(star)}
          disabled={readOnly}
          className={cn('p-0.5 rounded', !readOnly && 'hover:scale-110 transition-transform')}
          aria-label={`${star} Sterne`}
        >
          <Star
            className={cn(
              'w-4 h-4',
              (value ?? 0) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            )}
          />
        </button>
      ))}
    </div>
  )
}
