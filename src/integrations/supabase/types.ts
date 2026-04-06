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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accepted_deliveries: {
        Row: {
          accepted_at: string | null
          amount: number
          buyer_id: string
          created_at: string | null
          delivery_id: string
          freelancer_id: string
          id: string
          order_id: string
        }
        Insert: {
          accepted_at?: string | null
          amount?: number
          buyer_id: string
          created_at?: string | null
          delivery_id: string
          freelancer_id: string
          id?: string
          order_id: string
        }
        Update: {
          accepted_at?: string | null
          amount?: number
          buyer_id?: string
          created_at?: string | null
          delivery_id?: string
          freelancer_id?: string
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accepted_deliveries_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "order_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accepted_deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_support_tickets: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          message: string
          status: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          message: string
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      buyers: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string | null
          freelancer_id: string
          id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          freelancer_id: string
          id?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          freelancer_id?: string
          id?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          buyer_id: string
          created_at: string | null
          details: string | null
          freelancer_id: string
          id: string
          order_id: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          details?: string | null
          freelancer_id: string
          id?: string
          order_id: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          details?: string | null
          freelancer_id?: string
          id?: string
          order_id?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_faqs: {
        Row: {
          answer: string
          created_at: string | null
          freelancer_id: string
          id: string
          question: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          freelancer_id: string
          id?: string
          question: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          freelancer_id?: string
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_faqs_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_support_tickets: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          message: string
          status: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          message: string
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      freelancers: {
        Row: {
          bio: string | null
          completed_orders: number | null
          created_at: string | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          ranking_score: number | null
          rating: number | null
          skills: string[] | null
          total_earnings: number | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          completed_orders?: number | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          ranking_score?: number | null
          rating?: number | null
          skills?: string[] | null
          total_earnings?: number | null
          user_id: string
        }
        Update: {
          bio?: string | null
          completed_orders?: number | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          ranking_score?: number | null
          rating?: number | null
          skills?: string[] | null
          total_earnings?: number | null
          user_id?: string
        }
        Relationships: []
      }
      gig_media: {
        Row: {
          created_at: string | null
          file_type: Database["public"]["Enums"]["media_type"]
          file_url: string
          gig_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          file_type?: Database["public"]["Enums"]["media_type"]
          file_url: string
          gig_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          file_type?: Database["public"]["Enums"]["media_type"]
          file_url?: string
          gig_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gig_media_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_packages: {
        Row: {
          created_at: string | null
          delivery_time: string | null
          features: string[] | null
          gig_id: string
          id: string
          is_active: boolean | null
          name: string
          package_type: string
          price: number
          revisions: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_time?: string | null
          features?: string[] | null
          gig_id: string
          id?: string
          is_active?: boolean | null
          name: string
          package_type: string
          price?: number
          revisions?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_time?: string | null
          features?: string[] | null
          gig_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          package_type?: string
          price?: number
          revisions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gig_packages_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_reviews: {
        Row: {
          buyer_id: string
          comment: string | null
          created_at: string | null
          gig_id: string
          id: string
          order_id: string | null
          rating: number
        }
        Insert: {
          buyer_id: string
          comment?: string | null
          created_at?: string | null
          gig_id: string
          id?: string
          order_id?: string | null
          rating: number
        }
        Update: {
          buyer_id?: string
          comment?: string | null
          created_at?: string | null
          gig_id?: string
          id?: string
          order_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "gig_reviews_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      gigs: {
        Row: {
          base_price: number
          buyer_requirements: string | null
          category_id: string | null
          created_at: string | null
          delivery_time_days: number | null
          description: string
          freelancer_id: string
          id: string
          images: string[] | null
          status: Database["public"]["Enums"]["gig_status"] | null
          subcategory_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number
          buyer_requirements?: string | null
          category_id?: string | null
          created_at?: string | null
          delivery_time_days?: number | null
          description?: string
          freelancer_id: string
          id?: string
          images?: string[] | null
          status?: Database["public"]["Enums"]["gig_status"] | null
          subcategory_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          buyer_requirements?: string | null
          category_id?: string | null
          created_at?: string | null
          delivery_time_days?: number | null
          description?: string
          freelancer_id?: string
          id?: string
          images?: string[] | null
          status?: Database["public"]["Enums"]["gig_status"] | null
          subcategory_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gigs_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gigs_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_deliveries: {
        Row: {
          delivered_at: string | null
          delivery_file_url: string | null
          delivery_link: string | null
          delivery_message: string | null
          id: string
          order_id: string
          status: Database["public"]["Enums"]["delivery_status"] | null
        }
        Insert: {
          delivered_at?: string | null
          delivery_file_url?: string | null
          delivery_link?: string | null
          delivery_message?: string | null
          id?: string
          order_id: string
          status?: Database["public"]["Enums"]["delivery_status"] | null
        }
        Update: {
          delivered_at?: string | null
          delivery_file_url?: string | null
          delivery_link?: string | null
          delivery_message?: string | null
          id?: string
          order_id?: string
          status?: Database["public"]["Enums"]["delivery_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "order_deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_requirement_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          order_requirement_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          order_requirement_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          order_requirement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_requirement_files_order_requirement_id_fkey"
            columns: ["order_requirement_id"]
            isOneToOne: false
            referencedRelation: "order_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      order_requirements: {
        Row: {
          created_at: string | null
          external_links: string[] | null
          id: string
          instructions: string | null
          order_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_links?: string[] | null
          id?: string
          instructions?: string | null
          order_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_links?: string[] | null
          id?: string
          instructions?: string | null
          order_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_requirements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string | null
          freelancer_id: string
          gig_id: string | null
          id: string
          package_name: string | null
          payment_method: string | null
          payment_proof_url: string | null
          payment_status: string | null
          requirements: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          buyer_id: string
          created_at?: string | null
          freelancer_id: string
          gig_id?: string | null
          id?: string
          package_name?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_status?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string | null
          freelancer_id?: string
          gig_id?: string | null
          id?: string
          package_name?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_status?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          languages: string[] | null
          last_seen: string | null
          location: string | null
          member_since: string | null
          professional_title: string | null
          profile_image_url: string | null
          role: Database["public"]["Enums"]["app_role"]
          skills: string[] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          languages?: string[] | null
          last_seen?: string | null
          location?: string | null
          member_since?: string | null
          professional_title?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          skills?: string[] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          languages?: string[] | null
          last_seen?: string | null
          location?: string | null
          member_since?: string | null
          professional_title?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          skills?: string[] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          message: string
          status: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          message: string
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          admin: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          admin: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          admin?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          document_type: string
          document_url: string
          id: string
          note: string | null
          personal_info: Json | null
          professional_info: Json | null
          status: Database["public"]["Enums"]["verification_status"] | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          document_type?: string
          document_url: string
          id?: string
          note?: string | null
          personal_info?: Json | null
          professional_info?: Json | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          document_type?: string
          document_url?: string
          id?: string
          note?: string | null
          personal_info?: Json | null
          professional_info?: Json | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account_number: string | null
          amount: number
          bank_name: string | null
          freelancer_id: string
          id: string
          mobile_number: string | null
          mobile_provider: string | null
          processed_at: string | null
          requested_at: string | null
          status: Database["public"]["Enums"]["withdrawal_status"] | null
        }
        Insert: {
          account_number?: string | null
          amount: number
          bank_name?: string | null
          freelancer_id: string
          id?: string
          mobile_number?: string | null
          mobile_provider?: string | null
          processed_at?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
        }
        Update: {
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          freelancer_id?: string
          id?: string
          mobile_number?: string | null
          mobile_provider?: string | null
          processed_at?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
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
    }
    Enums: {
      app_role: "freelancer" | "buyer" | "admin"
      delivery_status: "submitted" | "approved" | "revision_requested"
      gig_status: "active" | "paused" | "draft"
      media_type: "image" | "video" | "document"
      order_status:
        | "pending"
        | "in_progress"
        | "delivered"
        | "completed"
        | "cancelled"
      ticket_status: "open" | "in_progress" | "resolved"
      verification_status: "pending" | "approved" | "rejected"
      withdrawal_status: "pending" | "approved" | "rejected" | "completed"
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
      app_role: ["freelancer", "buyer", "admin"],
      delivery_status: ["submitted", "approved", "revision_requested"],
      gig_status: ["active", "paused", "draft"],
      media_type: ["image", "video", "document"],
      order_status: [
        "pending",
        "in_progress",
        "delivered",
        "completed",
        "cancelled",
      ],
      ticket_status: ["open", "in_progress", "resolved"],
      verification_status: ["pending", "approved", "rejected"],
      withdrawal_status: ["pending", "approved", "rejected", "completed"],
    },
  },
} as const
