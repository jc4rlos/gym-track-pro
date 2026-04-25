import { useEffect, useState } from 'react'

export const SplashScreen = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Animate from 0 to ~90 quickly, then stall — real load finishes it
    const steps = [
      { target: 30, delay: 80 },
      { target: 55, delay: 160 },
      { target: 75, delay: 280 },
      { target: 88, delay: 500 },
    ]
    const timers: ReturnType<typeof setTimeout>[] = []
    for (const { target, delay } of steps) {
      timers.push(
        setTimeout(() => {
          setProgress(target)
        }, delay)
      )
    }
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]'>
      {/* Logo icon */}
      <div
        className='mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-[26px] text-[44px]'
        style={{
          background: '#a3e635',
          boxShadow: '0 0 48px rgba(163,230,53,0.25)',
        }}
      >
        💪
      </div>

      {/* Wordmark */}
      <p className='font-display text-foreground text-[44px] leading-none'>
        GymTrack
      </p>
      <p className='font-display text-primary mb-2.5 text-[44px] leading-none'>
        Pro
      </p>

      {/* Tagline */}
      <p className='mb-12 text-[13px] text-[#4a4a4a]'>Tu cuerpo, tu récord</p>

      {/* Progress bar */}
      <div className='w-[200px]'>
        <div className='mb-2 flex justify-between text-[11px]'>
          <span className='text-[#4a4a4a]'>Cargando...</span>
          <span className='text-primary font-semibold'>{progress}%</span>
        </div>
        <div className='h-[6px] w-full overflow-hidden rounded-full bg-[#1a1a1a]'>
          <div
            className='h-full rounded-full transition-all duration-300 ease-out'
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg,#65a30d,#a3e635)',
            }}
          />
        </div>
      </div>

      {/* Version */}
      <p className='absolute bottom-9 text-[11px] text-[#2a2a2a]'>
        v2.0.0 · PWA
      </p>
    </div>
  )
}
