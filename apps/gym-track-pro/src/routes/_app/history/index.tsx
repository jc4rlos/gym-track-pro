import { createFileRoute } from '@tanstack/react-router'
import { HistoryView } from '@/features/history/history-view'

function HistoryPage() {
  return <HistoryView />
}

export const Route = createFileRoute('/_app/history/')({
  component: HistoryPage,
})
