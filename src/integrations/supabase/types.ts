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
      admin_action_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      admin_announcements: {
        Row: {
          audience: string
          created_at: string
          created_by: string | null
          id: string
          message: string
          severity: string
          title: string
        }
        Insert: {
          audience?: string
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          severity?: string
          title: string
        }
        Update: {
          audience?: string
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          severity?: string
          title?: string
        }
        Relationships: []
      }
      blue_tick_applications: {
        Row: {
          admin_notes: string | null
          created_at: string
          experience: string | null
          freelancer_id: string
          id: string
          portfolio_links: string[] | null
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          experience?: string | null
          freelancer_id: string
          id?: string
          portfolio_links?: string[] | null
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          experience?: string | null
          freelancer_id?: string
          id?: string
          portfolio_links?: string[] | null
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          industry: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
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
      dispute_messages: {
        Row: {
          attachment_url: string | null
          body: string
          created_at: string
          dispute_id: string
          id: string
          sender_id: string
          sender_role: Database["public"]["Enums"]["dispute_sender_role"]
        }
        Insert: {
          attachment_url?: string | null
          body?: string
          created_at?: string
          dispute_id: string
          id?: string
          sender_id: string
          sender_role: Database["public"]["Enums"]["dispute_sender_role"]
        }
        Update: {
          attachment_url?: string | null
          body?: string
          created_at?: string
          dispute_id?: string
          id?: string
          sender_id?: string
          sender_role?: Database["public"]["Enums"]["dispute_sender_role"]
        }
        Relationships: [
          {
            foreignKeyName: "dispute_messages_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "freelancer_faqs_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "public_freelancers"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_portfolio: {
        Row: {
          created_at: string
          freelancer_id: string
          id: string
          media_type: string
          media_url: string
          position: number
        }
        Insert: {
          created_at?: string
          freelancer_id: string
          id?: string
          media_type: string
          media_url: string
          position?: number
        }
        Update: {
          created_at?: string
          freelancer_id?: string
          id?: string
          media_type?: string
          media_url?: string
          position?: number
        }
        Relationships: []
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
          blue_tick_granted_at: string | null
          blue_tick_removed_at: string | null
          blue_tick_removed_reason: string | null
          completed_orders: number | null
          created_at: string | null
          education_level: string | null
          has_blue_tick: boolean
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          professional_title: string | null
          ranking_score: number | null
          rating: number | null
          skills: string[] | null
          software_tools: Json | null
          total_earnings: number | null
          user_id: string
          verification_removal_reason: string | null
          verification_removed_at: string | null
          verification_removed_by: string | null
          verified_at: string | null
          vip_expires_at: string | null
          vip_started_at: string | null
          vip_tier: Database["public"]["Enums"]["vip_tier"] | null
          years_experience: string | null
        }
        Insert: {
          bio?: string | null
          blue_tick_granted_at?: string | null
          blue_tick_removed_at?: string | null
          blue_tick_removed_reason?: string | null
          completed_orders?: number | null
          created_at?: string | null
          education_level?: string | null
          has_blue_tick?: boolean
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          professional_title?: string | null
          ranking_score?: number | null
          rating?: number | null
          skills?: string[] | null
          software_tools?: Json | null
          total_earnings?: number | null
          user_id: string
          verification_removal_reason?: string | null
          verification_removed_at?: string | null
          verification_removed_by?: string | null
          verified_at?: string | null
          vip_expires_at?: string | null
          vip_started_at?: string | null
          vip_tier?: Database["public"]["Enums"]["vip_tier"] | null
          years_experience?: string | null
        }
        Update: {
          bio?: string | null
          blue_tick_granted_at?: string | null
          blue_tick_removed_at?: string | null
          blue_tick_removed_reason?: string | null
          completed_orders?: number | null
          created_at?: string | null
          education_level?: string | null
          has_blue_tick?: boolean
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          professional_title?: string | null
          ranking_score?: number | null
          rating?: number | null
          skills?: string[] | null
          software_tools?: Json | null
          total_earnings?: number | null
          user_id?: string
          verification_removal_reason?: string | null
          verification_removed_at?: string | null
          verification_removed_by?: string | null
          verified_at?: string | null
          vip_expires_at?: string | null
          vip_started_at?: string | null
          vip_tier?: Database["public"]["Enums"]["vip_tier"] | null
          years_experience?: string | null
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
          category_slug: string | null
          created_at: string | null
          delivery_time_days: number | null
          description: string
          freelancer_id: string
          id: string
          images: string[] | null
          is_vip: boolean
          status: Database["public"]["Enums"]["gig_status"] | null
          subcategory_id: string | null
          subcategory_slug: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number
          buyer_requirements?: string | null
          category_id?: string | null
          category_slug?: string | null
          created_at?: string | null
          delivery_time_days?: number | null
          description?: string
          freelancer_id: string
          id?: string
          images?: string[] | null
          is_vip?: boolean
          status?: Database["public"]["Enums"]["gig_status"] | null
          subcategory_id?: string | null
          subcategory_slug?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          buyer_requirements?: string | null
          category_id?: string | null
          category_slug?: string | null
          created_at?: string | null
          delivery_time_days?: number | null
          description?: string
          freelancer_id?: string
          id?: string
          images?: string[] | null
          is_vip?: boolean
          status?: Database["public"]["Enums"]["gig_status"] | null
          subcategory_id?: string | null
          subcategory_slug?: string | null
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
            foreignKeyName: "gigs_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "public_freelancers"
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
          created_at: string
          delivered_at: string | null
          delivery_file_url: string | null
          delivery_link: string | null
          delivery_message: string | null
          id: string
          order_id: string
          revision_feedback: string | null
          revision_requested_at: string | null
          status: Database["public"]["Enums"]["delivery_status"] | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          delivery_file_url?: string | null
          delivery_link?: string | null
          delivery_message?: string | null
          id?: string
          order_id: string
          revision_feedback?: string | null
          revision_requested_at?: string | null
          status?: Database["public"]["Enums"]["delivery_status"] | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          delivery_file_url?: string | null
          delivery_link?: string | null
          delivery_message?: string | null
          id?: string
          order_id?: string
          revision_feedback?: string | null
          revision_requested_at?: string | null
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
            foreignKeyName: "orders_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "public_freelancers"
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
      platform_settings: {
        Row: {
          escrow_hold_days: number
          homepage_announcement: string | null
          id: boolean
          maintenance_mode: boolean
          platform_fee_percent: number
          updated_at: string
          updated_by: string | null
          withdrawal_min: number
        }
        Insert: {
          escrow_hold_days?: number
          homepage_announcement?: string | null
          id?: boolean
          maintenance_mode?: boolean
          platform_fee_percent?: number
          updated_at?: string
          updated_by?: string | null
          withdrawal_min?: number
        }
        Update: {
          escrow_hold_days?: number
          homepage_announcement?: string | null
          id?: boolean
          maintenance_mode?: boolean
          platform_fee_percent?: number
          updated_at?: string
          updated_by?: string | null
          withdrawal_min?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          industry: string | null
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
          industry?: string | null
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
          industry?: string | null
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
      somadz_ads: {
        Row: {
          audience: string
          created_at: string
          created_by: string | null
          cta_color: string
          cta_position: string
          cta_size: string
          cta_style: string
          cta_text: string | null
          cta_url: string | null
          focal_x: number
          focal_y: number
          id: string
          is_active: boolean
          media_path: string
          media_type: string
          placement: string
          title: string
          updated_at: string
          zoom: number
        }
        Insert: {
          audience?: string
          created_at?: string
          created_by?: string | null
          cta_color?: string
          cta_position?: string
          cta_size?: string
          cta_style?: string
          cta_text?: string | null
          cta_url?: string | null
          focal_x?: number
          focal_y?: number
          id?: string
          is_active?: boolean
          media_path: string
          media_type: string
          placement: string
          title: string
          updated_at?: string
          zoom?: number
        }
        Update: {
          audience?: string
          created_at?: string
          created_by?: string | null
          cta_color?: string
          cta_position?: string
          cta_size?: string
          cta_style?: string
          cta_text?: string | null
          cta_url?: string | null
          focal_x?: number
          focal_y?: number
          id?: string
          is_active?: boolean
          media_path?: string
          media_type?: string
          placement?: string
          title?: string
          updated_at?: string
          zoom?: number
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
      support_ticket_replies: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          message: string
          sender_id: string
          ticket_id: string
          ticket_table: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          sender_id: string
          ticket_id: string
          ticket_table: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          sender_id?: string
          ticket_id?: string
          ticket_table?: string
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
      system_conversations: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          status: string
          type: Database["public"]["Enums"]["system_convo_type"]
          unread_admin: number
          unread_user: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          status?: string
          type: Database["public"]["Enums"]["system_convo_type"]
          unread_admin?: number
          unread_user?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          status?: string
          type?: Database["public"]["Enums"]["system_convo_type"]
          unread_admin?: number
          unread_user?: number
          user_id?: string
        }
        Relationships: []
      }
      system_messages: {
        Row: {
          admin_id: string | null
          attachment_url: string | null
          body: string
          conversation_id: string
          created_at: string
          id: string
          is_read_admin: boolean
          is_read_user: boolean
          sender_type: Database["public"]["Enums"]["system_sender_type"]
        }
        Insert: {
          admin_id?: string | null
          attachment_url?: string | null
          body?: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read_admin?: boolean
          is_read_user?: boolean
          sender_type: Database["public"]["Enums"]["system_sender_type"]
        }
        Update: {
          admin_id?: string | null
          attachment_url?: string | null
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read_admin?: boolean
          is_read_user?: boolean
          sender_type?: Database["public"]["Enums"]["system_sender_type"]
        }
        Relationships: [
          {
            foreignKeyName: "system_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "system_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reports: {
        Row: {
          admin_notes: string | null
          category: string
          context_url: string | null
          created_at: string
          details: string | null
          id: string
          reason: string
          related_gig_id: string | null
          related_message_id: string | null
          related_order_id: string | null
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          category?: string
          context_url?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          related_gig_id?: string | null
          related_message_id?: string | null
          related_order_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          context_url?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          related_gig_id?: string | null
          related_message_id?: string | null
          related_order_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      vip_memberships: {
        Row: {
          activated_at: string | null
          created_at: string
          expires_at: string | null
          freelancer_id: string | null
          granted_by: string | null
          id: string
          notes: string | null
          payment_status: string
          tier: Database["public"]["Enums"]["vip_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          expires_at?: string | null
          freelancer_id?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          payment_status?: string
          tier: Database["public"]["Enums"]["vip_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          expires_at?: string | null
          freelancer_id?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          payment_status?: string
          tier?: Database["public"]["Enums"]["vip_tier"]
          updated_at?: string
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
          city: string | null
          country: string | null
          country_code: string | null
          fee_amount: number
          fee_percent: number
          freelancer_id: string
          id: string
          method: string | null
          mobile_number: string | null
          mobile_provider: string | null
          net_amount: number
          processed_at: string | null
          reason: string | null
          receiver_first_name: string | null
          receiver_last_name: string | null
          receiver_middle_name: string | null
          requested_at: string | null
          status: Database["public"]["Enums"]["withdrawal_status"] | null
          swift_code: string | null
        }
        Insert: {
          account_number?: string | null
          amount: number
          bank_name?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          fee_amount?: number
          fee_percent?: number
          freelancer_id: string
          id?: string
          method?: string | null
          mobile_number?: string | null
          mobile_provider?: string | null
          net_amount?: number
          processed_at?: string | null
          reason?: string | null
          receiver_first_name?: string | null
          receiver_last_name?: string | null
          receiver_middle_name?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          swift_code?: string | null
        }
        Update: {
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          fee_amount?: number
          fee_percent?: number
          freelancer_id?: string
          id?: string
          method?: string | null
          mobile_number?: string | null
          mobile_provider?: string | null
          net_amount?: number
          processed_at?: string | null
          reason?: string | null
          receiver_first_name?: string | null
          receiver_last_name?: string | null
          receiver_middle_name?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          swift_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "public_freelancers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_freelancers: {
        Row: {
          bio: string | null
          blue_tick_granted_at: string | null
          completed_orders: number | null
          created_at: string | null
          education_level: string | null
          has_blue_tick: boolean | null
          id: string | null
          is_featured: boolean | null
          is_verified: boolean | null
          professional_title: string | null
          rating: number | null
          skills: string[] | null
          software_tools: Json | null
          user_id: string | null
          verified_at: string | null
          years_experience: string | null
        }
        Insert: {
          bio?: string | null
          blue_tick_granted_at?: string | null
          completed_orders?: number | null
          created_at?: string | null
          education_level?: string | null
          has_blue_tick?: boolean | null
          id?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          professional_title?: string | null
          rating?: number | null
          skills?: string[] | null
          software_tools?: Json | null
          user_id?: string | null
          verified_at?: string | null
          years_experience?: string | null
        }
        Update: {
          bio?: string | null
          blue_tick_granted_at?: string | null
          completed_orders?: number | null
          created_at?: string | null
          education_level?: string | null
          has_blue_tick?: boolean | null
          id?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          professional_title?: string | null
          rating?: number | null
          skills?: string[] | null
          software_tools?: Json | null
          user_id?: string | null
          verified_at?: string | null
          years_experience?: string | null
        }
        Relationships: []
      }
      public_gig_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          gig_id: string | null
          id: string | null
          rating: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          gig_id?: string | null
          id?: string | null
          rating?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          gig_id?: string | null
          id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gig_reviews_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          languages: string[] | null
          last_seen: string | null
          location: string | null
          member_since: string | null
          professional_title: string | null
          profile_image_url: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          skills: string[] | null
          username: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          languages?: string[] | null
          last_seen?: string | null
          location?: string | null
          member_since?: string | null
          professional_title?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          skills?: string[] | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          languages?: string[] | null
          last_seen?: string | null
          location?: string | null
          member_since?: string | null
          professional_title?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          skills?: string[] | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_get_profiles: {
        Args: { _ids: string[] }
        Returns: {
          bio: string
          created_at: string
          email: string
          full_name: string
          id: string
          industry: string
          last_seen: string
          location: string
          member_since: string
          professional_title: string
          profile_image_url: string
          role: Database["public"]["Enums"]["app_role"]
          username: string
        }[]
      }
      admin_grant_blue_tick: {
        Args: { _application_id?: string; _notes?: string; _user_id: string }
        Returns: undefined
      }
      admin_reject_blue_tick: {
        Args: { _application_id: string; _notes?: string }
        Returns: undefined
      }
      admin_remove_vip: { Args: { _user_id: string }; Returns: undefined }
      admin_revoke_blue_tick: {
        Args: { _reason?: string; _user_id: string }
        Returns: undefined
      }
      admin_set_vip: {
        Args: {
          _tier: Database["public"]["Enums"]["vip_tier"]
          _user_id: string
        }
        Returns: undefined
      }
      bootstrap_system_conversations: {
        Args: { _user_id: string }
        Returns: undefined
      }
      broadcast_news: {
        Args: { _attachment_url: string; _audience: string; _body: string }
        Returns: number
      }
      expire_vip_memberships: { Args: never; Returns: number }
      get_freelancer_gig_limit: {
        Args: { _freelancer_id: string }
        Returns: number
      }
      get_withdrawal_fee_percent: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_user: { Args: { _user_id: string }; Returns: boolean }
      is_dispute_participant: {
        Args: { _dispute_id: string; _user_id: string }
        Returns: boolean
      }
      touch_last_seen: { Args: never; Returns: undefined }
      user_owns_support_ticket: {
        Args: { _ticket_id: string; _ticket_table: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "freelancer" | "buyer" | "admin" | "super_admin" | "user"
      delivery_status: "submitted" | "approved" | "revision_requested"
      dispute_sender_role: "buyer" | "freelancer" | "admin"
      gig_status: "active" | "paused" | "draft"
      media_type: "image" | "video" | "document"
      order_status:
        | "pending"
        | "in_progress"
        | "delivered"
        | "completed"
        | "cancelled"
      system_convo_type: "support" | "news"
      system_sender_type: "user" | "admin" | "system"
      ticket_status: "open" | "in_progress" | "resolved"
      verification_status: "pending" | "approved" | "rejected"
      vip_tier: "golden" | "platinum"
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
      app_role: ["freelancer", "buyer", "admin", "super_admin", "user"],
      delivery_status: ["submitted", "approved", "revision_requested"],
      dispute_sender_role: ["buyer", "freelancer", "admin"],
      gig_status: ["active", "paused", "draft"],
      media_type: ["image", "video", "document"],
      order_status: [
        "pending",
        "in_progress",
        "delivered",
        "completed",
        "cancelled",
      ],
      system_convo_type: ["support", "news"],
      system_sender_type: ["user", "admin", "system"],
      ticket_status: ["open", "in_progress", "resolved"],
      verification_status: ["pending", "approved", "rejected"],
      vip_tier: ["golden", "platinum"],
      withdrawal_status: ["pending", "approved", "rejected", "completed"],
    },
  },
} as const
