import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { SplashScreen } from '@/components/ui/splash-screen'
import { AppLayout } from '@/components/layout/app-layout'

const AppGuard = () => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return <SplashScreen />

  if (!user) return <Navigate to='/login' />

  return <AppLayout />
}

export const Route = createFileRoute('/_app')({ component: AppGuard })
