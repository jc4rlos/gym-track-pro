export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          changed_at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          operation: Database["public"]["Enums"]["audit_op_type"]
          row_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          changed_at?: string
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          operation: Database["public"]["Enums"]["audit_op_type"]
          row_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          changed_at?: string
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          operation?: Database["public"]["Enums"]["audit_op_type"]
          row_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          bmi: number | null
          created_at: string
          height_cm: number | null
          id: string
          measured_at: string
          notes: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          bmi?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          bmi?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_steps: {
        Row: {
          created_at: string
          id: string
          step_date: string
          steps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          step_date?: string
          steps?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          step_date?: string
          steps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_steps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          body_part: string | null
          created_at: string
          created_by: string | null
          difficulty: Database["public"]["Enums"]["difficulty_type"] | null
          equipment: string | null
          execution: string | null
          exercisedb_id: string | null
          gif_url: string | null
          id: string
          image_url: string | null
          instructions: string[] | null
          is_custom: boolean
          muscle_group_id: string | null
          name: string
          name_es: string | null
          secondary_muscles: string[] | null
          starting_position: string | null
          target_muscle: string | null
        }
        Insert: {
          body_part?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_type"] | null
          equipment?: string | null
          execution?: string | null
          exercisedb_id?: string | null
          gif_url?: string | null
          id?: string
          image_url?: string | null
          instructions?: string[] | null
          is_custom?: boolean
          muscle_group_id?: string | null
          name: string
          name_es?: string | null
          secondary_muscles?: string[] | null
          starting_position?: string | null
          target_muscle?: string | null
        }
        Update: {
          body_part?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_type"] | null
          equipment?: string | null
          execution?: string | null
          exercisedb_id?: string | null
          gif_url?: string | null
          id?: string
          image_url?: string | null
          instructions?: string[] | null
          is_custom?: boolean
          muscle_group_id?: string | null
          name?: string
          name_es?: string | null
          secondary_muscles?: string[] | null
          starting_position?: string | null
          target_muscle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_groups: {
        Row: {
          body_side: Database["public"]["Enums"]["body_side_type"]
          display_order: number
          id: string
          name_en: string
          name_es: string
          slug: string
          svg_path_id: string
        }
        Insert: {
          body_side?: Database["public"]["Enums"]["body_side_type"]
          display_order?: number
          id?: string
          name_en: string
          name_es: string
          slug: string
          svg_path_id: string
        }
        Update: {
          body_side?: Database["public"]["Enums"]["body_side_type"]
          display_order?: number
          id?: string
          name_en?: string
          name_es?: string
          slug?: string
          svg_path_id?: string
        }
        Relationships: []
      }
      plan_day_routines: {
        Row: {
          id: string
          plan_day_id: string
          routine_id: string
        }
        Insert: {
          id?: string
          plan_day_id: string
          routine_id: string
        }
        Update: {
          id?: string
          plan_day_id?: string
          routine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_day_routines_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: false
            referencedRelation: "plan_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_day_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_days: {
        Row: {
          day_of_week: number
          id: string
          is_rest_day: boolean
          plan_id: string
        }
        Insert: {
          day_of_week: number
          id?: string
          is_rest_day?: boolean
          plan_id: string
        }
        Update: {
          day_of_week?: number
          id?: string
          is_rest_day?: boolean
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_days_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_week_assignments: {
        Row: {
          id: string
          plan_id: string
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          id?: string
          plan_id: string
          user_id: string
          week_number: number
          year: number
        }
        Update: {
          id?: string
          plan_id?: string
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_week_assignments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: Database["public"]["Enums"]["activity_type"] | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          daily_steps_goal: number
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          goal: Database["public"]["Enums"]["goal_type"] | null
          gym_days_per_week: number | null
          height_cm: number | null
          id: string
          is_active: boolean
          muscle_primary_color: string | null
          muscle_secondary_color: string | null
          must_change_password: boolean | null
          role: string | null
          updated_at: string
          username: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: Database["public"]["Enums"]["activity_type"] | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          daily_steps_goal?: number
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          goal?: Database["public"]["Enums"]["goal_type"] | null
          gym_days_per_week?: number | null
          height_cm?: number | null
          id: string
          is_active?: boolean
          muscle_primary_color?: string | null
          muscle_secondary_color?: string | null
          must_change_password?: boolean | null
          role?: string | null
          updated_at?: string
          username: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: Database["public"]["Enums"]["activity_type"] | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          daily_steps_goal?: number
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          goal?: Database["public"]["Enums"]["goal_type"] | null
          gym_days_per_week?: number | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          muscle_primary_color?: string | null
          muscle_secondary_color?: string | null
          must_change_password?: boolean | null
          role?: string | null
          updated_at?: string
          username?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          reps: string
          rest_seconds: number | null
          routine_id: string
          sets: number
        }
        Insert: {
          exercise_id: string
          id?: string
          notes?: string | null
          order_index?: number
          reps?: string
          rest_seconds?: number | null
          routine_id: string
          sets?: number
        }
        Update: {
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          reps?: string
          rest_seconds?: number | null
          routine_id?: string
          sets?: number
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_muscle_groups: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          muscle_group_id: string
          notes: string | null
          session_id: string
          sets_count: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          muscle_group_id: string
          notes?: string | null
          session_id: string
          sets_count?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          muscle_group_id?: string
          notes?: string | null
          session_id?: string
          sets_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_muscle_groups_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_muscle_groups_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_plan_exercises: {
        Row: {
          completed_at: string
          routine_exercise_id: string
          session_id: string
        }
        Insert: {
          completed_at?: string
          routine_exercise_id: string
          session_id: string
        }
        Update: {
          completed_at?: string
          routine_exercise_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_plan_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_plan_day_muscles: {
        Row: {
          id: string
          muscle_group_id: string
          plan_day_id: string
        }
        Insert: {
          id?: string
          muscle_group_id: string
          plan_day_id: string
        }
        Update: {
          id?: string
          muscle_group_id?: string
          plan_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_plan_day_muscles_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_plan_day_muscles_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: false
            referencedRelation: "weekly_plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_plan_day_routines: {
        Row: {
          created_at: string | null
          id: string
          plan_day_id: string
          routine_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          plan_day_id: string
          routine_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          plan_day_id?: string
          routine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_plan_day_routines_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: false
            referencedRelation: "weekly_plan_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_plan_day_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_plan_days: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          is_rest_day: boolean
          notes: string | null
          routine_id: string | null
          weekly_plan_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          is_rest_day?: boolean
          notes?: string | null
          routine_id?: string | null
          weekly_plan_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          is_rest_day?: boolean
          notes?: string | null
          routine_id?: string | null
          weekly_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_plan_days_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_plan_days_weekly_plan_id_fkey"
            columns: ["weekly_plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_plans: {
        Row: {
          copied_from_id: string | null
          created_at: string
          id: string
          is_template: boolean
          name: string | null
          updated_at: string
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          copied_from_id?: string | null
          created_at?: string
          id?: string
          is_template?: boolean
          name?: string | null
          updated_at?: string
          user_id: string
          week_number: number
          year: number
        }
        Update: {
          copied_from_id?: string | null
          created_at?: string
          id?: string
          is_template?: boolean
          name?: string | null
          updated_at?: string
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_plans_copied_from_id_fkey"
            columns: ["copied_from_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          calories_burned: number | null
          created_at: string
          finished_at: string | null
          id: string
          intensity: string | null
          notes: string | null
          session_date: string
          started_at: string
          updated_at: string
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          finished_at?: string | null
          id?: string
          intensity?: string | null
          notes?: string | null
          session_date?: string
          started_at?: string
          updated_at?: string
          user_id: string
          week_number?: number
          year?: number
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          finished_at?: string | null
          id?: string
          intensity?: string | null
          notes?: string | null
          session_date?: string
          started_at?: string
          updated_at?: string
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_finish_old_sessions: { Args: never; Returns: undefined }
      get_admin_users: {
        Args: {
          page_limit?: number
          page_offset?: number
          search_query?: string
        }
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          role: string
          total: number
        }[]
      }
    }
    Enums: {
      activity_type:
        | "sedentary"
        | "light"
        | "moderate"
        | "active"
        | "very_active"
      audit_op_type: "INSERT" | "UPDATE" | "DELETE"
      body_side_type: "front" | "back" | "both"
      difficulty_type: "beginner" | "intermediate" | "advanced"
      gender_type: "male" | "female" | "other"
      goal_type: "lose_weight" | "gain_muscle" | "maintain"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "sedentary",
        "light",
        "moderate",
        "active",
        "very_active",
      ],
      audit_op_type: ["INSERT", "UPDATE", "DELETE"],
      body_side_type: ["front", "back", "both"],
      difficulty_type: ["beginner", "intermediate", "advanced"],
      gender_type: ["male", "female", "other"],
      goal_type: ["lose_weight", "gain_muscle", "maintain"],
    },
  },
} as const
