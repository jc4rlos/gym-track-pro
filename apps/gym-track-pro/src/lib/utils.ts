import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const formatDate = (date: string): string =>
  new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' }).format(
    new Date(date)
  )
