import type { Database } from './database.types'
import { supabase } from './supabase'

type PublicTables = Database['public']['Tables']
type TableName = keyof PublicTables & string

type Row<T extends TableName> = PublicTables[T]['Row']
type Insert<T extends TableName> = PublicTables[T]['Insert']
type Update<T extends TableName> = PublicTables[T]['Update']

type TableNameWithId = {
  [K in TableName]: Row<K> extends { id: unknown } ? K : never
}[TableName]

type IdOf<T extends TableNameWithId> =
  Row<T> extends { id: infer I } ? I : never

const ensureData = <D>(data: D | null, message: string): D => {
  if (data === null) throw new Error(message)
  return data
}

export const createSupabaseService = <T extends TableNameWithId>(table: T) => ({
  findAll: async (): Promise<Row<T>[]> => {
    const { data, error } = await supabase.from(table).select('*')
    if (error) throw error
    return ensureData(
      data as unknown as Row<T>[] | null,
      `No data for "${table}"`
    )
  },

  findById: async (id: IdOf<T>): Promise<Row<T>> => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id' as never, id as never)
      .single()
    if (error) throw error
    return ensureData(
      data as unknown as Row<T> | null,
      `Not found in "${table}" id="${String(id)}"`
    )
  },

  create: async (payload: Insert<T>): Promise<Row<T>> => {
    const { data, error } = await supabase
      .from(table)
      .insert(payload as never)
      .select()
      .single()
    if (error) throw error
    return ensureData(
      data as unknown as Row<T> | null,
      `Insert failed for "${table}"`
    )
  },

  update: async (id: IdOf<T>, payload: Update<T>): Promise<Row<T>> => {
    const { data, error } = await supabase
      .from(table)
      .update(payload as never)
      .eq('id' as never, id as never)
      .select()
      .single()
    if (error) throw error
    return ensureData(
      data as unknown as Row<T> | null,
      `Update failed for "${table}"`
    )
  },

  remove: async (id: IdOf<T>): Promise<void> => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id' as never, id as never)
    if (error) throw error
  },
})

export type SupabaseService<T extends TableNameWithId> = ReturnType<
  typeof createSupabaseService<T>
>
