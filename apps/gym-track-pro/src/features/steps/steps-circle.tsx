type Props = {
  steps: number
  goal: number
  size?: number
}

export function StepsCircle({ steps, goal, size = 160 }: Props) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(steps / goal, 1)
  const offset = circumference * (1 - pct)
  const cx = size / 2

  return (
    <svg width={size} height={size} className='-rotate-90'>
      <circle
        cx={cx}
        cy={cx}
        r={radius}
        fill='none'
        stroke='currentColor'
        strokeWidth={8}
        className='text-card-dark'
      />
      <circle
        cx={cx}
        cy={cx}
        r={radius}
        fill='none'
        stroke='currentColor'
        strokeWidth={8}
        strokeLinecap='round'
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className='text-primary transition-all duration-500'
      />
    </svg>
  )
}
