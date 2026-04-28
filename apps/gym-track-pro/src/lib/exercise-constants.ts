export type MuscleFilterOption = {
  id: string
  label: string
  values: string[]
  group: string
  emoji: string
}

export type MainMuscleOption = {
  id: string
  label: string
  values: string[]
}

export const MAIN_MUSCLE_OPTIONS: MainMuscleOption[] = [
  {
    id: 'chest',
    label: 'Pecho',
    values: ['chest', 'pectorals', 'upper chest'],
  },
  {
    id: 'back',
    label: 'Espalda',
    values: ['lats', 'latissimus dorsi', 'back', 'upper back', 'rhomboids', 'lower back', 'spine', 'traps', 'trapezius'],
  },
  {
    id: 'shoulders',
    label: 'Hombros',
    values: ['shoulders', 'deltoids', 'delts', 'rear deltoids'],
  },
  {
    id: 'biceps',
    label: 'Bíceps',
    values: ['biceps', 'brachialis'],
  },
  {
    id: 'triceps',
    label: 'Tríceps',
    values: ['triceps'],
  },
  {
    id: 'abdominals',
    label: 'Abdominales',
    values: ['abs', 'abdominals', 'lower abs', 'obliques', 'core'],
  },
  {
    id: 'legs',
    label: 'Piernas',
    values: ['quadriceps', 'quads', 'hamstrings', 'glutes', 'hip flexors', 'adductors', 'abductors'],
  },
  {
    id: 'calves',
    label: 'Gemelos',
    values: ['calves', 'soleus'],
  },
]

export type EquipmentFilterOption = {
  value: string
  label: string
  emoji: string
}

export const MUSCLE_GROUPS = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Brazos',
  'Core',
  'Glúteos / Cadera',
  'Piernas',
  'Gemelos',
  'Otros',
] as const

export const MUSCLE_OPTIONS: MuscleFilterOption[] = [
  // Pecho
  {
    id: 'chest',
    label: 'Pecho',
    values: ['chest', 'pectorals', 'upper chest'],
    group: 'Pecho',
    emoji: '💪',
  },
  {
    id: 'serratus',
    label: 'Serrato',
    values: ['serratus anterior'],
    group: 'Pecho',
    emoji: '🫁',
  },
  // Espalda
  {
    id: 'lats',
    label: 'Dorsales',
    values: ['lats', 'latissimus dorsi', 'back'],
    group: 'Espalda',
    emoji: '🔙',
  },
  {
    id: 'upper-back',
    label: 'Espalda alta',
    values: ['upper back', 'rhomboids'],
    group: 'Espalda',
    emoji: '🔼',
  },
  {
    id: 'lower-back',
    label: 'Lumbar',
    values: ['lower back', 'spine'],
    group: 'Espalda',
    emoji: '🔽',
  },
  {
    id: 'traps',
    label: 'Trapecios',
    values: ['traps', 'trapezius'],
    group: 'Espalda',
    emoji: '🦴',
  },
  // Hombros
  {
    id: 'shoulders',
    label: 'Hombros',
    values: ['shoulders', 'deltoids', 'delts'],
    group: 'Hombros',
    emoji: '🏋️',
  },
  {
    id: 'rear-delts',
    label: 'Deltoides post.',
    values: ['rear deltoids'],
    group: 'Hombros',
    emoji: '↩️',
  },
  {
    id: 'rotator',
    label: 'Manguito',
    values: ['rotator cuff'],
    group: 'Hombros',
    emoji: '🔄',
  },
  // Brazos
  {
    id: 'biceps',
    label: 'Bíceps',
    values: ['biceps', 'brachialis'],
    group: 'Brazos',
    emoji: '💪',
  },
  {
    id: 'triceps',
    label: 'Tríceps',
    values: ['triceps'],
    group: 'Brazos',
    emoji: '🦾',
  },
  {
    id: 'forearms',
    label: 'Antebrazos',
    values: [
      'forearms',
      'grip muscles',
      'wrist extensors',
      'wrist flexors',
      'wrists',
      'hands',
    ],
    group: 'Brazos',
    emoji: '🖐️',
  },
  // Core
  {
    id: 'abs',
    label: 'Abdominales',
    values: ['abs', 'abdominals', 'lower abs'],
    group: 'Core',
    emoji: '🧱',
  },
  {
    id: 'obliques',
    label: 'Oblicuos',
    values: ['obliques'],
    group: 'Core',
    emoji: '↔️',
  },
  {
    id: 'core',
    label: 'Core',
    values: ['core'],
    group: 'Core',
    emoji: '🎯',
  },
  // Glúteos / Cadera
  {
    id: 'glutes',
    label: 'Glúteos',
    values: ['glutes'],
    group: 'Glúteos / Cadera',
    emoji: '🍑',
  },
  {
    id: 'hip-flexors',
    label: 'Flexores cadera',
    values: ['hip flexors', 'groin', 'inner thighs'],
    group: 'Glúteos / Cadera',
    emoji: '🔀',
  },
  {
    id: 'adductors',
    label: 'Aductores',
    values: ['adductors', 'abductors'],
    group: 'Glúteos / Cadera',
    emoji: '↕️',
  },
  // Piernas
  {
    id: 'quads',
    label: 'Cuádriceps',
    values: ['quadriceps', 'quads'],
    group: 'Piernas',
    emoji: '🦵',
  },
  {
    id: 'hamstrings',
    label: 'Isquiotibiales',
    values: ['hamstrings'],
    group: 'Piernas',
    emoji: '🔙',
  },
  // Gemelos
  {
    id: 'calves',
    label: 'Gemelos',
    values: ['calves', 'soleus'],
    group: 'Gemelos',
    emoji: '🦶',
  },
  {
    id: 'shins',
    label: 'Tibiales',
    values: ['shins', 'ankles', 'ankle stabilizers', 'feet'],
    group: 'Gemelos',
    emoji: '🦿',
  },
  // Otros
  {
    id: 'cardio',
    label: 'Cardio',
    values: ['cardiovascular system'],
    group: 'Otros',
    emoji: '🫀',
  },
  {
    id: 'neck',
    label: 'Cuello / Escápula',
    values: ['sternocleidomastoid', 'levator scapulae'],
    group: 'Otros',
    emoji: '🔝',
  },
]

