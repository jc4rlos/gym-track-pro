type Measurement = {
  weight_kg: number | null
  measured_at: string
}

type Props = {
  measurements: Measurement[]
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export const WeightChart = ({ measurements }: Props) => {
  // Show last 6, oldest first
  const data = [...measurements]
    .filter((m) => m.weight_kg !== null)
    .slice(0, 6)
    .reverse() as (Omit<Measurement, 'weight_kg'> & { weight_kg: number })[]

  if (data.length < 2) return null

  const weights = data.map((d) => d.weight_kg)
  const minW = Math.min(...weights) - 0.5
  const maxW = Math.max(...weights) + 0.5
  const range = maxW - minW || 1

  const first = weights[0]
  const last = weights[weights.length - 1]
  const diff = Math.round((last - first) * 10) / 10
  const diffLabel =
    diff > 0
      ? `+${diff} kg este período`
      : diff < 0
        ? `${diff} kg este período`
        : 'Sin cambio'
  const diffColor = diff < 0 ? '#a3e635' : diff > 0 ? '#f97316' : '#737373'

  return (
    <div className='rounded-[16px] border border-[#1e1e1e] bg-[#131313] p-3.5'>
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-muted text-[11px] font-medium'>
          Últimas mediciones
        </span>
        <span
          className='text-[12px] font-semibold'
          style={{ color: diffColor }}
        >
          {diffLabel}
        </span>
      </div>

      {/* Bar chart */}
      <div className='flex items-end gap-2' style={{ height: 64 }}>
        {data.map((m, i) => {
          const isLast = i === data.length - 1
          const barH = Math.max(
            8,
            Math.round(((m.weight_kg - minW) / range) * 52)
          )
          return (
            <div key={i} className='flex flex-1 flex-col items-center gap-1'>
              <div
                className='w-full rounded-t-sm'
                style={{
                  height: barH,
                  background: '#a3e635',
                  opacity: isLast ? 1 : 0.3 + (i / data.length) * 0.5,
                  borderRadius: '3px 3px 0 0',
                }}
              />
              <span
                className='text-[9px]'
                style={{
                  color: isLast ? '#a3e635' : '#4a4a4a',
                  fontWeight: isLast ? 600 : 400,
                }}
              >
                {fmtDate(m.measured_at)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Values row */}
      <div className='mt-1.5 flex justify-between'>
        {data.map((m, i) => {
          const isLast = i === data.length - 1
          return (
            <span
              key={i}
              className='flex-1 text-center text-[11px]'
              style={{
                color: isLast ? '#a3e635' : '#737373',
                fontWeight: isLast ? 600 : 400,
              }}
            >
              {m.weight_kg.toFixed(1)}
            </span>
          )
        })}
      </div>
    </div>
  )
}
