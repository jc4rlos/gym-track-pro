export type Intensity = 'low' | 'moderate' | 'high' | 'very_high'

export const INTENSITY_LABELS: Record<Intensity, string> = {
  low: 'Baja',
  moderate: 'Moderada',
  high: 'Alta',
  very_high: 'Máxima',
}

export const INTENSITY_COLORS: Record<Intensity, string> = {
  low: '#22c55e',
  moderate: '#f59e0b',
  high: '#ef4444',
  very_high: '#a855f7',
}

export const INTENSITY_ICONS: Record<Intensity, string> = {
  low: '🟢',
  moderate: '🟡',
  high: '🔴',
  very_high: '⚡',
}

// MET values for resistance/weight training by intensity
const MET_VALUES: Record<Intensity, number> = {
  low: 3.0,
  moderate: 5.0,
  high: 7.0,
  very_high: 9.0,
}

export function calcWorkoutCalories(
  weightKg: number,
  durationMinutes: number,
  intensity: Intensity | string
): number {
  const met = MET_VALUES[(intensity as Intensity)] ?? 5.0
  return Math.round(met * weightKg * (durationMinutes / 60))
}

// ~0.00045 kcal per step per kg of body weight
export function calcStepsCalories(steps: number, weightKg: number): number {
  return Math.round(steps * weightKg * 0.00045)
}
