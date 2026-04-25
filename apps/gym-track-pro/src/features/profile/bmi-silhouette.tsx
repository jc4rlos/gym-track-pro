import { type BmiCategory } from './bmi-utils'

import thinManImg from '@/assets/images/webp/thin-man.webp'
import thinWomenImg from '@/assets/images/webp/thin-women.webp'
import fatManImg from '@/assets/images/webp/fat-man.webp'
import fatWomenImg from '@/assets/images/webp/fat-women.webp'
import obeseManImg from '@/assets/images/webp/obese-man.webp'
import obeseWomenImg from '@/assets/images/webp/obese-women.webp'

type SilhouetteKey = 'thin' | 'fat' | 'obese'

const CATEGORY_TO_KEY: Record<BmiCategory, SilhouetteKey> = {
  underweight: 'thin',
  normal: 'thin',
  overweight: 'fat',
  obese: 'obese',
  extremely_obese: 'obese',
}

const IMAGES: Record<SilhouetteKey, { man: string; women: string }> = {
  thin: { man: thinManImg, women: thinWomenImg },
  fat: { man: fatManImg, women: fatWomenImg },
  obese: { man: obeseManImg, women: obeseWomenImg },
}

type Props = {
  category: BmiCategory
  gender: string
  size?: number
}

export const BmiSilhouette = ({ category, gender, size = 80 }: Props) => {
  const key = CATEGORY_TO_KEY[category]
  const src = IMAGES[key][gender === 'female' ? 'women' : 'man']

  return (
    <img
      src={src}
      width={size}
      alt={`Silueta ${key}`}
      className='object-contain'
      style={{ height: 'auto' }}
    />
  )
}
