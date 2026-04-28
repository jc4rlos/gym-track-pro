import { useState } from 'react'
import { Settings2, Plus, Minus } from 'lucide-react'
import {
  useTodaySteps,
  useStepsHistory,
  useUpsertSteps,
  useStepsGoal,
} from './use-steps'
import { StepsCircle } from './steps-circle'
import { StepsHistoryList } from './steps-history-list'
import { StepsGoalSheet } from './steps-goal-sheet'

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const QUICK_ADD = [500, 1000, 2000, 5000]

export function StepsPage() {
  const { data: todayEntry } = useTodaySteps()
  const { data: history } = useStepsHistory()
  const { data: goal = 10000 } = useStepsGoal()
  const upsert = useUpsertSteps()

  const [showGoal, setShowGoal] = useState(false)
  const [inputVal, setInputVal] = useState('')

  const todaySteps = todayEntry?.steps ?? 0
  const pct = Math.min(Math.round((todaySteps / goal) * 100), 100)

  const save = (steps: number) => {
    const clamped = Math.max(0, steps)
    upsert.mutate({ stepDate: getTodayStr(), steps: clamped })
  }

  const handleManualSave = () => {
    const n = parseInt(inputVal)
    if (!isNaN(n)) {
      save(n)
      setInputVal('')
    }
  }

  return (
    <div className='flex flex-col gap-4 pb-10'>
      <div className='flex items-center justify-between'>
        <h1 className='text-foreground text-[20px] font-bold'>Pasos</h1>
        <button
          onClick={() => setShowGoal(true)}
          className='border-border bg-card flex items-center gap-1.5 rounded-xl border px-3 py-1.5'
        >
          <Settings2 size={14} className='text-muted' />
          <span className='text-muted text-[12px] font-medium'>Meta: {goal.toLocaleString()}</span>
        </button>
      </div>

      <div className='border-border bg-card flex flex-col items-center gap-1 rounded-3xl border p-6'>
        <div className='relative flex items-center justify-center'>
          <StepsCircle steps={todaySteps} goal={goal} size={180} />
          <div className='absolute flex flex-col items-center'>
            <span className='text-foreground text-[36px] font-bold leading-none'>
              {todaySteps.toLocaleString()}
            </span>
            <span className='text-muted text-[12px]'>de {goal.toLocaleString()}</span>
            <span className={`mt-1 text-[13px] font-bold ${pct >= 100 ? 'text-primary' : 'text-muted'}`}>
              {pct}%
            </span>
          </div>
        </div>

        <div className='mt-3 flex gap-2'>
          <button
            onClick={() => save(todaySteps - 100)}
            className='border-border bg-card-dark flex h-9 w-9 items-center justify-center rounded-xl border'
          >
            <Minus size={16} className='text-muted' />
          </button>
          {QUICK_ADD.map((n) => (
            <button
              key={n}
              onClick={() => save(todaySteps + n)}
              className='border-border bg-card-dark text-muted rounded-xl border px-3 py-1.5 text-[12px] font-semibold'
            >
              +{(n / 1000) >= 1 ? `${n / 1000}k` : n}
            </button>
          ))}
          <button
            onClick={() => save(todaySteps + 100)}
            className='border-border bg-card-dark flex h-9 w-9 items-center justify-center rounded-xl border'
          >
            <Plus size={16} className='text-muted' />
          </button>
        </div>

        <div className='mt-3 flex w-full gap-2'>
          <input
            type='number'
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder='Ingresar total exacto...'
            className='border-border bg-background text-foreground placeholder:text-soft flex-1 rounded-xl border px-3 py-2 text-[13px] focus:outline-none'
          />
          <button
            onClick={handleManualSave}
            disabled={!inputVal || upsert.isPending}
            className='bg-primary text-primary-foreground rounded-xl px-4 py-2 text-[13px] font-bold disabled:opacity-50'
          >
            OK
          </button>
        </div>
      </div>

      <div>
        <p className='text-muted mb-2.5 text-[11px] font-semibold tracking-wider uppercase'>
          Últimos 30 días
        </p>
        <StepsHistoryList entries={history ?? []} goal={goal} />
      </div>

      {showGoal && (
        <StepsGoalSheet current={goal} onClose={() => setShowGoal(false)} />
      )}
    </div>
  )
}
