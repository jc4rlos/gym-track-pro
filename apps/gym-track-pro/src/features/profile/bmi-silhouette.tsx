import { BMI_COLORS, type BmiCategory } from './bmi-utils'

// All half-widths measured from CX=40
type P = {
  sw: number // shoulder
  bw: number // belly bezier control (>sw = belly protrudes past shoulder)
  hw: number // hip
  tw: number // thigh outer
  cw: number // calf outer
  ar: number // arm ellipse rx
}

const CX = 40

// Fixed Y anchors for all figures (viewBox 0 0 80 185)
const Y = {
  headCY: 10,
  headRY: 11,
  headRX: 10,
  neckBot: 22,
  shoulder: 30,
  belly: 70, // bezier control Y — key: bw > sw pushes belly past shoulder
  hip: 98,
  crotch: 111,
  knee: 148,
  ankle: 168,
  foot: 175,
  armCY: 58, // arm ellipse center Y
  armRY: 20,
}

const MALE: Record<BmiCategory, P> = {
  underweight: { sw: 12, bw: 8, hw: 10, tw: 8, cw: 6, ar: 3.5 },
  normal: { sw: 15, bw: 12, hw: 13, tw: 10, cw: 8, ar: 4 },
  overweight: { sw: 16, bw: 20, hw: 17, tw: 12, cw: 9, ar: 4.5 },
  obese: { sw: 17, bw: 26, hw: 22, tw: 15, cw: 11, ar: 5 },
  extremely_obese: { sw: 18, bw: 31, hw: 27, tw: 18, cw: 13, ar: 5.5 },
}

// Female: wider hips vs waist for normal, same belly progression for heavier
const FEMALE: Record<BmiCategory, P> = {
  underweight: { sw: 11, bw: 7, hw: 13, tw: 9, cw: 6, ar: 3 },
  normal: { sw: 13, bw: 10, hw: 16, tw: 11, cw: 8, ar: 3.5 },
  overweight: { sw: 14, bw: 18, hw: 19, tw: 13, cw: 9, ar: 4 },
  obese: { sw: 15, bw: 24, hw: 23, tw: 15, cw: 11, ar: 4.5 },
  extremely_obese: { sw: 16, bw: 29, hw: 26, tw: 18, cw: 13, ar: 5 },
}

// Torso: neck → shoulder → bezier belly → hip → crotch (both sides)
function torsoD(p: P) {
  return [
    `M ${CX - 4} ${Y.neckBot}`,
    `L ${CX - p.sw} ${Y.shoulder}`,
    `Q ${CX - p.bw} ${Y.belly} ${CX - p.hw} ${Y.hip}`,
    `L ${CX - 5} ${Y.crotch}`,
    `L ${CX + 5} ${Y.crotch}`,
    `L ${CX + p.hw} ${Y.hip}`,
    `Q ${CX + p.bw} ${Y.belly} ${CX + p.sw} ${Y.shoulder}`,
    `L ${CX + 4} ${Y.neckBot}`,
    'Z',
  ].join(' ')
}

// Leg: symmetric helper (sign = -1 left, +1 right)
function legD(p: P, side: -1 | 1) {
  const s = side
  const inner = CX + s * 5
  const outerThigh = CX + s * (p.tw + 3)
  const outerCalf = CX + s * (p.cw + 2)
  const innerCalf = CX + s * 3
  return [
    `M ${inner} ${Y.crotch}`,
    `L ${outerThigh} ${Y.crotch + 4}`,
    `Q ${outerThigh + s * 2} ${Y.knee - 8} ${outerCalf} ${Y.knee}`,
    `Q ${outerCalf} ${Y.ankle - 6} ${outerCalf} ${Y.ankle}`,
    `L ${outerCalf + s * 2} ${Y.foot}`,
    `L ${CX + s * 2} ${Y.foot}`,
    `Q ${innerCalf} ${Y.ankle} ${innerCalf} ${Y.knee}`,
    `Q ${innerCalf} ${Y.knee - 8} ${inner} ${Y.crotch + 4}`,
    'Z',
  ].join(' ')
}

// Arm center X: positioned just outside the torso at arm-level
// For obese, belly pushes arm outward → use max(shoulder+ar, belly*0.7+ar)
function armCX(p: P, side: -1 | 1): number {
  const edgeX = Math.max(p.sw + p.ar + 1, p.bw * 0.65 + p.ar)
  return CX + side * edgeX
}

type Props = {
  category: BmiCategory
  gender: string
  size?: number
}

export const BmiSilhouette = ({ category, gender, size = 80 }: Props) => {
  const p = gender === 'female' ? FEMALE[category] : MALE[category]
  const color = BMI_COLORS[category]
  const fill = color
  const opacity = 0.88
  const viewH = 185
  const viewW = 80

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      width={size}
      height={Math.round(size * (viewH / viewW))}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Head */}
      <ellipse
        cx={CX}
        cy={Y.headCY}
        rx={Y.headRX}
        ry={Y.headRY}
        fill={fill}
        opacity={opacity}
      />

      {/* Left arm */}
      <ellipse
        cx={armCX(p, -1)}
        cy={Y.armCY}
        rx={p.ar}
        ry={Y.armRY}
        transform={`rotate(-8, ${armCX(p, -1)}, ${Y.armCY})`}
        fill={fill}
        opacity={opacity}
      />

      {/* Right arm */}
      <ellipse
        cx={armCX(p, 1)}
        cy={Y.armCY}
        rx={p.ar}
        ry={Y.armRY}
        transform={`rotate(8, ${armCX(p, 1)}, ${Y.armCY})`}
        fill={fill}
        opacity={opacity}
      />

      {/* Torso */}
      <path d={torsoD(p)} fill={fill} opacity={opacity} />

      {/* Left leg */}
      <path d={legD(p, -1)} fill={fill} opacity={opacity} />

      {/* Right leg */}
      <path d={legD(p, 1)} fill={fill} opacity={opacity} />

      {/* Female: slight hip flare indicators */}
      {gender === 'female' && (
        <>
          <ellipse
            cx={CX - p.hw + 1}
            cy={Y.hip - 4}
            rx={4}
            ry={7}
            fill={fill}
            opacity={opacity * 0.6}
          />
          <ellipse
            cx={CX + p.hw - 1}
            cy={Y.hip - 4}
            rx={4}
            ry={7}
            fill={fill}
            opacity={opacity * 0.6}
          />
        </>
      )}
    </svg>
  )
}
