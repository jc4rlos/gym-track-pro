import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { BmiSilhouette } from '@/features/profile/bmi-silhouette'
import {
  calcBmi,
  getBmiCategory,
  BMI_LABELS,
  BMI_COLORS,
  BMI_SCALE_COLOR,
  getBmiScalePercent,
  calcIdealWeight,
  calcTMB,
  calcTDEE,
  getAgeFromBirthDate,
  getGoalCalories,
} from '@/features/profile/bmi-utils'
import {
  useProfile,
  useBodyMeasurements,
  useSaveMeasurement,
} from '@/features/profile/use-body'
import { WeightChart } from '@/features/profile/weight-chart'

const BodyPage = () => {
  const router = useRouter()
  const { data: profile } = useProfile()
  const { data: measurements = [] } = useBodyMeasurements()
  const saveMeasurement = useSaveMeasurement()

  const [weightInput, setWeightInput] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const latestWeight = measurements[0]?.weight_kg ?? profile?.weight_kg ?? null
  const heightCm = profile?.height_cm ?? null
  const gender = profile?.gender ?? 'male'
  const isFemale = gender === 'female'

  const bmi = latestWeight && heightCm ? calcBmi(latestWeight, heightCm) : null
  const category = bmi ? getBmiCategory(bmi) : 'normal'
  const color = BMI_COLORS[category]
  const scalePercent = bmi ? getBmiScalePercent(bmi) : null

  const age = getAgeFromBirthDate(profile?.birth_date ?? null)
  const tmb =
    latestWeight && heightCm
      ? calcTMB(latestWeight, heightCm, age, isFemale)
      : null
  const tdee = tmb ? calcTDEE(tmb, profile?.activity_level ?? null) : null
  const idealWeight = heightCm ? calcIdealWeight(heightCm, isFemale) : null
  const goalCal = tdee ? getGoalCalories(tdee, profile?.goal ?? null) : null

  const lastMeasuredDate = measurements[0]?.measured_at
    ? new Date(measurements[0].measured_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Sin datos aún'

  const handleSave = async () => {
    const w = parseFloat(weightInput.replace(',', '.'))
    if (isNaN(w) || w < 20 || w > 300) {
      setSaveError('Peso inválido (20–300 kg)')
      return
    }
    if (!heightCm) {
      setSaveError('Actualizá tu altura en el perfil primero')
      return
    }
    setSaveError(null)
    const newBmi = calcBmi(w, heightCm)
    await saveMeasurement.mutateAsync({ weightKg: w, heightCm, bmi: newBmi })
    setWeightInput('')
  }

  return (
    <div className='flex flex-col gap-3.5 pb-10'>
      <div className='flex items-center gap-2'>
        <button
          onClick={() => router.history.back()}
          className='flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1a]'
        >
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
          >
            <polyline points='15 18 9 12 15 6' />
          </svg>
        </button>
        <h1 className='text-foreground text-[20px] font-bold'>Mi cuerpo</h1>
      </div>

      {/* IMC Hero */}
      {bmi && (
        <div
          className='rounded-[20px] border p-4.5'
          style={{
            background: 'linear-gradient(135deg,#111d00,#0a1200)',
            borderColor: '#2a4a1a',
          }}
        >
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-[11px] font-semibold tracking-wide text-[#4a7a4a] uppercase'>
                Índice de Masa Corporal
              </p>
              <p className='font-display text-primary mt-1 text-[54px] leading-none'>
                {bmi.toFixed(1)}
              </p>
              <div className='mt-1 flex items-center gap-2'>
                <div
                  className='h-2 w-2 rounded-full'
                  style={{ background: color }}
                />
                <span className='text-[14px] font-bold' style={{ color }}>
                  {BMI_LABELS[category]}
                </span>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-foreground text-[26px] font-bold'>
                {latestWeight} kg
              </p>
              {heightCm && (
                <p className='text-muted text-[13px]'>{heightCm} cm</p>
              )}
              <p className='mt-1 text-[11px] text-[#4a7a4a]'>
                {measurements.length > 0
                  ? `Actualizado ${lastMeasuredDate}`
                  : 'Sin medición'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BMI scale */}
      {scalePercent !== null && (
        <div className='rounded-[16px] border border-[#1e1e1e] bg-[#131313] p-3.5'>
          <div className='text-muted mb-2 flex justify-between text-[10px]'>
            <span>Bajo peso</span>
            <span>Normal</span>
            <span>Sobrepeso</span>
            <span>Obesidad</span>
          </div>
          <div className='relative h-2 w-full overflow-visible rounded-full'>
            <div
              className='h-full w-full rounded-full'
              style={{ background: BMI_SCALE_COLOR }}
            />
            <div
              className='absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#131313] bg-white'
              style={{ left: `${scalePercent}%` }}
            />
          </div>
          <div className='mt-1.5 flex justify-between text-[9px] text-[#3a3a3a]'>
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>40</span>
          </div>
        </div>
      )}

      {/* Silhouette + stats */}
      {bmi && (
        <div className='flex gap-3'>
          <div className='flex min-w-[120px] flex-col items-center gap-2 rounded-[16px] border border-[#1e1e1e] bg-[#131313] p-3'>
            <p className='text-muted text-[11px]'>Silueta estimada</p>
            <BmiSilhouette category={category} gender={gender} size={72} />
            <p
              className='text-center text-[10px] leading-tight font-semibold'
              style={{ color: '#4a7a4a' }}
            >
              IMC {bmi.toFixed(1)}
              <br />
              {BMI_LABELS[category]}
            </p>
          </div>

          <div className='flex flex-1 flex-col gap-2'>
            {idealWeight && (
              <div className='rounded-[12px] border border-[#1e1e1e] bg-[#131313] px-3 py-2.5'>
                <p className='text-muted text-[10px]'>Peso ideal</p>
                <p className='text-foreground mt-0.5 text-[16px] font-bold'>
                  {idealWeight[0]} – {idealWeight[1]} kg
                </p>
              </div>
            )}
            {tmb && (
              <div className='rounded-[12px] border border-[#1e1e1e] bg-[#131313] px-3 py-2.5'>
                <p className='text-muted text-[10px]'>TMB en reposo</p>
                <p className='text-primary mt-0.5 text-[16px] font-bold'>
                  {tmb.toLocaleString('es-ES')} cal
                </p>
              </div>
            )}
            {tdee && (
              <div className='rounded-[12px] border border-[#1e1e1e] bg-[#131313] px-3 py-2.5'>
                <p className='text-muted text-[10px]'>TDEE activo</p>
                <p className='text-foreground mt-0.5 text-[16px] font-bold'>
                  {tdee.toLocaleString('es-ES')} cal
                </p>
              </div>
            )}
            {goalCal && (
              <div
                className='rounded-[12px] px-3 py-2.5'
                style={{ background: '#111d00', border: '1px solid #2a4a1a' }}
              >
                <p className='text-[10px] text-[#4a7a4a]'>Objetivo</p>
                <p className='text-primary mt-0.5 text-[13px] font-bold'>
                  {goalCal.label}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!bmi && (
        <div className='border-border bg-card rounded-[16px] border p-6 text-center'>
          <p className='text-foreground text-[16px] font-bold'>
            Sin datos de cuerpo
          </p>
          <p className='text-muted mt-1 text-[13px]'>
            Completá tu peso y altura en el onboarding para ver tu IMC.
          </p>
        </div>
      )}

      {/* Update weight */}
      <div className='border-border bg-card rounded-[16px] border p-3.5'>
        <p className='text-muted mb-2.5 text-[11px] font-semibold tracking-wide uppercase'>
          Actualizar peso
        </p>
        <div className='flex gap-2.5'>
          <input
            type='number'
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder={latestWeight ? `${latestWeight}` : '78.0'}
            className='placeholder:text-soft border-border text-foreground focus:border-primary/60 flex-1 rounded-xl border bg-[#1a1a1a] px-4 py-3 text-center text-[26px] font-bold focus:outline-none'
            step={0.1}
            min={20}
            max={300}
          />
          <div className='text-muted flex items-center rounded-xl bg-[#252525] px-4 text-[15px] font-semibold'>
            kg
          </div>
        </div>
        {saveError && (
          <p className='text-destructive mt-2 text-[12px]'>{saveError}</p>
        )}
        <button
          onClick={handleSave}
          disabled={saveMeasurement.isPending || !weightInput}
          className='bg-primary text-primary-foreground mt-3 w-full rounded-[14px] py-3.5 text-[15px] font-bold disabled:opacity-60'
        >
          {saveMeasurement.isPending ? 'Guardando...' : 'Guardar medición'}
        </button>
      </div>

      {/* Weight history chart */}
      {measurements.length >= 2 && (
        <div>
          <p className='text-muted mb-2.5 text-[11px] font-semibold tracking-wide uppercase'>
            Historial de peso
          </p>
          <WeightChart measurements={measurements} />
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/_app/body')({ component: BodyPage })
