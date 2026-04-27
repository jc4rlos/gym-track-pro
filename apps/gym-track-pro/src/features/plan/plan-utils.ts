export function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const w1 = new Date(d.getFullYear(), 0, 4)
  const week =
    1 +
    Math.round(
      ((d.getTime() - w1.getTime()) / 86400000 -
        3 +
        ((w1.getDay() + 6) % 7)) /
        7
    )
  return { week, year: d.getFullYear() }
}

export function todayDayOfWeek() {
  return (new Date().getDay() + 6) % 7
}

export const DAY_LABELS = [
  { short: 'L', label: 'Lunes' },
  { short: 'M', label: 'Martes' },
  { short: 'X', label: 'Miércoles' },
  { short: 'J', label: 'Jueves' },
  { short: 'V', label: 'Viernes' },
  { short: 'S', label: 'Sábado' },
  { short: 'D', label: 'Domingo' },
]
