import { createFileRoute } from '@tanstack/react-router'
import { PlansPage } from '@/features/plan/plans-page'

export const Route = createFileRoute('/_app/plans')({ component: PlansPage })
