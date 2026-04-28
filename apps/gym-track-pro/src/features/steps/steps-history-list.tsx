type Entry = { id: string; steps: number; step_date: string }

type Props = {
  entries: Entry[]
  goal: number
}

const DAY_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function dayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return DAY_ES[d.getDay()]
}

function shortDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function StepsHistoryList({ entries, goal }: Props) {
  if (entries.length === 0) {
    return (
      <p className='text-muted py-6 text-center text-[13px]'>
        Sin registros aún
      </p>
    )
  }

  return (
    <div className='flex flex-col gap-2'>
      {entries.map((entry) => {
        const pct = Math.min(entry.steps / goal, 1)
        const reached = entry.steps >= goal
        return (
          <div
            key={entry.id}
            className='border-border bg-card flex items-center gap-3 rounded-2xl border px-4 py-3'
          >
            <div className='w-10 shrink-0 text-center'>
              <p className='text-foreground text-[11px] font-bold'>{dayLabel(entry.step_date)}</p>
              <p className='text-muted text-[10px]'>{shortDate(entry.step_date)}</p>
            </div>

            <div className='min-w-0 flex-1'>
              <div className='bg-card-dark mb-1.5 h-2 overflow-hidden rounded-full'>
                <div
                  className={`h-full rounded-full transition-all ${reached ? 'bg-primary' : 'bg-primary/50'}`}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
              <p className='text-muted text-[11px]'>
                {entry.steps.toLocaleString()} / {goal.toLocaleString()} pasos
              </p>
            </div>

            <p className={`shrink-0 text-[13px] font-bold ${reached ? 'text-primary' : 'text-muted'}`}>
              {Math.round(pct * 100)}%
            </p>
          </div>
        )
      })}
    </div>
  )
}
