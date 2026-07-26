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
      attendance: {
        Row: {
          date: string
          id: string
          notes: string | null
          recorded_by: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Insert: {
          date?: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Update: {
          date?: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_mistakes: {
        Row: {
          ayat: number
          category: string
          created_at: string
          exam_id: string
          id: string
          note: string | null
          page: number | null
          surah: string
        }
        Insert: {
          ayat: number
          category: string
          created_at?: string
          exam_id: string
          id?: string
          note?: string | null
          page?: number | null
          surah: string
        }
        Update: {
          ayat?: number
          category?: string
          created_at?: string
          exam_id?: string
          id?: string
          note?: string | null
          page?: number | null
          surah?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_mistakes_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          date: string
          examiner_id: string
          final_score: number | null
          id: string
          juz: number
          notes: string | null
          page_from: number | null
          page_to: number | null
          passed: boolean
          predicate: Database["public"]["Enums"]["exam_predicate"] | null
          score_adab: number | null
          score_ghunnah: number | null
          score_kelancaran: number | null
          score_mad: number | null
          score_makhroj: number | null
          score_qolqolah: number | null
          student_id: string
          surah_from: string | null
          surah_to: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          examiner_id: string
          final_score?: number | null
          id?: string
          juz: number
          notes?: string | null
          page_from?: number | null
          page_to?: number | null
          passed?: boolean
          predicate?: Database["public"]["Enums"]["exam_predicate"] | null
          score_adab?: number | null
          score_ghunnah?: number | null
          score_kelancaran?: number | null
          score_mad?: number | null
          score_makhroj?: number | null
          score_qolqolah?: number | null
          student_id: string
          surah_from?: string | null
          surah_to?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          examiner_id?: string
          final_score?: number | null
          id?: string
          juz?: number
          notes?: string | null
          page_from?: number | null
          page_to?: number | null
          passed?: boolean
          predicate?: Database["public"]["Enums"]["exam_predicate"] | null
          score_adab?: number | null
          score_ghunnah?: number | null
          score_kelancaran?: number | null
          score_mad?: number | null
          score_makhroj?: number | null
          score_qolqolah?: number | null
          student_id?: string
          surah_from?: string | null
          surah_to?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      halaqoh: {
        Row: {
          created_at: string
          description: string | null
          id: string
          level: string | null
          musyrif_id: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          level?: string | null
          musyrif_id?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          level?: string | null
          musyrif_id?: string | null
          name?: string
        }
        Relationships: []
      }
      halaqoh_schedule: {
        Row: {
          day_of_week: number
          end_time: string
          halaqoh_id: string
          id: string
          room: string | null
          start_time: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          halaqoh_id: string
          id?: string
          room?: string | null
          start_time: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          halaqoh_id?: string
          id?: string
          room?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "halaqoh_schedule_halaqoh_id_fkey"
            columns: ["halaqoh_id"]
            isOneToOne: false
            referencedRelation: "halaqoh"
            referencedColumns: ["id"]
          },
        ]
      }
      murojaah_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          juz: number | null
          murojaah_type: string
          notes: string | null
          score: number | null
          status: Database["public"]["Enums"]["setoran_status"]
          student_id: string
          surah_from: string
          surah_to: string | null
          teacher_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          juz?: number | null
          murojaah_type?: string
          notes?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["setoran_status"]
          student_id: string
          surah_from: string
          surah_to?: string | null
          teacher_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          juz?: number | null
          murojaah_type?: string
          notes?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["setoran_status"]
          student_id?: string
          surah_from?: string
          surah_to?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "murojaah_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_students: {
        Row: {
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          active: boolean
          birth_date: string | null
          class_level: string
          created_at: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          halaqoh_id: string | null
          id: string
          nis: string
          notes: string | null
          parent_name: string | null
          parent_phone: string | null
          photo_url: string | null
          target_juz: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          birth_date?: string | null
          class_level: string
          created_at?: string
          full_name: string
          gender?: Database["public"]["Enums"]["gender"]
          halaqoh_id?: string | null
          id?: string
          nis: string
          notes?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          photo_url?: string | null
          target_juz?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          birth_date?: string | null
          class_level?: string
          created_at?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          halaqoh_id?: string | null
          id?: string
          nis?: string
          notes?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          photo_url?: string | null
          target_juz?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_halaqoh_id_fkey"
            columns: ["halaqoh_id"]
            isOneToOne: false
            referencedRelation: "halaqoh"
            referencedColumns: ["id"]
          },
        ]
      }
      tahsin_entries: {
        Row: {
          ayat_from: number | null
          ayat_to: number | null
          created_at: string
          date: string
          final_score: number | null
          id: string
          juz: number | null
          notes: string | null
          score_gunnah: number | null
          score_kelancaran: number | null
          score_mad: number | null
          score_makhroj: number | null
          score_qolqolah: number | null
          score_vokal: number | null
          student_id: string
          surah: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          ayat_from?: number | null
          ayat_to?: number | null
          created_at?: string
          date?: string
          final_score?: number | null
          id?: string
          juz?: number | null
          notes?: string | null
          score_gunnah?: number | null
          score_kelancaran?: number | null
          score_mad?: number | null
          score_makhroj?: number | null
          score_qolqolah?: number | null
          score_vokal?: number | null
          student_id: string
          surah: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          ayat_from?: number | null
          ayat_to?: number | null
          created_at?: string
          date?: string
          final_score?: number | null
          id?: string
          juz?: number | null
          notes?: string | null
          score_gunnah?: number | null
          score_kelancaran?: number | null
          score_mad?: number | null
          score_makhroj?: number | null
          score_qolqolah?: number | null
          score_vokal?: number | null
          student_id?: string
          surah?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tahsin_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      tasmi_entries: {
        Row: {
          created_at: string
          date: string
          duration_min: number | null
          id: string
          juz: number | null
          notes: string | null
          score: number | null
          status: Database["public"]["Enums"]["setoran_status"]
          student_id: string
          surah_from: string
          surah_to: string | null
          tasmi_type: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          duration_min?: number | null
          id?: string
          juz?: number | null
          notes?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["setoran_status"]
          student_id: string
          surah_from: string
          surah_to?: string | null
          tasmi_type?: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          date?: string
          duration_min?: number | null
          id?: string
          juz?: number | null
          notes?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["setoran_status"]
          student_id?: string
          surah_from?: string
          surah_to?: string | null
          tasmi_type?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasmi_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      ziyadah_entries: {
        Row: {
          ayat_from: number
          ayat_to: number
          created_at: string
          date: string
          id: string
          juz: number | null
          notes: string | null
          page_from: number | null
          page_to: number | null
          score: number | null
          status: Database["public"]["Enums"]["setoran_status"]
          student_id: string
          surah: string
          teacher_id: string
        }
        Insert: {
          ayat_from: number
          ayat_to: number
          created_at?: string
          date?: string
          id?: string
          juz?: number | null
          notes?: string | null
          page_from?: number | null
          page_to?: number | null
          score?: number | null
          status?: Database["public"]["Enums"]["setoran_status"]
          student_id: string
          surah: string
          teacher_id: string
        }
        Update: {
          ayat_from?: number
          ayat_to?: number
          created_at?: string
          date?: string
          id?: string
          juz?: number | null
          notes?: string | null
          page_from?: number | null
          page_to?: number | null
          score?: number | null
          status?: Database["public"]["Enums"]["setoran_status"]
          student_id?: string
          surah?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ziyadah_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_musyrif_of_student: {
        Args: { _student_id: string; _user_id: string }
        Returns: boolean
      }
      is_parent_of_student: {
        Args: { _student_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "musyrif" | "wali"
      attendance_status: "hadir" | "izin" | "sakit" | "alpa"
      exam_predicate:
        | "mumtaz"
        | "jayyid_jiddan"
        | "jayyid"
        | "maqbul"
        | "belum_lulus"
      gender: "L" | "P"
      setoran_status: "lancar" | "kurang_lancar" | "mengulang"
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
      app_role: ["admin", "musyrif", "wali"],
      attendance_status: ["hadir", "izin", "sakit", "alpa"],
      exam_predicate: [
        "mumtaz",
        "jayyid_jiddan",
        "jayyid",
        "maqbul",
        "belum_lulus",
      ],
      gender: ["L", "P"],
      setoran_status: ["lancar", "kurang_lancar", "mengulang"],
    },
  },
} as const
