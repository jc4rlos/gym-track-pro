import { useEffect } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { SplashScreen } from '@/components/ui/splash-screen'
import { AppLayout } from '@/components/layout/app-layout'
import { ChangePasswordModal } from '@/features/auth/change-password-modal'
import { useProfile } from '@/features/profile/use-body'
import { supabase } from '@/lib/supabase'

const AppGuard = () => {
  const { user, isLoading } = useAuthStore()
  const { data: profile, isLoading: profileLoading } = useProfile()

  const inactive = profile && !profile.is_active

  useEffect(() => {
    if (inactive) {
      supabase.auth.signOut()
    }
  }, [inactive])

  if (isLoading || (user && profileLoading)) return <SplashScreen />

  if (!user) return <Navigate to='/login' />

  // Wait for signOut to propagate — don't navigate while user is still set
  if (inactive) return <SplashScreen />

  // First-time users (no goal set) must complete onboarding
  if (!profile?.must_change_password && !profile?.goal) {
    return <Navigate to='/onboarding' />
  }

  return (
    <>
      <AppLayout />
      {profile?.must_change_password && <ChangePasswordModal />}
    </>
  )
}

export const Route = createFileRoute('/_app')({ component: AppGuard })
