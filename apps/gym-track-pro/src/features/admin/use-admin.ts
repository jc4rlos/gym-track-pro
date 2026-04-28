import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

export type AdminUser = {
  id: string
  email: string | null
  full_name: string
  role: 'admin' | 'user'
  is_active: boolean
  created_at: string
  daily_steps_goal: number | null
}

const PAGE_SIZE = 20

export function useUserRole() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['user_role', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return (data.role ?? 'user') as 'admin' | 'user'
    },
    enabled: !!user,
    staleTime: 60_000,
  })
}

export function useAdminUsers({
  page,
  search,
}: {
  page: number
  search: string
}) {
  const { user } = useAuthStore()
  const offset = page * PAGE_SIZE

  return useQuery({
    queryKey: ['admin_users', page, search],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_users', {
        search_query: search.trim(),
        page_offset: offset,
        page_limit: PAGE_SIZE,
      })
      if (error) throw error
      const rows = (data ?? []) as Array<AdminUser & { total: number }>
      return {
        users: rows as AdminUser[],
        total: rows[0]?.total ?? 0,
      }
    },
    enabled: !!user,
  })
}

export function useToggleUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      userId,
      isActive,
    }: {
      userId: string
      isActive: boolean
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_users'] }),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      email,
      fullName,
      password,
    }: {
      email: string
      fullName: string
      password: string
    }) => {
      const { error } = await supabase.functions.invoke('admin-create-user', {
        body: { email, fullName, password },
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_users'] }),
  })
}
