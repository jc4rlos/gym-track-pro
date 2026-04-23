#!/usr/bin/env node
/**
 * Genera exercises-seed.sql desde exercises.json (exercisedb.dev)
 * Uso: node generate-exercises-sql.js
 * Output: exercises-seed.sql (ejecutar en Supabase SQL editor)
 */

const fs = require('fs')
const path = require('path')

// ─── Mapeo targetMuscle → slug de muscle_groups ──────────────────────────────
const TARGET_TO_SLUG = {
  abs: 'abs',
  biceps: 'biceps',
  calves: 'calves',
  'cardiovascular system': null, // no tiene grupo muscular
  delts: 'shoulders',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  lats: 'lats',
  pectorals: 'chest',
  quads: 'quadriceps',
  spine: 'back',
  triceps: 'triceps',
  abductors: 'glutes', // más cercano disponible
  forearms: 'forearms',
  traps: 'traps',
  obliques: 'obliques',
  'upper back': 'back',
  'lower back': 'back',
  'hip flexors': 'abs',
}

// ─── Traducción de bodyPart (label display en ES) ────────────────────────────
const BODY_PART_ES = {
  back: 'espalda',
  cardio: 'cardio',
  chest: 'pecho',
  'lower arms': 'antebrazos',
  'lower legs': 'pantorrillas',
  neck: 'cuello',
  shoulders: 'hombros',
  'upper arms': 'brazos',
  'upper legs': 'piernas',
  waist: 'cintura / core',
}

// ─── Traducción de equipment (label display en ES) ───────────────────────────
const EQUIPMENT_ES = {
  assisted: 'asistido',
  band: 'banda elástica',
  barbell: 'barra',
  'body weight': 'peso corporal',
  cable: 'polea / cable',
  dumbbell: 'mancuerna',
  'ez barbell': 'barra EZ',
  hammer: 'martillo',
  kettlebell: 'kettlebell',
  'leverage machine': 'máquina de palanca',
  'medicine ball': 'balón medicinal',
  'olympic barbell': 'barra olímpica',
  'resistance band': 'banda de resistencia',
  roller: 'rodillo / foam roller',
  rope: 'cuerda',
  'skierg machine': 'máquina ski erg',
  'sled machine': 'trineo / sled',
  'smith machine': 'máquina Smith',
  'stability ball': 'balón de estabilidad',
  'stationary bike': 'bicicleta estática',
  'stepmill machine': 'escaladora',
  tire: 'llanta / neumático',
  'trap bar': 'barra trap',
  'upper body ergometer': 'ergómetro de tren superior',
  weighted: 'con peso libre',
  'wheel roller': 'rueda abdominal',
}

// ─── Traducción de targetMuscle (label display en ES) ────────────────────────
const MUSCLE_ES = {
  abs: 'abdominales',
  abductors: 'abductores',
  adductors: 'aductores',
  biceps: 'bíceps',
  calves: 'pantorrillas',
  'cardiovascular system': 'sistema cardiovascular',
  delts: 'deltoides',
  forearms: 'antebrazos',
  glutes: 'glúteos',
  hamstrings: 'isquiotibiales',
  'hip flexors': 'flexores de cadera',
  lats: 'dorsales',
  'levator scapulae': 'elevador de la escápula',
  obliques: 'oblicuos',
  pectorals: 'pectorales',
  quads: 'cuádriceps',
  'serratus anterior': 'serrato anterior',
  spine: 'columna / erectores',
  traps: 'trapecios',
  triceps: 'tríceps',
  'upper back': 'espalda alta',
}

