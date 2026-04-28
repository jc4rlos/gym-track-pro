import { createFileRoute } from '@tanstack/react-router'
import { StepsPage } from '@/features/steps/steps-page'

export const Route = createFileRoute('/_app/steps')({ component: StepsPage })
