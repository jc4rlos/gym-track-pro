import { Search } from 'lucide-react'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const ExerciseSearch = ({
  value,
  onChange,
  placeholder = 'Buscar ejercicio...',
}: Props) => (
  <div className='relative px-5 py-2.5'>
    <Search
      size={16}
      className='text-muted pointer-events-none absolute top-1/2 left-7.5 -translate-y-1/2'
    />
    <input
      type='text'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className='border-border bg-card text-foreground placeholder:text-muted focus:ring-primary w-full rounded-[12px] border px-10.5 py-3 text-[15px] focus:ring-1 focus:outline-none'
    />
  </div>
)