// ─── Traducciones manuales name_es ───────────────────────────────────────────
// Clave = exerciseId de exercisedb
const NAME_ES_OVERRIDE = {
  '01qpYSe': 'Perro boca arriba',
  '03lzqwk': 'Elevación de rodillas colgado (asistido)',
  '05Cf2v8': 'Fondos imposibles',
  '0br45wL': 'Flexión con patada interior de pierna',
  '0CXGHya': 'Cruce de poleas (variación)',
  '0dCyly0': 'Press Bradford sentado con barra',
  '0I5fUyn': 'Jalón con banda agarre supino',
  '0IgNjSM': 'Curl invertido de pie con mancuerna',
  '0jp9Rlz': 'Elevación de talón a una pierna en el suelo',
  '0JtKWum': 'Burpee con mancuerna',
  '0L2KwtI': 'Estiramiento de cadera y dorsal con rodillo',
  '0lQnxMZ': 'Sissy squat con peso',
  '0mB6wHO': 'Estiramiento del corredor',
  '0MlxeMn': 'Jalón en polea suave (barra pro dorsal)',
  '0rHfvy9': 'Curl de pierna inverso en polea',
  '0S75mYG': 'Elevación de talón a una pierna sentado en Smith',
  '0V2YQjW': 'Dominada agarre neutro',
  '0xDpB4L': 'Abducción de cadera sentado con banda',
  '0Yz8WdV': 'Rastreo de oso',
  '10Z2DXU': 'Prensa de pierna 45° en trineo',
  '11wrviz': 'Limpiaparabrisas isométrico',
  '13TpY4H': 'Flexión elevando un brazo',
  '13VW2VO': 'Estocada con estiramiento y peso',
  '17bqEXD': 'Estiramiento de pantorrilla sentado',
  '17lJ1kr': 'Curl de pierna tumbado en máquina',
}

// ─── Traducción básica de instrucciones ──────────────────────────────────────
// Reemplaza patrones comunes EN → ES
function translateInstruction(text) {
  return text
    .replace(/^Step:(\d+)\s*/i, 'Paso $1: ')
    .replace(/\blie face down\b/gi, 'acuéstate boca abajo')
    .replace(/\blie on your back\b/gi, 'acuéstate boca arriba')
    .replace(/\blie on your stomach\b/gi, 'acuéstate boca abajo')
    .replace(/\bstand (up )?straight\b/gi, 'párate erguido')
    .replace(/\bstand with your feet\b/gi, 'párate con los pies')
    .replace(/\bsit (up )?straight\b/gi, 'siéntate erguido')
    .replace(/\bsit on\b/gi, 'siéntate en')
    .replace(/\bkeep your back straight\b/gi, 'mantén la espalda recta')
    .replace(/\bkeep your core engaged\b/gi, 'mantén el core activado')
    .replace(/\bengage your core\b/gi, 'activa el core')
    .replace(/\bengage your ([\w ]+)\b/gi, 'activa tus $1')
    .replace(/\bbend your knees\b/gi, 'dobla las rodillas')
    .replace(/\bbend at the hips\b/gi, 'doblándote desde las caderas')
    .replace(/\bsqueeze your\b/gi, 'contrae tus')
    .replace(/\bhold this position\b/gi, 'mantén esta posición')
    .replace(
      /\brepeat for the desired number of repetitions\b/gi,
      'repite por el número deseado de repeticiones'
    )
    .replace(/\bslowly lower\b/gi, 'baja lentamente')
    .replace(/\bslowly return\b/gi, 'regresa lentamente')
    .replace(/\bpause for a moment\b/gi, 'haz una pausa breve')
    .replace(/\bpalms facing ([\w]+)\b/gi, 'palmas mirando $1')
    .replace(/\bpalms facing away from you\b/gi, 'palmas hacia afuera')
    .replace(/\bpalms facing you\b/gi, 'palmas hacia ti')
    .replace(/\barms fully extended\b/gi, 'brazos completamente extendidos')
    .replace(/\bstraighten your arms\b/gi, 'extiende los brazos')
    .replace(/\blift your\b/gi, 'levanta tus')
    .replace(/\blower your\b/gi, 'baja tus')
    .replace(/\bpress your\b/gi, 'presiona tus')
    .replace(/\byour chest\b/gi, 'tu pecho')
    .replace(/\byour back\b/gi, 'tu espalda')
    .replace(/\byour knees\b/gi, 'tus rodillas')
    .replace(/\byour hips\b/gi, 'tus caderas')
    .replace(/\byour shoulders\b/gi, 'tus hombros')
    .replace(/\byour arms\b/gi, 'tus brazos')
    .replace(/\byour legs\b/gi, 'tus piernas')
    .replace(/\byour feet\b/gi, 'tus pies')
    .replace(/\byour hands\b/gi, 'tus manos')
    .replace(/\byour head\b/gi, 'tu cabeza')
    .replace(/\byour torso\b/gi, 'tu torso')
    .replace(/\byour body\b/gi, 'tu cuerpo')
    .replace(/\bthe floor\b/gi, 'el suelo')
    .replace(/\bthe ground\b/gi, 'el suelo')
    .replace(/\bthe bar\b/gi, 'la barra')
    .replace(/\bthe barbell\b/gi, 'la barra')
    .replace(/\bthe dumbbell\b/gi, 'la mancuerna')
    .replace(/\bthe cable\b/gi, 'el cable')
    .replace(/\bthe machine\b/gi, 'la máquina')
    .replace(/\bthe bench\b/gi, 'el banco')
    .replace(/\brepetitions\b/gi, 'repeticiones')
    .replace(/\bstarting position\b/gi, 'posición inicial')
    .replace(/\btop of the movement\b/gi, 'punto máximo del movimiento')
    .replace(/\bbottom of the movement\b/gi, 'punto más bajo del movimiento')
    .replace(/\ba pull-up bar\b/gi, 'una barra de dominadas')
    .replace(/\bpull-up bar\b/gi, 'barra de dominadas')
    .replace(/\bfinger(s)?\b/gi, 'dedos')
    .replace(/\bforward\b/gi, 'hacia adelante')
    .replace(/\bbackward\b/gi, 'hacia atrás')
    .replace(/\bupward\b/gi, 'hacia arriba')
    .replace(/\bdownward\b/gi, 'hacia abajo')
    .replace(/\boutward\b/gi, 'hacia afuera')
    .replace(/\binward\b/gi, 'hacia adentro')
    .replace(/\boverhead\b/gi, 'sobre la cabeza')
    .replace(/\bshoulder-width apart\b/gi, 'al ancho de los hombros')
    .replace(/\bhip-width apart\b/gi, 'al ancho de las caderas')
}

