import { createFileRoute } from '@tanstack/react-router'
import { History } from 'lucide-react'

const HistoryPage = () => (
  <div className='flex flex-col items-center justify-center gap-3 py-20 text-center'>
    <History size={40} className='text-muted' strokeWidth={1.5} />
    <h1 className='text-lg font-bold text-foreground'>Historial</h1>
    <p className='text-sm text-muted'>Próximamente</p>
  </div>
)

export const Route = createFileRoute('/_app/history')({
  component: HistoryPage,
})
