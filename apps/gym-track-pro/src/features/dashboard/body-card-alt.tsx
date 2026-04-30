import { useState } from 'react'
import Body, { type ExtendedBodyPart, type Slug } from '@mjcdev/react-body-highlighter'
import { cn } from '@/lib/utils'

const DEFAULT_PRIMARY = '#0984e3'
const DEFAULT_SECONDARY = '#a3e635'

type Props = {
  weekMuscleSlugs: Set<string>
  todayMuscleSlugs: Set<string>
  gender?: 'male' | 'female' | 'other' | null
  primaryColor?: string | null
  secondaryColor?: string | null
}

const DB_SLUG_TO_BODY: Record<string, Slug[]> = {
  chest: ['chest'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  abs: ['abs'],
  obliques: ['obliques'],
  quadriceps: ['quadriceps'],
  shoulders: ['deltoids'],
  forearms: ['forearm'],
  back: ['upper-back', 'lower-back'],
  traps: ['trapezius'],
  lats: ['upper-back'],
  glutes: ['gluteal'],
  hamstrings: ['hamstring'],
  calves: ['calves'],
}

export function BodyCardAlt({ weekMuscleSlugs, todayMuscleSlugs, gender, primaryColor, secondaryColor }: Props) {
  const bodyGender: 'male' | 'female' = gender === 'female' ? 'female' : 'male'
  const colorToday = primaryColor ?? DEFAULT_PRIMARY
  const colorWeek = secondaryColor ?? DEFAULT_SECONDARY
  const [side, setSide] = useState<'front' | 'back'>('front')

  const bodyParts: ExtendedBodyPart[] = []
  const seen = new Set<Slug>()

  // intensity es índice 1-based en el array colors del Body
  // intensity:1 → colors[0] → verde (hoy)
  // intensity:2 → colors[1] → naranja (esta semana)
  for (const dbSlug of todayMuscleSlugs) {
    for (const slug of DB_SLUG_TO_BODY[dbSlug] ?? []) {
      if (!seen.has(slug)) {
        seen.add(slug)
        bodyParts.push({ slug, intensity: 1 })
      }
    }
  }

  for (const dbSlug of weekMuscleSlugs) {
    for (const slug of DB_SLUG_TO_BODY[dbSlug] ?? []) {
      if (!seen.has(slug)) {
        seen.add(slug)
        bodyParts.push({ slug, intensity: 2 })
      }
    }
  }

  return (
    <div className='bg-card-dark rounded-[20px] border border-[#1e1e1e] p-3.5'>
      <div className='mb-2.5 flex items-center justify-between'>
        <span className='text-foreground text-[13px] font-bold'>
          Músculos esta semana
        </span>
        <div className='flex rounded-full bg-[#1a1a1a] p-0.5'>
          <button
            onClick={() => setSide('front')}
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
              side === 'front'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted'
            )}
          >
            Frente
          </button>
          <button
            onClick={() => setSide('back')}
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
              side === 'back'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted'
            )}
          >
            Espalda
          </button>
        </div>
      </div>

      <div className='flex justify-center py-2'>
        <Body
          data={bodyParts}
          colors={[colorToday, colorWeek]}
          side={side}
          scale={1.0}
          gender={bodyGender}
        />
      </div>

      <div className='mt-1.5 flex gap-3.5 border-t border-[#1e1e1e] pt-2.5'>
        <div className='text-muted flex items-center gap-1.5 text-[11px]'>
          <div className='h-2.5 w-2.5 shrink-0 rounded-xs' style={{ background: colorToday }} />
          Hoy
        </div>
        <div className='text-muted flex items-center gap-1.5 text-[11px]'>
          <div className='h-2.5 w-2.5 shrink-0 rounded-xs' style={{ background: colorWeek }} />
          Esta semana
        </div>
        <div className='text-muted flex items-center gap-1.5 text-[11px]'>
          <div className='h-2.5 w-2.5 shrink-0 rounded-xs border border-[#333]' />
          Sin entrenar
        </div>
      </div>
    </div>
  )
}