// ─── Escape SQL string ────────────────────────────────────────────────────────
function sqlStr(str) {
  if (!str) return 'NULL'
  return `'${str.replace(/'/g, "''")}'`
}

function sqlArray(arr) {
  if (!arr || arr.length === 0) return 'NULL'
  const items = arr.map((s) => `"${s.replace(/"/g, '\\"')}"`)
  return `ARRAY[${items.map((i) => `${sqlStr(i.slice(1, -1))}`).join(', ')}]::text[]`
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const inputPath = path.join(__dirname, 'exercises.json')
const outputPath = path.join(__dirname, 'exercises-seed.sql')

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
const exercises = Array.isArray(raw) ? raw : (raw.data ?? [])

const lines = []

lines.push(`-- ============================================================`)
lines.push(`-- GymTrack Pro — Seed ejercicios desde exercisedb.dev`)
lines.push(`-- Generado: ${new Date().toISOString()}`)
lines.push(`-- Ejercicios en este archivo: ${exercises.length}`)
lines.push(`-- ============================================================`)
lines.push(``)
lines.push(`-- Asegura que exercisedb_id tenga unique constraint para upsert`)
lines.push(
  `ALTER TABLE exercises ADD CONSTRAINT IF NOT EXISTS exercises_exercisedb_id_key UNIQUE (exercisedb_id);`
)
lines.push(``)

for (const ex of exercises) {
  const targetMuscle = ex.targetMuscles?.[0] ?? null
  const bodyPart = ex.bodyParts?.[0] ?? null
  const equipment = ex.equipments?.[0] ?? null
  const slug = TARGET_TO_SLUG[targetMuscle] ?? null

  const nameEs =
    NAME_ES_OVERRIDE[ex.exerciseId] ??
    ex.name.replace(/\b\w/g, (c) => c.toUpperCase()) // fallback: capitalizar

  const instructionsEs = (ex.instructions ?? []).map(translateInstruction)

  // muscle_group_id via subquery por slug
  const muscleGroupIdSql = slug
    ? `(SELECT id FROM muscle_groups WHERE slug = ${sqlStr(slug)} LIMIT 1)`
    : 'NULL'

  lines.push(`INSERT INTO exercises (`)
  lines.push(`  exercisedb_id, name, name_es,`)
  lines.push(
    `  gif_url, body_part, equipment, target_muscle, secondary_muscles,`
  )
  lines.push(`  instructions, is_custom, muscle_group_id`)
  lines.push(`) VALUES (`)
  lines.push(`  ${sqlStr(ex.exerciseId)},`)
  lines.push(`  ${sqlStr(ex.name)},`)
  lines.push(`  ${sqlStr(nameEs)},`)
  lines.push(`  ${sqlStr(ex.gifUrl)},`)
  lines.push(`  ${sqlStr(bodyPart)},`)
  lines.push(`  ${sqlStr(equipment)},`)
  lines.push(`  ${sqlStr(targetMuscle)},`)

  // secondary_muscles como array
  const secArr = ex.secondaryMuscles ?? []
  if (secArr.length > 0) {
    const secSql = `ARRAY[${secArr.map(sqlStr).join(', ')}]::text[]`
    lines.push(`  ${secSql},`)
  } else {
    lines.push(`  NULL,`)
  }

  // instructions en español como array
  if (instructionsEs.length > 0) {
    const insSql = `ARRAY[${instructionsEs.map(sqlStr).join(', ')}]::text[]`
    lines.push(`  ${insSql},`)
  } else {
    lines.push(`  NULL,`)
  }

  lines.push(`  false,`)
  lines.push(`  ${muscleGroupIdSql}`)
  lines.push(`) ON CONFLICT (exercisedb_id) DO UPDATE SET`)
  lines.push(`  name        = EXCLUDED.name,`)
  lines.push(`  name_es     = EXCLUDED.name_es,`)
  lines.push(`  gif_url     = EXCLUDED.gif_url,`)
  lines.push(`  body_part   = EXCLUDED.body_part,`)
  lines.push(`  equipment   = EXCLUDED.equipment,`)
  lines.push(`  target_muscle    = EXCLUDED.target_muscle,`)
  lines.push(`  secondary_muscles= EXCLUDED.secondary_muscles,`)
  lines.push(`  instructions     = EXCLUDED.instructions,`)
  lines.push(`  muscle_group_id  = EXCLUDED.muscle_group_id;`)
  lines.push(``)
}

// ─── Tabla de traducción de labels (para UI) ─────────────────────────────────
lines.push(`-- ============================================================`)
lines.push(`-- Vista helper: labels en español para UI`)
lines.push(`-- ============================================================`)
lines.push(``)
lines.push(`CREATE OR REPLACE VIEW exercises_es AS`)
lines.push(`SELECT`)
lines.push(`  e.*,`)
lines.push(`  CASE e.body_part`)
Object.entries(BODY_PART_ES).forEach(([k, v]) => {
  lines.push(`    WHEN ${sqlStr(k)} THEN ${sqlStr(v)}`)
})
lines.push(`    ELSE e.body_part`)
lines.push(`  END AS body_part_es,`)
lines.push(`  CASE e.equipment`)
Object.entries(EQUIPMENT_ES).forEach(([k, v]) => {
  lines.push(`    WHEN ${sqlStr(k)} THEN ${sqlStr(v)}`)
})
lines.push(`    ELSE e.equipment`)
lines.push(`  END AS equipment_es,`)
lines.push(`  CASE e.target_muscle`)
Object.entries(MUSCLE_ES).forEach(([k, v]) => {
  lines.push(`    WHEN ${sqlStr(k)} THEN ${sqlStr(v)}`)
})
lines.push(`    ELSE e.target_muscle`)
lines.push(`  END AS target_muscle_es`)
lines.push(`FROM exercises e`)
lines.push(`WHERE e.is_custom = false;`)
lines.push(``)
lines.push(`-- Ejecutar en Supabase: SQL Editor → pegar → Run`)

const output = lines.join('\n')
fs.writeFileSync(outputPath, output, 'utf8')
console.log(`✓ Generado: ${outputPath}`)
console.log(`  Ejercicios: ${exercises.length}`)
console.log(`  Líneas SQL: ${lines.length}`)
