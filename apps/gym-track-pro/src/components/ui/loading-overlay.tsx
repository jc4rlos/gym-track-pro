import { useIsMutating } from '@tanstack/react-query'

export const LoadingOverlay = () => {
  const mutating = useIsMutating()
  if (!mutating) return null

  return (
    <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-[2px]'>
      <div
        className='flex flex-col items-center gap-3 rounded-[20px] px-8 py-6'
        style={{
          background: 'rgba(19,19,19,0.95)',
          border: '1px solid #2a2a2a',
        }}
      >
        {/* Lime spinning ring */}
        <div className='relative h-10 w-10'>
          <div className='border-t-primary absolute inset-0 animate-spin rounded-full border-[3px] border-[#1e1e1e]' />
        </div>
        <p className='text-muted text-[13px] font-medium'>Guardando...</p>
      </div>
    </div>
  )
}
