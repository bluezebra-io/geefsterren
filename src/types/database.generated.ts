export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_type: string
          actor_user_id: string | null
          after_json: Json | null
          before_json: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          location_id: string | null
          metadata_json: Json
          organization_id: string | null
        }
        Insert: {
          action: string
          actor_type?: string
          actor_user_id?: string | null
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          location_id?: string | null
          metadata_json?: Json
          organization_id?: string | null
        }
        Update: {
          action?: string
          actor_type?: string
          actor_user_id?: string | null
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          location_id?: string | null
          metadata_json?: Json
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          ends_at: string | null
          google_review_invitation_enabled: boolean
          id: string
          location_id: string
          name: string
          organization_id: string
          questionnaire_version_id: string
          starts_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          google_review_invitation_enabled?: boolean
          id?: string
          location_id: string
          name: string
          organization_id: string
          questionnaire_version_id: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          google_review_invitation_enabled?: boolean
          id?: string
          location_id?: string
          name?: string
          organization_id?: string
          questionnaire_version_id?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_location_fk"
            columns: ["organization_id", "location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "campaigns_questionnaire_version_id_fkey"
            columns: ["questionnaire_version_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_answers: {
        Row: {
          answer_json: Json | null
          created_at: string
          feedback_submission_id: string
          id: string
          organization_id: string
          question_id: string
          selected_option_id: string | null
        }
        Insert: {
          answer_json?: Json | null
          created_at?: string
          feedback_submission_id: string
          id?: string
          organization_id: string
          question_id: string
          selected_option_id?: string | null
        }
        Update: {
          answer_json?: Json | null
          created_at?: string
          feedback_submission_id?: string
          id?: string
          organization_id?: string
          question_id?: string
          selected_option_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_answers_submission_fk"
            columns: ["feedback_submission_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "feedback_submissions"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      feedback_sessions: {
        Row: {
          campaign_id: string
          completed_at: string | null
          expires_at: string
          id: string
          idempotency_key: string | null
          ip_hash: string | null
          location_id: string
          organization_id: string
          qr_code_id: string
          started_at: string
          status: string
          user_agent_hash: string | null
        }
        Insert: {
          campaign_id: string
          completed_at?: string | null
          expires_at: string
          id?: string
          idempotency_key?: string | null
          ip_hash?: string | null
          location_id: string
          organization_id: string
          qr_code_id: string
          started_at?: string
          status?: string
          user_agent_hash?: string | null
        }
        Update: {
          campaign_id?: string
          completed_at?: string | null
          expires_at?: string
          id?: string
          idempotency_key?: string | null
          ip_hash?: string | null
          location_id?: string
          organization_id?: string
          qr_code_id?: string
          started_at?: string
          status?: string
          user_agent_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_sessions_location_fk"
            columns: ["organization_id", "location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "feedback_sessions_qr_fk"
            columns: ["qr_code_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      feedback_submissions: {
        Row: {
          campaign_id: string
          consent_version: string
          feedback_session_id: string
          free_text_comment: string | null
          id: string
          location_id: string
          organization_id: string
          overall_score: number
          questionnaire_version_id: string
          source_channel: string
          submitted_at: string
        }
        Insert: {
          campaign_id: string
          consent_version?: string
          feedback_session_id: string
          free_text_comment?: string | null
          id?: string
          location_id: string
          organization_id: string
          overall_score: number
          questionnaire_version_id: string
          source_channel?: string
          submitted_at?: string
        }
        Update: {
          campaign_id?: string
          consent_version?: string
          feedback_session_id?: string
          free_text_comment?: string | null
          id?: string
          location_id?: string
          organization_id?: string
          overall_score?: number
          questionnaire_version_id?: string
          source_channel?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_submissions_location_fk"
            columns: ["organization_id", "location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "feedback_submissions_questionnaire_version_id_fkey"
            columns: ["questionnaire_version_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_submissions_session_fk"
            columns: ["feedback_session_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "feedback_sessions"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      location_memberships: {
        Row: {
          created_at: string
          id: string
          location_id: string
          organization_id: string
          role: Database["public"]["Enums"]["location_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          organization_id: string
          role: Database["public"]["Enums"]["location_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["location_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_memberships_location_fk"
            columns: ["organization_id", "location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "location_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      location_questionnaire_assignments: {
        Row: {
          active_from: string
          active_until: string | null
          created_at: string
          id: string
          location_id: string | null
          organization_id: string
          questionnaire_version_id: string
          status: string
          updated_at: string
        }
        Insert: {
          active_from?: string
          active_until?: string | null
          created_at?: string
          id?: string
          location_id?: string | null
          organization_id: string
          questionnaire_version_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          active_from?: string
          active_until?: string | null
          created_at?: string
          id?: string
          location_id?: string | null
          organization_id?: string
          questionnaire_version_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_location_fk"
            columns: ["organization_id", "location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "location_questionnaire_assignment_questionnaire_version_id_fkey"
            columns: ["questionnaire_version_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_questionnaire_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address_json: Json
          archived_at: string | null
          created_at: string
          external_reference: string | null
          google_review_url: string | null
          id: string
          name: string
          organization_id: string
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          timezone: string
          updated_at: string
        }
        Insert: {
          address_json?: Json
          archived_at?: string | null
          created_at?: string
          external_reference?: string | null
          google_review_url?: string | null
          id?: string
          name: string
          organization_id: string
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          timezone?: string
          updated_at?: string
        }
        Update: {
          address_json?: Json
          archived_at?: string | null
          created_at?: string
          external_reference?: string | null
          google_review_url?: string | null
          id?: string
          name?: string
          organization_id?: string
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      organizations: {
        Row: {
          archived_at: string | null
          created_at: string
          default_timezone: string
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          default_timezone?: string
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          default_timezone?: string
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          platform_role: Database["public"]["Enums"]["platform_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          platform_role?: Database["public"]["Enums"]["platform_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          platform_role?: Database["public"]["Enums"]["platform_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          active_from: string
          active_until: string | null
          campaign_id: string
          created_at: string
          feedback_code_encrypted: string | null
          feedback_code_hash: string | null
          id: string
          label: string | null
          location_id: string
          organization_id: string
          scan_count: number
          source_channel: string
          status: string
          token_encrypted: string | null
          token_hash: string
          updated_at: string
        }
        Insert: {
          active_from?: string
          active_until?: string | null
          campaign_id: string
          created_at?: string
          feedback_code_encrypted?: string | null
          feedback_code_hash?: string | null
          id?: string
          label?: string | null
          location_id: string
          organization_id: string
          scan_count?: number
          source_channel?: string
          status?: string
          token_encrypted?: string | null
          token_hash: string
          updated_at?: string
        }
        Update: {
          active_from?: string
          active_until?: string | null
          campaign_id?: string
          created_at?: string
          feedback_code_encrypted?: string | null
          feedback_code_hash?: string | null
          id?: string
          label?: string | null
          location_id?: string
          organization_id?: string
          scan_count?: number
          source_channel?: string
          status?: string
          token_encrypted?: string | null
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_campaign_fk"
            columns: ["campaign_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "qr_codes_location_fk"
            columns: ["organization_id", "location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      question_options: {
        Row: {
          display_order: number
          id: string
          label: string
          metadata_json: Json
          option_key: string
          organization_id: string | null
          question_id: string
        }
        Insert: {
          display_order?: number
          id?: string
          label: string
          metadata_json?: Json
          option_key: string
          organization_id?: string | null
          question_id: string
        }
        Update: {
          display_order?: number
          id?: string
          label?: string
          metadata_json?: Json
          option_key?: string
          organization_id?: string | null
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_fk"
            columns: ["question_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      questionnaire_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry: string | null
          name: string
          organization_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          name: string
          organization_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          name?: string
          organization_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_versions: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          published_at: string | null
          questionnaire_template_id: string
          status: string
          updated_at: string
          version_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          published_at?: string | null
          questionnaire_template_id: string
          status?: string
          updated_at?: string
          version_number: number
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          published_at?: string | null
          questionnaire_template_id?: string
          status?: string
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_versions_template_fk"
            columns: ["questionnaire_template_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_templates"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      questions: {
        Row: {
          category: string | null
          condition_json: Json | null
          created_at: string
          display_order: number
          help_text: string | null
          id: string
          label: string
          organization_id: string | null
          question_key: string
          question_type: string
          questionnaire_version_id: string
          required: boolean
        }
        Insert: {
          category?: string | null
          condition_json?: Json | null
          created_at?: string
          display_order?: number
          help_text?: string | null
          id?: string
          label: string
          organization_id?: string | null
          question_key: string
          question_type: string
          questionnaire_version_id: string
          required?: boolean
        }
        Update: {
          category?: string | null
          condition_json?: Json | null
          created_at?: string
          display_order?: number
          help_text?: string | null
          id?: string
          label?: string
          organization_id?: string | null
          question_key?: string
          question_type?: string
          questionnaire_version_id?: string
          required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "questions_version_fk"
            columns: ["questionnaire_version_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_versions"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_location: { Args: { p_location_id: string }; Returns: boolean }
      can_manage_location: { Args: { p_location_id: string }; Returns: boolean }
      increment_qr_scan: { Args: { p_qr_code_id: string }; Returns: undefined }
      location_period_metrics: {
        Args: { p_from?: string; p_location_id: string; p_to?: string }
        Returns: {
          average_score: number
          completion_percentage: number
          low_score_percentage: number
          response_count: number
          score_1: number
          score_2: number
          score_3: number
          score_4: number
          score_5: number
          session_count: number
        }[]
      }
      question_results: {
        Args: { p_from?: string; p_location_id: string; p_to?: string }
        Returns: {
          average_rating: number
          category: string
          display_order: number
          option_count: number
          option_id: string
          option_key: string
          option_label: string
          option_order: number
          option_share: number
          question_id: string
          question_key: string
          question_label: string
          question_type: string
          respondent_count: number
        }[]
      }
      write_audit_log: {
        Args: {
          p_action: string
          p_after_json?: Json
          p_before_json?: Json
          p_entity_id?: string
          p_entity_type: string
          p_location_id?: string
          p_metadata_json?: Json
          p_organization_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      entity_status: "active" | "inactive" | "archived"
      location_role: "location_manager" | "viewer"
      membership_status: "invited" | "active" | "suspended"
      organization_role: "org_admin" | "location_manager" | "viewer"
      platform_role: "none" | "platform_support" | "platform_admin"
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
      entity_status: ["active", "inactive", "archived"],
      location_role: ["location_manager", "viewer"],
      membership_status: ["invited", "active", "suspended"],
      organization_role: ["org_admin", "location_manager", "viewer"],
      platform_role: ["none", "platform_support", "platform_admin"],
    },
  },
} as const

