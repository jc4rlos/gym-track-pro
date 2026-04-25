#!/usr/bin/env node
/**
 * Genera exercises-seed.sql desde exercises.json (pre-traducido).
 * Prerequisito: correr translate-exercises.cjs primero.
 * Uso: node generate-exercises-sql.cjs
 * Output: exercises-seed.sql
 */

const fs = require('fs')
const path = require('path')

// ─── Mapeo targetMuscle → slug de muscle_groups ──────────────────────────────
const TARGET_TO_SLUG = {
  abs: 'abs',
  biceps: 'biceps',
  calves: 'calves',
  'cardiovascular system': null,
  delts: 'shoulders',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  lats: 'lats',
  pectorals: 'chest',
  quads: 'quadriceps',
  spine: 'back',
  triceps: 'triceps',
  abductors: 'glutes',
  forearms: 'forearms',
  traps: 'traps',
  obliques: 'obliques',
  'upper back': 'back',
  'lower back': 'back',
  'hip flexors': 'abs',
  'serratus anterior': 'chest',
  adductors: 'glutes',
  'levator scapulae': 'traps',
}

// ─── Escape SQL ───────────────────────────────────────────────────────────────
function sqlStr(str) {
  if (str === null || str === undefined) return 'NULL'
  return `'${String(str).replace(/'/g, "''")}'`
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const inputPath = path.join(__dirname, 'exercises.json')
const outputPath = path.join(__dirname, 'exercises-seed.sql')

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
const exercises = Array.isArray(raw) ? raw : (raw.data ?? [])

// Validar que el JSON esté traducido
const first = exercises[0]
if (!first?.name_es) {
  console.error('ERROR: exercises.json no tiene campo name_es.')
  console.error('Ejecutá primero: node translate-exercises.cjs')
  process.exit(1)
}

const lines = []

lines.push(`-- ============================================================`)
lines.push(`-- GymTrack Pro — Seed ejercicios desde exercisedb.dev`)
lines.push(`-- Generado: ${new Date().toISOString()}`)
lines.push(`-- Ejercicios: ${exercises.length}`)
lines.push(`-- ============================================================`)
lines.push(``)
lines.push(`ALTER TABLE exercises ADD CONSTRAINT IF NOT EXISTS exercises_exercisedb_id_key UNIQUE (exercisedb_id);`)
lines.push(``)

for (const ex of exercises) {
  const targetMuscle = ex.targetMuscles?.[0] ?? null
  const bodyPart = ex.bodyParts?.[0] ?? null
  const equipment = ex.equipments?.[0] ?? null
  const slug = TARGET_TO_SLUG[targetMuscle] ?? null

  const nameEs = ex.name_es ?? ex.name
  const instructions = ex.instructions_es ?? ex.instructions ?? []
  const secondaryMuscles = ex.secondaryMuscles ?? []

  const muscleGroupIdSql = slug
    ? `(SELECT id FROM muscle_groups WHERE slug = ${sqlStr(slug)} LIMIT 1)`
    : 'NULL'

  const secSql =
    secondaryMuscles.length > 0
      ? `ARRAY[${secondaryMuscles.map(sqlStr).join(', ')}]::text[]`
      : 'NULL'

  const insSql =
    instructions.length > 0
      ? `ARRAY[${instructions.map(sqlStr).join(', ')}]::text[]`
      : 'NULL'

  lines.push(`INSERT INTO exercises (`)
  lines.push(`  exercisedb_id, name, name_es,`)
  lines.push(`  gif_url, body_part, equipment, target_muscle, secondary_muscles,`)
  lines.push(`  instructions, is_custom, muscle_group_id`)
  lines.push(`) VALUES (`)
  lines.push(`  ${sqlStr(ex.exerciseId)},`)
  lines.push(`  ${sqlStr(ex.name)},`)
  lines.push(`  ${sqlStr(nameEs)},`)
  lines.push(`  ${sqlStr(ex.gifUrl)},`)
  lines.push(`  ${sqlStr(bodyPart)},`)
  lines.push(`  ${sqlStr(equipment)},`)
  lines.push(`  ${sqlStr(targetMuscle)},`)
  lines.push(`  ${secSql},`)
  lines.push(`  ${insSql},`)
  lines.push(`  false,`)
  lines.push(`  ${muscleGroupIdSql}`)
  lines.push(`) ON CONFLICT (exercisedb_id) DO UPDATE SET`)
  lines.push(`  name             = EXCLUDED.name,`)
  lines.push(`  name_es          = EXCLUDED.name_es,`)
  lines.push(`  gif_url          = EXCLUDED.gif_url,`)
  lines.push(`  body_part        = EXCLUDED.body_part,`)
  lines.push(`  equipment        = EXCLUDED.equipment,`)
  lines.push(`  target_muscle    = EXCLUDED.target_muscle,`)
  lines.push(`  secondary_muscles= EXCLUDED.secondary_muscles,`)
  lines.push(`  instructions     = EXCLUDED.instructions,`)
  lines.push(`  muscle_group_id  = EXCLUDED.muscle_group_id;`)
  lines.push(``)
}

lines.push(`-- ============================================================`)
lines.push(`-- Ejecutar en Supabase: SQL Editor → pegar → Run`)
lines.push(`-- ============================================================`)

fs.writeFileSync(outputPath, lines.join('\n'), 'utf8')
console.log(`✓ SQL generado: ${outputPath}`)
console.log(`  Ejercicios : ${exercises.length}`)
console.log(`  Líneas SQL : ${lines.length}`)
