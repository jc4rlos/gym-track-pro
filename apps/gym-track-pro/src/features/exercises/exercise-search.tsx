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
      className='pointer-events-none absolute top-1/2 left-7.5 -translate-y-1/2 text-muted'
    />
    <input
      type='text'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className='w-full rounded-[12px] border border-border bg-card px-10.5 py-3 text-[15px] text-foreground placeholder:text-muted focus:ring-1 focus:ring-primary focus:outline-none'
    />
  </div>
)