export const EQUIPMENT_OPTIONS: EquipmentFilterOption[] = [
  { value: 'body weight', label: 'Peso corporal', emoji: '🤸' },
  { value: 'barbell', label: 'Barra', emoji: '🏋️' },
  { value: 'olympic barbell', label: 'Barra olímpica', emoji: '🥇' },
  { value: 'ez barbell', label: 'Barra EZ', emoji: '〰️' },
  { value: 'trap bar', label: 'Barra hexagonal', emoji: '⬡' },
  { value: 'dumbbell', label: 'Mancuerna', emoji: '🟤' },
  { value: 'kettlebell', label: 'Pesa rusa', emoji: '🫙' },
  { value: 'cable', label: 'Polea', emoji: '🔗' },
  { value: 'resistance band', label: 'Banda elástica', emoji: '〰️' },
  { value: 'band', label: 'Banda', emoji: '🎀' },
  { value: 'leverage machine', label: 'Máquina', emoji: '⚙️' },
  { value: 'smith machine', label: 'Smith', emoji: '🔧' },
  { value: 'sled machine', label: 'Trineo', emoji: '🛷' },
  { value: 'stationary bike', label: 'Bici estática', emoji: '🚴' },
  { value: 'elliptical machine', label: 'Elíptica', emoji: '🔄' },
  { value: 'stepmill machine', label: 'Escaladora', emoji: '📶' },
  { value: 'skierg machine', label: 'SkiErg', emoji: '⛷️' },
  { value: 'upper body ergometer', label: 'Ergómetro', emoji: '🚣' },
  { value: 'stability ball', label: 'Fitball', emoji: '🟡' },
  { value: 'medicine ball', label: 'Balón medicinal', emoji: '⚽' },
  { value: 'bosu ball', label: 'Bosu', emoji: '🔵' },
  { value: 'rope', label: 'Cuerda / TRX', emoji: '🪢' },
  { value: 'roller', label: 'Rodillo foam', emoji: '🟫' },
  { value: 'wheel roller', label: 'Rueda abdominal', emoji: '⭕' },
  { value: 'tire', label: 'Neumático', emoji: '🖤' },
  { value: 'hammer', label: 'Mazo', emoji: '🔨' },
  { value: 'weighted', label: 'Lastrado', emoji: '⚖️' },
  { value: 'assisted', label: 'Asistido', emoji: '🤝' },
]
