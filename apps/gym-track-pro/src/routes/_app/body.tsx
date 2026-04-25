import { createFileRoute } from '@tanstack/react-router'
import { BodyPage } from '@/features/profile/body-page'

export const Route = createFileRoute('/_app/body')({ component: BodyPage })
