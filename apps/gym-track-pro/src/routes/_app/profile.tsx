import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { useTheme } from '@/context/theme-provider'
import { useDashboardData } from '@/features/dashboard/use-dashboard'
import {
  calcBmi,
  getBmiCategory,
  BMI_LABELS,
  BMI_COLORS,
} from '@/features/profile/bmi-utils'
import {
  useProfile,
  useBodyMeasurements,
  useSessionStats,
} from '@/features/profile/use-body'

const GENDER_LABEL: Record<string, string> = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',
}

const GOAL_LABEL: Record<string, string> = {
  lose_weight: 'Bajar de peso',
  gain_muscle: 'Ganar músculo',
  maintain: 'Mantener peso',
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className='relative h-6.5 w-11 rounded-full'
      style={{ background: on ? '#a3e635' : '#2a2a2a' }}
    >
      <div
        className='absolute top-0.75 h-5 w-5 rounded-full bg-[#0f0f0f]'
        style={{ [on ? 'right' : 'left']: '3px' }}
      />
    </div>
  )
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const { signOut } = useAuthStore()
  const { data: profile } = useProfile()
  const { data: measurements = [] } = useBodyMeasurements()
  const { data: stats } = useSessionStats()
  const dash = useDashboardData()

  const [notifs, setNotifs] = useState(true)
  const { isDark, toggleTheme } = useTheme()

  const latestWeight = measurements[0]?.weight_kg ?? profile?.weight_kg ?? null
  const heightCm = profile?.height_cm ?? null

  const bmi = latestWeight && heightCm ? calcBmi(latestWeight, heightCm) : null
  const category = bmi ? getBmiCategory(bmi) : null
  const bmiColor = category ? BMI_COLORS[category] : '#737373'
  const bmiLabel = category ? BMI_LABELS[category] : null

  const fullName = profile?.full_name ?? 'Usuario'
  const initial = fullName.charAt(0).toUpperCase()
  const email = useAuthStore((s) => s.user?.email) ?? ''
  const streak = dash.streak

  return (
    <div className='flex flex-col gap-0 pb-10'>
      {/* Header */}
      <div className='flex items-center gap-3.5 px-0 pt-1 pb-4'>
        <div className='flex h-15.5 w-15.5 shrink-0 items-center justify-center rounded-full bg-primary text-[26px] font-bold text-primary-foreground'>
          {initial}
        </div>
        <div className='flex-1'>
          <p className='text-[19px] font-bold text-foreground'>{fullName}</p>
          <p className='text-[12px] text-muted'>{email}</p>
          <div className='mt-2 flex gap-1.5'>
            {streak > 0 && (
              <span
                className='rounded-full px-2.5 py-0.5 text-[11px] font-bold text-primary'
                style={{ background: '#111d00', border: '1px solid #2a4a1a' }}
              >
                🔥 {streak} {streak === 1 ? 'día' : 'días'}
              </span>
            )}
            {stats && stats.totalSessions > 0 && (
              <span
                className='rounded-full px-2.5 py-0.5 text-[11px] text-muted'
                style={{ background: '#131313', border: '1px solid #1e1e1e' }}
              >
                {stats.totalSessions} sesiones
              </span>
            )}
          </div>
        </div>
        <button className='flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#1a1a1a]'>
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#f5f5f5'
            strokeWidth='2'
            strokeLinecap='round'
          >
            <path d='M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7' />
            <path d='M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' />
          </svg>
        </button>
      </div>

      {/* Datos físicos */}
      <div className='bg-card-dark mb-3 overflow-hidden rounded-[16px] border border-[#1e1e1e]'>
        <p className='border-b border-[#1e1e1e] px-4 py-3 text-[11px] font-bold tracking-[.07em] text-muted uppercase'>
          Datos físicos
        </p>
        {/* Género */}
        <div className='border-card-dark flex items-center justify-between border-b px-4 py-3.5'>
          <div className='flex items-center gap-2.5'>
            <span className='text-[17px]'>⚥</span>
            <span className='text-[14px] text-foreground'>Género</span>
          </div>
          <span className='text-[13px] text-muted'>
            {GENDER_LABEL[profile?.gender ?? ''] ?? '—'}
          </span>
        </div>
        {/* Altura */}
        <div className='border-card-dark flex items-center justify-between border-b px-4 py-3.5'>
          <div className='flex items-center gap-2.5'>
            <span className='text-[17px]'>📏</span>
            <span className='text-[14px] text-foreground'>Altura</span>
          </div>
          <span className='text-[13px] text-muted'>
            {heightCm ? `${heightCm} cm` : '—'}
          </span>
        </div>
        {/* Peso actual → navigates to body */}
        <button
          className='border-card-dark flex w-full items-center justify-between border-b px-4 py-3.5'
          onClick={() => navigate({ to: '/body' })}
        >
          <div className='flex items-center gap-2.5'>
            <span className='text-[17px]'>⚖️</span>
            <span className='text-[14px] text-foreground'>Peso actual</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='text-[13px] font-bold text-primary'>
              {latestWeight ? `${latestWeight} kg` : '—'}
            </span>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#737373'
              strokeWidth='2'
              strokeLinecap='round'
            >
              <polyline points='9 18 15 12 9 6' />
            </svg>
          </div>
        </button>
        {/* IMC → navigates to body */}
        <button
          className='flex w-full items-center justify-between border-b border-[#131313] px-4 py-3.5'
          onClick={() => navigate({ to: '/body' })}
        >
          <div className='flex items-center gap-2.5'>
            <span className='text-[17px]'>📊</span>
            <span className='text-[14px] text-foreground'>IMC</span>
          </div>
          <div className='flex items-center gap-1.5'>
            {bmi ? (
              <>
                <span className='text-[13px] font-bold text-primary'>
                  {bmi.toFixed(1)}
                </span>
                {bmiLabel && (
                  <span
                    className='rounded-full px-2 py-0.5 text-[11px]'
                    style={{
                      color: bmiColor,
                      background: '#111d00',
                      border: `1px solid ${bmiColor}40`,
                    }}
                  >
                    {bmiLabel.replace(' ✓', '')}
                  </span>
                )}
              </>
            ) : (
              <span className='text-[13px] text-muted'>—</span>
            )}
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#737373'
              strokeWidth='2'
              strokeLinecap='round'
            >
              <polyline points='9 18 15 12 9 6' />
            </svg>
          </div>
        </button>
        {/* Objetivo */}
        <div className='flex items-center justify-between px-4 py-3.5'>
          <div className='flex items-center gap-2.5'>
            <span className='text-[17px]'>🎯</span>
            <span className='text-[14px] text-foreground'>Objetivo</span>
          </div>
          <span className='text-[13px] text-muted'>
            {GOAL_LABEL[profile?.goal ?? ''] ?? '—'}
          </span>
        </div>
      </div>

      {/* IMC CTA */}
      <button
        className='mb-3 flex w-full items-center justify-between rounded-[16px] px-4 py-4'
        style={{
          background: 'linear-gradient(135deg,#111d00,#0a1200)',
          border: '1px solid #2a4a1a',
        }}
        onClick={() => navigate({ to: '/body' })}
      >
        <div className='flex items-center gap-3'>
          <span className='text-[28px]'>📊</span>
          <div className='text-left'>
            <p className='text-[13px] font-bold text-primary'>
              IMC y composición corporal
            </p>
            <p className='text-[11px] text-[#4a7a4a]'>
              {bmi
                ? `IMC ${bmi.toFixed(1)} · ${bmiLabel?.replace(' ✓', '')}`
                : 'Ver análisis completo'}
            </p>
          </div>
        </div>
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#a3e635'
          strokeWidth='2'
          strokeLinecap='round'
        >
          <polyline points='9 18 15 12 9 6' />
        </svg>
      </button>

      {/* Estadísticas */}
      <div className='bg-card-dark mb-3 overflow-hidden rounded-[16px] border border-[#1e1e1e]'>
        <p className='border-b border-[#1e1e1e] px-4 py-3 text-[11px] font-bold tracking-[.07em] text-muted uppercase'>
          Estadísticas
        </p>
        <div className='divide-card-dark flex divide-x'>
          <div className='flex flex-1 flex-col items-center py-3.5'>
            <p className='font-display text-[30px] text-primary'>
              {stats?.totalSessions ?? 0}
            </p>
            <p className='text-[11px] text-muted'>sesiones</p>
          </div>
          <div className='flex flex-1 flex-col items-center py-3.5'>
            <p className='font-display text-[30px] text-foreground'>
              {stats?.weeks ?? 0}
            </p>
            <p className='text-[11px] text-muted'>semanas</p>
          </div>
          <div className='flex flex-1 flex-col items-center py-3.5'>
            <p className='font-display text-[30px] text-primary'>🔥{streak}</p>
            <p className='text-[11px] text-muted'>racha días</p>
          </div>
        </div>
      </div>

      {/* Ajustes */}
      <div className='bg-card-dark mb-3 overflow-hidden rounded-[16px] border border-[#1e1e1e]'>
        <p className='border-b border-[#1e1e1e] px-4 py-3 text-[11px] font-bold tracking-[.07em] text-muted uppercase'>
          Ajustes
        </p>
        <button
          className='flex w-full items-center justify-between border-b border-[#131313] px-4 py-3.5'
          onClick={() => setNotifs((v) => !v)}
        >
          <div className='flex items-center gap-2.5'>
            <span className='text-[17px]'>🔔</span>
            <span className='text-[14px] text-foreground'>Notificaciones</span>
          </div>
          <Toggle on={notifs} />
        </button>
        <button
          className='flex w-full items-center justify-between border-b border-[#131313] px-4 py-3.5'
          onClick={toggleTheme}
        >
          <div className='flex items-center gap-2.5'>
            <span className='text-[17px]'>🌙</span>
            <span className='text-[14px] text-foreground'>Tema oscuro</span>
          </div>
          <Toggle on={isDark} />
        </button>
        <div className='flex items-center justify-between px-4 py-3.5'>
          <div className='flex items-center gap-2.5'>
            <span className='text-[17px]'>🌐</span>
            <span className='text-[14px] text-foreground'>Idioma</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='text-[13px] text-muted'>Español</span>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#737373'
              strokeWidth='2'
              strokeLinecap='round'
            >
              <polyline points='9 18 15 12 9 6' />
            </svg>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className='w-full rounded-[14px] py-3.5 text-[14px] font-bold text-[#f87171]'
        style={{ background: '#1a0808', border: '1px solid #3a1515' }}
      >
        Cerrar sesión
      </button>

      {/* Version */}
      <div className='bg-card-dark mt-2 rounded-[14px] border border-[#1e1e1e] py-3 text-center'>
        <p className='text-[11px] text-[#3a3a3a]'>
          GymTrack Pro v2.0.0 · PWA · React + Supabase
        </p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
})
