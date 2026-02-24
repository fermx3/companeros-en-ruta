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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action_enum"]
          created_at: string | null
          entity_id: string | null
          entity_name: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action_enum"]
          created_at?: string | null
          entity_id?: string | null
          entity_name: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action_enum"]
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_communication_plan_activities: {
        Row: {
          activity_description: string | null
          activity_name: string
          communication_plan_id: string
          created_at: string | null
          id: string
          is_recurring: boolean | null
          recurrence_pattern: string | null
          scheduled_date: string | null
        }
        Insert: {
          activity_description?: string | null
          activity_name: string
          communication_plan_id: string
          created_at?: string | null
          id?: string
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          scheduled_date?: string | null
        }
        Update: {
          activity_description?: string | null
          activity_name?: string
          communication_plan_id?: string
          created_at?: string | null
          id?: string
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          scheduled_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_communication_plan_activities_communication_plan_id_fkey"
            columns: ["communication_plan_id"]
            isOneToOne: false
            referencedRelation: "brand_communication_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_communication_plan_materials: {
        Row: {
          communication_plan_id: string
          created_at: string | null
          id: string
          placement_notes: string | null
          pop_material_id: string
          quantity_required: number | null
        }
        Insert: {
          communication_plan_id: string
          created_at?: string | null
          id?: string
          placement_notes?: string | null
          pop_material_id: string
          quantity_required?: number | null
        }
        Update: {
          communication_plan_id?: string
          created_at?: string | null
          id?: string
          placement_notes?: string | null
          pop_material_id?: string
          quantity_required?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_communication_plan_materials_communication_plan_id_fkey"
            columns: ["communication_plan_id"]
            isOneToOne: false
            referencedRelation: "brand_communication_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_communication_plan_materials_pop_material_id_fkey"
            columns: ["pop_material_id"]
            isOneToOne: false
            referencedRelation: "brand_pop_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_communication_plans: {
        Row: {
          brand_id: string
          created_at: string | null
          deleted_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          plan_name: string
          plan_period: string | null
          public_id: string | null
          start_date: string
          target_locations: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          deleted_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          plan_name: string
          plan_period?: string | null
          public_id?: string | null
          start_date: string
          target_locations?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          deleted_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          plan_name?: string
          plan_period?: string | null
          public_id?: string | null
          start_date?: string
          target_locations?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_competitor_product_sizes: {
        Row: {
          competitor_product_id: string
          created_at: string | null
          id: string
          is_default: boolean | null
          size_unit: string | null
          size_value: number
        }
        Insert: {
          competitor_product_id: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          size_unit?: string | null
          size_value: number
        }
        Update: {
          competitor_product_id?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          size_unit?: string | null
          size_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "brand_competitor_product_sizes_competitor_product_id_fkey"
            columns: ["competitor_product_id"]
            isOneToOne: false
            referencedRelation: "brand_competitor_products"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_competitor_products: {
        Row: {
          competitor_id: string
          created_at: string | null
          default_size_grams: number | null
          default_size_ml: number | null
          id: string
          is_active: boolean | null
          product_name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          competitor_id: string
          created_at?: string | null
          default_size_grams?: number | null
          default_size_ml?: number | null
          id?: string
          is_active?: boolean | null
          product_name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          competitor_id?: string
          created_at?: string | null
          default_size_grams?: number | null
          default_size_ml?: number | null
          id?: string
          is_active?: boolean | null
          product_name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_competitor_products_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "brand_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_competitor_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_competitor_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_competitor_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_competitor_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_competitor_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_competitors: {
        Row: {
          brand_id: string
          competitor_name: string
          created_at: string | null
          deleted_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          public_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          competitor_name: string
          created_at?: string | null
          deleted_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          public_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          competitor_name?: string
          created_at?: string | null
          deleted_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          public_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_competitors_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_competitors_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_competitors_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_competitors_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_competitors_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_competitors_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_competitors_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_competitors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_competitors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_competitors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_competitors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_competitors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_exhibitions: {
        Row: {
          brand_id: string
          communication_plan_id: string | null
          created_at: string | null
          deleted_at: string | null
          end_date: string | null
          exhibition_name: string
          id: string
          is_active: boolean | null
          location_description: string | null
          negotiated_period: string | null
          product_id: string | null
          public_id: string | null
          start_date: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          communication_plan_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          end_date?: string | null
          exhibition_name: string
          id?: string
          is_active?: boolean | null
          location_description?: string | null
          negotiated_period?: string | null
          product_id?: string | null
          public_id?: string | null
          start_date?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          communication_plan_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          end_date?: string | null
          exhibition_name?: string
          id?: string
          is_active?: boolean | null
          location_description?: string | null
          negotiated_period?: string | null
          product_id?: string | null
          public_id?: string | null
          start_date?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_exhibitions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_exhibitions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_exhibitions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_exhibitions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_exhibitions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_exhibitions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_exhibitions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_exhibitions_communication_plan_id_fkey"
            columns: ["communication_plan_id"]
            isOneToOne: false
            referencedRelation: "brand_communication_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_exhibitions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_exhibitions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "brand_exhibitions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_exhibitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_exhibitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_exhibitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_exhibitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_exhibitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_pop_materials: {
        Row: {
          brand_id: string | null
          created_at: string | null
          deleted_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_system_template: boolean | null
          material_category: string | null
          material_name: string
          public_id: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_system_template?: boolean | null
          material_category?: string | null
          material_name: string
          public_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_system_template?: boolean | null
          material_category?: string | null
          material_name?: string
          public_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_pop_materials_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_pop_materials_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_pop_materials_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_pop_materials_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_pop_materials_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_pop_materials_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_pop_materials_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "brand_pop_materials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_pop_materials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_pop_materials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_pop_materials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brand_pop_materials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          brand_color_primary: string | null
          brand_color_secondary: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          dashboard_metrics: Json | null
          dashboard_metrics_updated_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          public_id: string
          settings: Json | null
          slug: string
          status: Database["public"]["Enums"]["brand_status_enum"] | null
          tenant_id: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          brand_color_primary?: string | null
          brand_color_secondary?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          dashboard_metrics?: Json | null
          dashboard_metrics_updated_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          public_id?: string
          settings?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["brand_status_enum"] | null
          tenant_id: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          brand_color_primary?: string | null
          brand_color_secondary?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          dashboard_metrics?: Json | null
          dashboard_metrics_updated_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          public_id?: string
          settings?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["brand_status_enum"] | null
          tenant_id?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          attachments: Json | null
          brand_id: string
          budget_spent: number | null
          budget_total: number | null
          campaign_objectives: Json | null
          campaign_tags: Json | null
          campaign_type: Database["public"]["Enums"]["campaign_type_enum"]
          channels: Json | null
          competitive_context: string | null
          created_at: string | null
          created_by: string
          deleted_at: string | null
          description: string | null
          end_date: string
          geographic_scope: Json | null
          id: string
          is_template: boolean | null
          key_messages: Json | null
          launch_checklist: Json | null
          launch_ready: boolean | null
          lessons_learned: string | null
          name: string
          performance_metrics: Json | null
          post_campaign_analysis: string | null
          public_id: string
          roi_actual: number | null
          roi_target: number | null
          start_date: string
          status: Database["public"]["Enums"]["campaign_status_enum"] | null
          success_criteria: Json | null
          target_audience: Json | null
          template_name: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          brand_id: string
          budget_spent?: number | null
          budget_total?: number | null
          campaign_objectives?: Json | null
          campaign_tags?: Json | null
          campaign_type: Database["public"]["Enums"]["campaign_type_enum"]
          channels?: Json | null
          competitive_context?: string | null
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          description?: string | null
          end_date: string
          geographic_scope?: Json | null
          id?: string
          is_template?: boolean | null
          key_messages?: Json | null
          launch_checklist?: Json | null
          launch_ready?: boolean | null
          lessons_learned?: string | null
          name: string
          performance_metrics?: Json | null
          post_campaign_analysis?: string | null
          public_id?: string
          roi_actual?: number | null
          roi_target?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["campaign_status_enum"] | null
          success_criteria?: Json | null
          target_audience?: Json | null
          template_name?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          brand_id?: string
          budget_spent?: number | null
          budget_total?: number | null
          campaign_objectives?: Json | null
          campaign_tags?: Json | null
          campaign_type?: Database["public"]["Enums"]["campaign_type_enum"]
          channels?: Json | null
          competitive_context?: string | null
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          end_date?: string
          geographic_scope?: Json | null
          id?: string
          is_template?: boolean | null
          key_messages?: Json | null
          launch_checklist?: Json | null
          launch_ready?: boolean | null
          lessons_learned?: string | null
          name?: string
          performance_metrics?: Json | null
          post_campaign_analysis?: string | null
          public_id?: string
          roi_actual?: number | null
          roi_target?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["campaign_status_enum"] | null
          success_criteria?: Json | null
          target_audience?: Json | null
          template_name?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_assignments: {
        Row: {
          assigned_by: string | null
          assigned_date: string | null
          assignment_type: string | null
          brand_id: string | null
          client_id: string
          created_at: string | null
          deleted_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          priority: number | null
          public_id: string
          tenant_id: string
          updated_at: string | null
          user_profile_id: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_date?: string | null
          assignment_type?: string | null
          brand_id?: string | null
          client_id: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          priority?: number | null
          public_id?: string
          tenant_id: string
          updated_at?: string | null
          user_profile_id: string
        }
        Update: {
          assigned_by?: string | null
          assigned_date?: string | null
          assignment_type?: string | null
          brand_id?: string | null
          client_id?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          priority?: number | null
          public_id?: string
          tenant_id?: string
          updated_at?: string | null
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_client_assignments_advisor_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_advisor_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "advisor_client_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_brand_memberships: {
        Row: {
          approved_by: string | null
          approved_date: string | null
          brand_id: string
          client_id: string
          communication_preferences: Json | null
          created_at: string | null
          current_tier_id: string | null
          deleted_at: string | null
          id: string
          is_primary_brand: boolean | null
          joined_date: string | null
          last_points_earned_date: string | null
          last_purchase_date: string | null
          lifetime_points: number | null
          membership_preferences: Json | null
          membership_status:
            | Database["public"]["Enums"]["membership_status_enum"]
            | null
          points_balance: number | null
          public_id: string
          tenant_id: string
          terms_accepted_date: string | null
          terms_version: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          brand_id: string
          client_id: string
          communication_preferences?: Json | null
          created_at?: string | null
          current_tier_id?: string | null
          deleted_at?: string | null
          id?: string
          is_primary_brand?: boolean | null
          joined_date?: string | null
          last_points_earned_date?: string | null
          last_purchase_date?: string | null
          lifetime_points?: number | null
          membership_preferences?: Json | null
          membership_status?:
            | Database["public"]["Enums"]["membership_status_enum"]
            | null
          points_balance?: number | null
          public_id?: string
          tenant_id: string
          terms_accepted_date?: string | null
          terms_version?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          brand_id?: string
          client_id?: string
          communication_preferences?: Json | null
          created_at?: string | null
          current_tier_id?: string | null
          deleted_at?: string | null
          id?: string
          is_primary_brand?: boolean | null
          joined_date?: string | null
          last_points_earned_date?: string | null
          last_purchase_date?: string | null
          lifetime_points?: number | null
          membership_preferences?: Json | null
          membership_status?:
            | Database["public"]["Enums"]["membership_status_enum"]
            | null
          points_balance?: number | null
          public_id?: string
          tenant_id?: string
          terms_accepted_date?: string | null
          terms_version?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_brand_memberships_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_current_tier_id_fkey"
            columns: ["current_tier_id"]
            isOneToOne: false
            referencedRelation: "active_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_current_tier_id_fkey"
            columns: ["current_tier_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["tier_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_current_tier_id_fkey"
            columns: ["current_tier_id"]
            isOneToOne: false
            referencedRelation: "tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_invoice_data: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_neighborhood: string | null
          address_postal_code: string
          address_state: string | null
          address_street: string | null
          business_name: string
          cfdi_use: string | null
          client_id: string
          created_at: string | null
          deleted_at: string | null
          email_invoice: string | null
          id: string
          invoice_name: string
          is_active: boolean | null
          is_preferred: boolean | null
          notes: string | null
          payment_form: string | null
          payment_method: string | null
          person_type: Database["public"]["Enums"]["rfc_person_type_enum"]
          public_id: string
          rfc: string
          tax_regime: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_neighborhood?: string | null
          address_postal_code: string
          address_state?: string | null
          address_street?: string | null
          business_name: string
          cfdi_use?: string | null
          client_id: string
          created_at?: string | null
          deleted_at?: string | null
          email_invoice?: string | null
          id?: string
          invoice_name: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          notes?: string | null
          payment_form?: string | null
          payment_method?: string | null
          person_type: Database["public"]["Enums"]["rfc_person_type_enum"]
          public_id?: string
          rfc: string
          tax_regime?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_neighborhood?: string | null
          address_postal_code?: string
          address_state?: string | null
          address_street?: string | null
          business_name?: string
          cfdi_use?: string | null
          client_id?: string
          created_at?: string | null
          deleted_at?: string | null
          email_invoice?: string | null
          id?: string
          invoice_name?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          notes?: string | null
          payment_form?: string | null
          payment_method?: string | null
          person_type?: Database["public"]["Enums"]["rfc_person_type_enum"]
          public_id?: string
          rfc?: string
          tax_regime?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_invoice_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoice_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoice_data_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoice_data_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_invoice_data_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_invoice_data_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_invoice_data_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tier_assignments: {
        Row: {
          assigned_by: string | null
          assigned_date: string
          assignment_notes: string | null
          assignment_type: Database["public"]["Enums"]["tier_assignment_type_enum"]
          auto_assignment_rule_id: string | null
          benefits_activated: boolean | null
          client_acknowledgment: boolean | null
          client_brand_membership_id: string
          created_at: string | null
          deleted_at: string | null
          effective_from: string
          effective_until: string | null
          evaluation_period_end: string | null
          evaluation_period_start: string | null
          id: string
          is_current: boolean | null
          metadata: Json | null
          notification_sent: boolean | null
          notification_sent_at: string | null
          points_at_assignment: number | null
          previous_tier_id: string | null
          public_id: string
          purchase_amount_at_assignment: number | null
          purchases_at_assignment: number | null
          reason: string | null
          tenant_id: string
          tier_id: string
          updated_at: string | null
          visits_at_assignment: number | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_date: string
          assignment_notes?: string | null
          assignment_type: Database["public"]["Enums"]["tier_assignment_type_enum"]
          auto_assignment_rule_id?: string | null
          benefits_activated?: boolean | null
          client_acknowledgment?: boolean | null
          client_brand_membership_id: string
          created_at?: string | null
          deleted_at?: string | null
          effective_from: string
          effective_until?: string | null
          evaluation_period_end?: string | null
          evaluation_period_start?: string | null
          id?: string
          is_current?: boolean | null
          metadata?: Json | null
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          points_at_assignment?: number | null
          previous_tier_id?: string | null
          public_id?: string
          purchase_amount_at_assignment?: number | null
          purchases_at_assignment?: number | null
          reason?: string | null
          tenant_id: string
          tier_id: string
          updated_at?: string | null
          visits_at_assignment?: number | null
        }
        Update: {
          assigned_by?: string | null
          assigned_date?: string
          assignment_notes?: string | null
          assignment_type?: Database["public"]["Enums"]["tier_assignment_type_enum"]
          auto_assignment_rule_id?: string | null
          benefits_activated?: boolean | null
          client_acknowledgment?: boolean | null
          client_brand_membership_id?: string
          created_at?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_until?: string | null
          evaluation_period_end?: string | null
          evaluation_period_start?: string | null
          id?: string
          is_current?: boolean | null
          metadata?: Json | null
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          points_at_assignment?: number | null
          previous_tier_id?: string | null
          public_id?: string
          purchase_amount_at_assignment?: number | null
          purchases_at_assignment?: number | null
          reason?: string | null
          tenant_id?: string
          tier_id?: string
          updated_at?: string | null
          visits_at_assignment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_tier_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "active_client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_previous_tier_id_fkey"
            columns: ["previous_tier_id"]
            isOneToOne: false
            referencedRelation: "active_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_previous_tier_id_fkey"
            columns: ["previous_tier_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["tier_id"]
          },
          {
            foreignKeyName: "client_tier_assignments_previous_tier_id_fkey"
            columns: ["previous_tier_id"]
            isOneToOne: false
            referencedRelation: "tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "active_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["tier_id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_types: {
        Row: {
          assessment_frequency_days: number | null
          category: Database["public"]["Enums"]["client_type_category_enum"]
          characteristics: Json | null
          code: string
          created_at: string | null
          default_visit_frequency_days: number | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          kpi_targets: Json | null
          name: string
          public_id: string
          requires_assessment: boolean | null
          requires_inventory: boolean | null
          sort_order: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          assessment_frequency_days?: number | null
          category: Database["public"]["Enums"]["client_type_category_enum"]
          characteristics?: Json | null
          code: string
          created_at?: string | null
          default_visit_frequency_days?: number | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          kpi_targets?: Json | null
          name: string
          public_id?: string
          requires_assessment?: boolean | null
          requires_inventory?: boolean | null
          sort_order?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          assessment_frequency_days?: number | null
          category?: Database["public"]["Enums"]["client_type_category_enum"]
          characteristics?: Json | null
          code?: string
          created_at?: string | null
          default_visit_frequency_days?: number | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          kpi_targets?: Json | null
          name?: string
          public_id?: string
          requires_assessment?: boolean | null
          requires_inventory?: boolean | null
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          accepts_card: boolean | null
          address_city: string
          address_country: string | null
          address_neighborhood: string | null
          address_postal_code: string | null
          address_state: string
          address_street: string
          assessment_frequency_days: number | null
          business_name: string
          client_type_id: string
          commercial_structure_id: string
          coordinates: unknown
          created_at: string | null
          credit_limit: number | null
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          email_opt_in: boolean
          gender: string | null
          has_meat_fridge: boolean | null
          has_soda_fridge: boolean | null
          id: string
          last_visit_date: string | null
          latitude: number | null
          legal_name: string | null
          longitude: number | null
          market_id: string
          metadata: Json | null
          minimum_order: number | null
          notes: string | null
          onboarding_completed: boolean
          owner_last_name: string | null
          owner_name: string
          payment_terms: string | null
          phone: string | null
          public_id: string
          registration_date: string | null
          status: Database["public"]["Enums"]["client_status_enum"] | null
          tax_id: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string | null
          visit_frequency_days: number | null
          whatsapp: string | null
          whatsapp_opt_in: boolean
          zone_id: string
        }
        Insert: {
          accepts_card?: boolean | null
          address_city: string
          address_country?: string | null
          address_neighborhood?: string | null
          address_postal_code?: string | null
          address_state: string
          address_street: string
          assessment_frequency_days?: number | null
          business_name: string
          client_type_id: string
          commercial_structure_id: string
          coordinates?: unknown
          created_at?: string | null
          credit_limit?: number | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          email_opt_in?: boolean
          gender?: string | null
          has_meat_fridge?: boolean | null
          has_soda_fridge?: boolean | null
          id?: string
          last_visit_date?: string | null
          latitude?: number | null
          legal_name?: string | null
          longitude?: number | null
          market_id: string
          metadata?: Json | null
          minimum_order?: number | null
          notes?: string | null
          onboarding_completed?: boolean
          owner_last_name?: string | null
          owner_name: string
          payment_terms?: string | null
          phone?: string | null
          public_id?: string
          registration_date?: string | null
          status?: Database["public"]["Enums"]["client_status_enum"] | null
          tax_id?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id?: string | null
          visit_frequency_days?: number | null
          whatsapp?: string | null
          whatsapp_opt_in?: boolean
          zone_id: string
        }
        Update: {
          accepts_card?: boolean | null
          address_city?: string
          address_country?: string | null
          address_neighborhood?: string | null
          address_postal_code?: string | null
          address_state?: string
          address_street?: string
          assessment_frequency_days?: number | null
          business_name?: string
          client_type_id?: string
          commercial_structure_id?: string
          coordinates?: unknown
          created_at?: string | null
          credit_limit?: number | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          email_opt_in?: boolean
          gender?: string | null
          has_meat_fridge?: boolean | null
          has_soda_fridge?: boolean | null
          id?: string
          last_visit_date?: string | null
          latitude?: number | null
          legal_name?: string | null
          longitude?: number | null
          market_id?: string
          metadata?: Json | null
          minimum_order?: number | null
          notes?: string | null
          onboarding_completed?: boolean
          owner_last_name?: string | null
          owner_name?: string
          payment_terms?: string | null
          phone?: string | null
          public_id?: string
          registration_date?: string | null
          status?: Database["public"]["Enums"]["client_status_enum"] | null
          tax_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string | null
          visit_frequency_days?: number | null
          whatsapp?: string | null
          whatsapp_opt_in?: boolean
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_client_type_id_fkey"
            columns: ["client_type_id"]
            isOneToOne: false
            referencedRelation: "active_client_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_client_type_id_fkey"
            columns: ["client_type_id"]
            isOneToOne: false
            referencedRelation: "client_type_kpi_analysis"
            referencedColumns: ["client_type_id"]
          },
          {
            foreignKeyName: "clients_client_type_id_fkey"
            columns: ["client_type_id"]
            isOneToOne: false
            referencedRelation: "client_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_commercial_structure_id_fkey"
            columns: ["commercial_structure_id"]
            isOneToOne: false
            referencedRelation: "active_commercial_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_commercial_structure_id_fkey"
            columns: ["commercial_structure_id"]
            isOneToOne: false
            referencedRelation: "commercial_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "active_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "market_stats"
            referencedColumns: ["market_id"]
          },
          {
            foreignKeyName: "clients_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_structures: {
        Row: {
          code: string
          commission_structure: Json | null
          contact_company: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          coverage_zones: Json | null
          created_at: string | null
          deleted_at: string | null
          delivery_time_days: number | null
          description: string | null
          id: string
          is_active: boolean | null
          minimum_order: number | null
          name: string
          payment_terms: string | null
          public_id: string
          sort_order: number | null
          structure_type: Database["public"]["Enums"]["commercial_structure_type_enum"]
          supported_markets: Json | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          commission_structure?: Json | null
          contact_company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          coverage_zones?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          delivery_time_days?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          minimum_order?: number | null
          name: string
          payment_terms?: string | null
          public_id?: string
          sort_order?: number | null
          structure_type: Database["public"]["Enums"]["commercial_structure_type_enum"]
          supported_markets?: Json | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          commission_structure?: Json | null
          contact_company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          coverage_zones?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          delivery_time_days?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          minimum_order?: number | null
          name?: string
          payment_terms?: string | null
          public_id?: string
          sort_order?: number | null
          structure_type?: Database["public"]["Enums"]["commercial_structure_type_enum"]
          supported_markets?: Json | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_structures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_structures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "commercial_structures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "commercial_structures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "commercial_structures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      distributor_brands: {
        Row: {
          brand_id: string
          created_at: string
          distributor_id: string
          id: string
          tenant_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          distributor_id: string
          id?: string
          tenant_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          distributor_id?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "distributor_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributor_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "distributor_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "distributor_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "distributor_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "distributor_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributor_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "distributor_brands_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "active_distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributor_brands_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributor_brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributor_brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "distributor_brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "distributor_brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "distributor_brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      distributors: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_postal_code: string | null
          address_state: string | null
          address_street: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          deleted_at: string | null
          id: string
          legal_name: string | null
          metadata: Json | null
          name: string
          notes: string | null
          public_id: string
          rfc: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          address_street?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          legal_name?: string | null
          metadata?: Json | null
          name: string
          notes?: string | null
          public_id?: string
          rfc?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          address_street?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          legal_name?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          public_id?: string
          rfc?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distributors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "distributors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "distributors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "distributors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_definitions: {
        Row: {
          color: string | null
          computation_type: string
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          slug: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          computation_type: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          slug: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          computation_type?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          slug?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_definitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_definitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "kpi_definitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "kpi_definitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "kpi_definitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_targets: {
        Row: {
          brand_id: string
          created_at: string
          deleted_at: string | null
          id: string
          kpi_slug: string
          notes: string | null
          period_end: string
          period_start: string
          period_type: string
          target_unit: string
          target_value: number
          tenant_id: string
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          kpi_slug: string
          notes?: string | null
          period_end: string
          period_start: string
          period_type: string
          target_unit: string
          target_value: number
          tenant_id: string
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          kpi_slug?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          target_unit?: string
          target_value?: number
          tenant_id?: string
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_targets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_targets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "kpi_targets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "kpi_targets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "kpi_targets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "kpi_targets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_targets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "kpi_targets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_targets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "kpi_targets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "kpi_targets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "kpi_targets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_targets_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          characteristics: Json | null
          code: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          public_id: string
          sort_order: number | null
          target_volume_max: number | null
          target_volume_min: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          characteristics?: Json | null
          code: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          public_id?: string
          sort_order?: number | null
          target_volume_max?: number | null
          target_volume_min?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          characteristics?: Json | null
          code?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          public_id?: string
          sort_order?: number | null
          target_volume_max?: number | null
          target_volume_min?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          notification_type: Database["public"]["Enums"]["notification_type_enum"]
          read_at: string | null
          tenant_id: string
          title: string
          updated_at: string
          user_profile_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type_enum"]
          read_at?: string | null
          tenant_id: string
          title: string
          updated_at?: string
          user_profile_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type_enum"]
          read_at?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          batch_number: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string
          deleted_at: string | null
          delivery_notes: string | null
          expiration_date_delivered: string | null
          expiration_date_requested: string | null
          free_item: boolean | null
          id: string
          item_notes: string | null
          item_status:
            | Database["public"]["Enums"]["order_item_status_enum"]
            | null
          line_discount_amount: number | null
          line_discount_percentage: number | null
          line_number: number
          line_subtotal: number
          line_total: number
          metadata: Json | null
          order_id: string
          product_id: string
          product_variant_id: string | null
          promotion_applied: boolean | null
          public_id: string
          quality_notes: string | null
          quality_rating: number | null
          quantity_confirmed: number | null
          quantity_delivered: number | null
          quantity_ordered: number
          refund_amount: number | null
          return_reason: string | null
          returned_quantity: number | null
          substitute_product_id: string | null
          substitute_variant_id: string | null
          substitution_reason: string | null
          tax_amount: number | null
          tax_rate: number | null
          tenant_id: string
          unit_cost: number | null
          unit_price: number
          unit_type: Database["public"]["Enums"]["order_item_unit_type_enum"]
          updated_at: string | null
          volume_per_unit_ml: number | null
          weight_per_unit_grams: number | null
        }
        Insert: {
          batch_number?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          deleted_at?: string | null
          delivery_notes?: string | null
          expiration_date_delivered?: string | null
          expiration_date_requested?: string | null
          free_item?: boolean | null
          id?: string
          item_notes?: string | null
          item_status?:
            | Database["public"]["Enums"]["order_item_status_enum"]
            | null
          line_discount_amount?: number | null
          line_discount_percentage?: number | null
          line_number: number
          line_subtotal: number
          line_total: number
          metadata?: Json | null
          order_id: string
          product_id: string
          product_variant_id?: string | null
          promotion_applied?: boolean | null
          public_id?: string
          quality_notes?: string | null
          quality_rating?: number | null
          quantity_confirmed?: number | null
          quantity_delivered?: number | null
          quantity_ordered: number
          refund_amount?: number | null
          return_reason?: string | null
          returned_quantity?: number | null
          substitute_product_id?: string | null
          substitute_variant_id?: string | null
          substitution_reason?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          tenant_id: string
          unit_cost?: number | null
          unit_price: number
          unit_type: Database["public"]["Enums"]["order_item_unit_type_enum"]
          updated_at?: string | null
          volume_per_unit_ml?: number | null
          weight_per_unit_grams?: number | null
        }
        Update: {
          batch_number?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          deleted_at?: string | null
          delivery_notes?: string | null
          expiration_date_delivered?: string | null
          expiration_date_requested?: string | null
          free_item?: boolean | null
          id?: string
          item_notes?: string | null
          item_status?:
            | Database["public"]["Enums"]["order_item_status_enum"]
            | null
          line_discount_amount?: number | null
          line_discount_percentage?: number | null
          line_number?: number
          line_subtotal?: number
          line_total?: number
          metadata?: Json | null
          order_id?: string
          product_id?: string
          product_variant_id?: string | null
          promotion_applied?: boolean | null
          public_id?: string
          quality_notes?: string | null
          quality_rating?: number | null
          quantity_confirmed?: number | null
          quantity_delivered?: number | null
          quantity_ordered?: number
          refund_amount?: number | null
          return_reason?: string | null
          returned_quantity?: number | null
          substitute_product_id?: string | null
          substitute_variant_id?: string | null
          substitution_reason?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          tenant_id?: string
          unit_cost?: number | null
          unit_price?: number
          unit_type?: Database["public"]["Enums"]["order_item_unit_type_enum"]
          updated_at?: string | null
          volume_per_unit_ml?: number | null
          weight_per_unit_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_items_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "active_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_product_variant"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_product_variant"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_substitute_product"
            columns: ["substitute_product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_substitute_product"
            columns: ["substitute_product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_order_items_substitute_product"
            columns: ["substitute_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_substitute_variant"
            columns: ["substitute_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_substitute_variant"
            columns: ["substitute_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "fk_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "fk_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "fk_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          assigned_to: string | null
          brand_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_id: string
          client_invoice_data_id: string | null
          client_notes: string | null
          commercial_structure_id: string
          confirmed_delivery_date: string | null
          created_at: string | null
          currency: string | null
          customer_feedback: string | null
          customer_rating: number | null
          deleted_at: string | null
          delivery_address: string | null
          delivery_confirmation: Json | null
          delivery_instructions: string | null
          delivery_time_slot: string | null
          discount_amount: number | null
          distributor_id: string | null
          estimated_delivery_time: unknown
          id: string
          internal_notes: string | null
          invoice_required: boolean | null
          metadata: Json | null
          order_attachments: Json | null
          order_date: string
          order_number: string
          order_status: Database["public"]["Enums"]["order_status_enum"] | null
          order_type: Database["public"]["Enums"]["order_type_enum"] | null
          payment_method:
            | Database["public"]["Enums"]["order_payment_method_enum"]
            | null
          payment_status:
            | Database["public"]["Enums"]["order_payment_status_enum"]
            | null
          payment_terms: string | null
          priority: Database["public"]["Enums"]["order_priority_enum"] | null
          public_id: string
          requested_delivery_date: string | null
          shipping_cost: number | null
          source_channel:
            | Database["public"]["Enums"]["order_source_channel_enum"]
            | null
          subtotal: number
          tax_amount: number | null
          tenant_id: string
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          assigned_to?: string | null
          brand_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id: string
          client_invoice_data_id?: string | null
          client_notes?: string | null
          commercial_structure_id: string
          confirmed_delivery_date?: string | null
          created_at?: string | null
          currency?: string | null
          customer_feedback?: string | null
          customer_rating?: number | null
          deleted_at?: string | null
          delivery_address?: string | null
          delivery_confirmation?: Json | null
          delivery_instructions?: string | null
          delivery_time_slot?: string | null
          discount_amount?: number | null
          distributor_id?: string | null
          estimated_delivery_time?: unknown
          id?: string
          internal_notes?: string | null
          invoice_required?: boolean | null
          metadata?: Json | null
          order_attachments?: Json | null
          order_date: string
          order_number: string
          order_status?: Database["public"]["Enums"]["order_status_enum"] | null
          order_type?: Database["public"]["Enums"]["order_type_enum"] | null
          payment_method?:
            | Database["public"]["Enums"]["order_payment_method_enum"]
            | null
          payment_status?:
            | Database["public"]["Enums"]["order_payment_status_enum"]
            | null
          payment_terms?: string | null
          priority?: Database["public"]["Enums"]["order_priority_enum"] | null
          public_id?: string
          requested_delivery_date?: string | null
          shipping_cost?: number | null
          source_channel?:
            | Database["public"]["Enums"]["order_source_channel_enum"]
            | null
          subtotal?: number
          tax_amount?: number | null
          tenant_id: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          assigned_to?: string | null
          brand_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id?: string
          client_invoice_data_id?: string | null
          client_notes?: string | null
          commercial_structure_id?: string
          confirmed_delivery_date?: string | null
          created_at?: string | null
          currency?: string | null
          customer_feedback?: string | null
          customer_rating?: number | null
          deleted_at?: string | null
          delivery_address?: string | null
          delivery_confirmation?: Json | null
          delivery_instructions?: string | null
          delivery_time_slot?: string | null
          discount_amount?: number | null
          distributor_id?: string | null
          estimated_delivery_time?: unknown
          id?: string
          internal_notes?: string | null
          invoice_required?: boolean | null
          metadata?: Json | null
          order_attachments?: Json | null
          order_date?: string
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_status_enum"] | null
          order_type?: Database["public"]["Enums"]["order_type_enum"] | null
          payment_method?:
            | Database["public"]["Enums"]["order_payment_method_enum"]
            | null
          payment_status?:
            | Database["public"]["Enums"]["order_payment_status_enum"]
            | null
          payment_terms?: string | null
          priority?: Database["public"]["Enums"]["order_priority_enum"] | null
          public_id?: string
          requested_delivery_date?: string | null
          shipping_cost?: number | null
          source_channel?:
            | Database["public"]["Enums"]["order_source_channel_enum"]
            | null
          subtotal?: number
          tax_amount?: number | null
          tenant_id?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_invoice_data_id_fkey"
            columns: ["client_invoice_data_id"]
            isOneToOne: false
            referencedRelation: "active_client_invoice_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_invoice_data_id_fkey"
            columns: ["client_invoice_data_id"]
            isOneToOne: false
            referencedRelation: "client_invoice_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_commercial_structure_id_fkey"
            columns: ["commercial_structure_id"]
            isOneToOne: false
            referencedRelation: "active_commercial_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_commercial_structure_id_fkey"
            columns: ["commercial_structure_id"]
            isOneToOne: false
            referencedRelation: "commercial_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "active_distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      points_transactions: {
        Row: {
          approval_required: boolean | null
          approved_at: string | null
          approved_by: string | null
          balance_after: number
          base_points: number | null
          campaign_id: string | null
          client_brand_membership_id: string
          created_at: string | null
          deleted_at: string | null
          expiration_date: string | null
          expired_date: string | null
          id: string
          is_expired: boolean | null
          metadata: Json | null
          multiplier_applied: number | null
          notes: string | null
          points: number
          points_rule_id: string | null
          processed_by: string | null
          promotion_id: string | null
          public_id: string
          reversal_of: string | null
          reversed_by: string | null
          source_description: string | null
          source_id: string | null
          source_type: Database["public"]["Enums"]["points_source_type_enum"]
          tenant_id: string
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["points_transaction_type_enum"]
          updated_at: string | null
        }
        Insert: {
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          balance_after: number
          base_points?: number | null
          campaign_id?: string | null
          client_brand_membership_id: string
          created_at?: string | null
          deleted_at?: string | null
          expiration_date?: string | null
          expired_date?: string | null
          id?: string
          is_expired?: boolean | null
          metadata?: Json | null
          multiplier_applied?: number | null
          notes?: string | null
          points: number
          points_rule_id?: string | null
          processed_by?: string | null
          promotion_id?: string | null
          public_id?: string
          reversal_of?: string | null
          reversed_by?: string | null
          source_description?: string | null
          source_id?: string | null
          source_type: Database["public"]["Enums"]["points_source_type_enum"]
          tenant_id: string
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["points_transaction_type_enum"]
          updated_at?: string | null
        }
        Update: {
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          balance_after?: number
          base_points?: number | null
          campaign_id?: string | null
          client_brand_membership_id?: string
          created_at?: string | null
          deleted_at?: string | null
          expiration_date?: string | null
          expired_date?: string | null
          id?: string
          is_expired?: boolean | null
          metadata?: Json | null
          multiplier_applied?: number | null
          notes?: string | null
          points?: number
          points_rule_id?: string | null
          processed_by?: string | null
          promotion_id?: string | null
          public_id?: string
          reversal_of?: string | null
          reversed_by?: string | null
          source_description?: string | null
          source_id?: string | null
          source_type?: Database["public"]["Enums"]["points_source_type_enum"]
          tenant_id?: string
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["points_transaction_type_enum"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "points_transactions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "active_client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_reversal_of_fkey"
            columns: ["reversal_of"]
            isOneToOne: false
            referencedRelation: "active_points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_reversal_of_fkey"
            columns: ["reversal_of"]
            isOneToOne: false
            referencedRelation: "points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "active_points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "points_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "points_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "points_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          brand_id: string | null
          category_level: number | null
          characteristics: Json | null
          code: string
          color_hex: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_category_id: string | null
          public_id: string
          sort_order: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          category_level?: number | null
          characteristics?: Json | null
          code: string
          color_hex?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_category_id?: string | null
          public_id?: string
          sort_order?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          category_level?: number | null
          characteristics?: Json | null
          code?: string
          color_hex?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_category_id?: string | null
          public_id?: string
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "product_categories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "product_categories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "product_categories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "product_categories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "product_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "product_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "product_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "product_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          case_dimensions: Json | null
          case_weight_kg: number | null
          cost: number | null
          created_at: string | null
          deleted_at: string | null
          dimensions: Json | null
          discontinue_date: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          launch_date: string | null
          package_material: string | null
          package_type: string | null
          price: number
          product_id: string
          public_id: string
          size_unit: Database["public"]["Enums"]["product_variant_size_unit_enum"]
          size_value: number
          sort_order: number | null
          tenant_id: string
          units_per_case: number | null
          updated_at: string | null
          variant_code: string
          variant_image_url: string | null
          variant_name: string
          weight_grams: number | null
        }
        Insert: {
          barcode?: string | null
          case_dimensions?: Json | null
          case_weight_kg?: number | null
          cost?: number | null
          created_at?: string | null
          deleted_at?: string | null
          dimensions?: Json | null
          discontinue_date?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          launch_date?: string | null
          package_material?: string | null
          package_type?: string | null
          price: number
          product_id: string
          public_id?: string
          size_unit: Database["public"]["Enums"]["product_variant_size_unit_enum"]
          size_value: number
          sort_order?: number | null
          tenant_id: string
          units_per_case?: number | null
          updated_at?: string | null
          variant_code: string
          variant_image_url?: string | null
          variant_name: string
          weight_grams?: number | null
        }
        Update: {
          barcode?: string | null
          case_dimensions?: Json | null
          case_weight_kg?: number | null
          cost?: number | null
          created_at?: string | null
          deleted_at?: string | null
          dimensions?: Json | null
          discontinue_date?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          launch_date?: string | null
          package_material?: string | null
          package_type?: string | null
          price?: number
          product_id?: string
          public_id?: string
          size_unit?: Database["public"]["Enums"]["product_variant_size_unit_enum"]
          size_value?: number
          sort_order?: number | null
          tenant_id?: string
          units_per_case?: number | null
          updated_at?: string | null
          variant_code?: string
          variant_image_url?: string | null
          variant_name?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "product_variants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "product_variants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "product_variants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          base_price: number
          brand_id: string
          category_id: string
          cost: number | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          dimensions: Json | null
          discontinue_date: string | null
          gallery_urls: Json | null
          id: string
          include_in_assessment: boolean
          is_active: boolean | null
          is_featured: boolean | null
          launch_date: string | null
          margin_target: number | null
          marketing_tags: Json | null
          maximum_stock: number | null
          minimum_stock: number | null
          name: string
          product_image_url: string | null
          public_id: string
          requires_refrigeration: boolean | null
          shelf_life_days: number | null
          sku: string
          sort_order: number | null
          specifications: Json | null
          tenant_id: string
          unit_type:
            | Database["public"]["Enums"]["product_unit_type_enum"]
            | null
          updated_at: string | null
          volume_ml: number | null
          weight_grams: number | null
        }
        Insert: {
          barcode?: string | null
          base_price: number
          brand_id: string
          category_id: string
          cost?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          dimensions?: Json | null
          discontinue_date?: string | null
          gallery_urls?: Json | null
          id?: string
          include_in_assessment?: boolean
          is_active?: boolean | null
          is_featured?: boolean | null
          launch_date?: string | null
          margin_target?: number | null
          marketing_tags?: Json | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          name: string
          product_image_url?: string | null
          public_id?: string
          requires_refrigeration?: boolean | null
          shelf_life_days?: number | null
          sku: string
          sort_order?: number | null
          specifications?: Json | null
          tenant_id: string
          unit_type?:
            | Database["public"]["Enums"]["product_unit_type_enum"]
            | null
          updated_at?: string | null
          volume_ml?: number | null
          weight_grams?: number | null
        }
        Update: {
          barcode?: string | null
          base_price?: number
          brand_id?: string
          category_id?: string
          cost?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          dimensions?: Json | null
          discontinue_date?: string | null
          gallery_urls?: Json | null
          id?: string
          include_in_assessment?: boolean
          is_active?: boolean | null
          is_featured?: boolean | null
          launch_date?: string | null
          margin_target?: number | null
          marketing_tags?: Json | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          name?: string
          product_image_url?: string | null
          public_id?: string
          requires_refrigeration?: boolean | null
          shelf_life_days?: number | null
          sku?: string
          sort_order?: number | null
          specifications?: Json | null
          tenant_id?: string
          unit_type?:
            | Database["public"]["Enums"]["product_unit_type_enum"]
            | null
          updated_at?: string | null
          volume_ml?: number | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_redemptions: {
        Row: {
          applied_by: string | null
          applied_discount_amount: number | null
          applied_percentage: number | null
          auto_applied: boolean | null
          bonus_points_awarded: number | null
          client_brand_membership_id: string
          client_notification_sent: boolean | null
          created_at: string | null
          deleted_at: string | null
          free_items_quantity: number | null
          id: string
          internal_notes: string | null
          maximum_discount_reached: boolean | null
          metadata: Json | null
          minimum_met: boolean | null
          order_id: string
          order_subtotal_at_application: number | null
          order_type: Database["public"]["Enums"]["promotion_order_type_enum"]
          original_promotion_value: number | null
          points_multiplier_applied: number | null
          promotion_id: string
          promotion_type_applied: Database["public"]["Enums"]["promotion_type_applied_enum"]
          public_id: string
          redemption_date: string
          redemption_status:
            | Database["public"]["Enums"]["promotion_redemption_status_enum"]
            | null
          reversal_reason: string | null
          reversed_at: string | null
          reversed_by: string | null
          rules_validation: Json | null
          tenant_id: string
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
          validation_required: boolean | null
        }
        Insert: {
          applied_by?: string | null
          applied_discount_amount?: number | null
          applied_percentage?: number | null
          auto_applied?: boolean | null
          bonus_points_awarded?: number | null
          client_brand_membership_id: string
          client_notification_sent?: boolean | null
          created_at?: string | null
          deleted_at?: string | null
          free_items_quantity?: number | null
          id?: string
          internal_notes?: string | null
          maximum_discount_reached?: boolean | null
          metadata?: Json | null
          minimum_met?: boolean | null
          order_id: string
          order_subtotal_at_application?: number | null
          order_type: Database["public"]["Enums"]["promotion_order_type_enum"]
          original_promotion_value?: number | null
          points_multiplier_applied?: number | null
          promotion_id: string
          promotion_type_applied: Database["public"]["Enums"]["promotion_type_applied_enum"]
          public_id?: string
          redemption_date: string
          redemption_status?:
            | Database["public"]["Enums"]["promotion_redemption_status_enum"]
            | null
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          rules_validation?: Json | null
          tenant_id: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_required?: boolean | null
        }
        Update: {
          applied_by?: string | null
          applied_discount_amount?: number | null
          applied_percentage?: number | null
          auto_applied?: boolean | null
          bonus_points_awarded?: number | null
          client_brand_membership_id?: string
          client_notification_sent?: boolean | null
          created_at?: string | null
          deleted_at?: string | null
          free_items_quantity?: number | null
          id?: string
          internal_notes?: string | null
          maximum_discount_reached?: boolean | null
          metadata?: Json | null
          minimum_met?: boolean | null
          order_id?: string
          order_subtotal_at_application?: number | null
          order_type?: Database["public"]["Enums"]["promotion_order_type_enum"]
          original_promotion_value?: number | null
          points_multiplier_applied?: number | null
          promotion_id?: string
          promotion_type_applied?: Database["public"]["Enums"]["promotion_type_applied_enum"]
          public_id?: string
          redemption_date?: string
          redemption_status?:
            | Database["public"]["Enums"]["promotion_redemption_status_enum"]
            | null
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          rules_validation?: Json | null
          tenant_id?: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_redemptions_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "active_client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "active_promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotion_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotion_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotion_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_rules: {
        Row: {
          actual_reach: number | null
          apply_to_all: boolean | null
          created_at: string | null
          created_by: string
          custom_conditions: Json | null
          deleted_at: string | null
          effective_from: string | null
          effective_until: string | null
          estimated_reach: number | null
          id: string
          is_active: boolean | null
          is_inclusion: boolean | null
          last_calculated_at: string | null
          priority: number | null
          promotion_id: string
          public_id: string
          rule_description: string | null
          rule_name: string
          rule_type: Database["public"]["Enums"]["promotion_rule_type_enum"]
          target_categories: Json | null
          target_client_types: Json | null
          target_clients: Json | null
          target_commercial_structures: Json | null
          target_markets: Json | null
          target_products: Json | null
          target_states: Json | null
          target_tiers: Json | null
          target_zones: Json | null
          tenant_id: string
          updated_at: string | null
          validation_query: string | null
        }
        Insert: {
          actual_reach?: number | null
          apply_to_all?: boolean | null
          created_at?: string | null
          created_by: string
          custom_conditions?: Json | null
          deleted_at?: string | null
          effective_from?: string | null
          effective_until?: string | null
          estimated_reach?: number | null
          id?: string
          is_active?: boolean | null
          is_inclusion?: boolean | null
          last_calculated_at?: string | null
          priority?: number | null
          promotion_id: string
          public_id?: string
          rule_description?: string | null
          rule_name: string
          rule_type: Database["public"]["Enums"]["promotion_rule_type_enum"]
          target_categories?: Json | null
          target_client_types?: Json | null
          target_clients?: Json | null
          target_commercial_structures?: Json | null
          target_markets?: Json | null
          target_products?: Json | null
          target_states?: Json | null
          target_tiers?: Json | null
          target_zones?: Json | null
          tenant_id: string
          updated_at?: string | null
          validation_query?: string | null
        }
        Update: {
          actual_reach?: number | null
          apply_to_all?: boolean | null
          created_at?: string | null
          created_by?: string
          custom_conditions?: Json | null
          deleted_at?: string | null
          effective_from?: string | null
          effective_until?: string | null
          estimated_reach?: number | null
          id?: string
          is_active?: boolean | null
          is_inclusion?: boolean | null
          last_calculated_at?: string | null
          priority?: number | null
          promotion_id?: string
          public_id?: string
          rule_description?: string | null
          rule_name?: string
          rule_type?: Database["public"]["Enums"]["promotion_rule_type_enum"]
          target_categories?: Json | null
          target_client_types?: Json | null
          target_clients?: Json | null
          target_commercial_structures?: Json | null
          target_markets?: Json | null
          target_products?: Json | null
          target_states?: Json | null
          target_tiers?: Json | null
          target_zones?: Json | null
          tenant_id?: string
          updated_at?: string | null
          validation_query?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_rules_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "active_promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_rules_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotion_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotion_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotion_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          auto_apply: boolean | null
          brand_id: string
          budget_allocated: number | null
          budget_spent: number | null
          buy_quantity: number | null
          campaign_id: string | null
          created_at: string | null
          created_by: string
          creative_assets: Json | null
          days_of_week: Json | null
          deleted_at: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          end_date: string
          end_time: string | null
          get_quantity: number | null
          id: string
          internal_notes: string | null
          max_discount_amount: number | null
          min_purchase_amount: number | null
          name: string
          performance_metrics: Json | null
          points_multiplier: number | null
          priority: number | null
          promo_code: string | null
          promotion_type: Database["public"]["Enums"]["promotion_type_enum"]
          public_id: string
          requires_code: boolean | null
          stackable: boolean | null
          start_date: string
          start_time: string | null
          status: Database["public"]["Enums"]["promotion_status_enum"] | null
          tenant_id: string
          terms_and_conditions: string | null
          updated_at: string | null
          usage_count_total: number | null
          usage_limit_per_client: number | null
          usage_limit_total: number | null
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_apply?: boolean | null
          brand_id: string
          budget_allocated?: number | null
          budget_spent?: number | null
          buy_quantity?: number | null
          campaign_id?: string | null
          created_at?: string | null
          created_by: string
          creative_assets?: Json | null
          days_of_week?: Json | null
          deleted_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          end_date: string
          end_time?: string | null
          get_quantity?: number | null
          id?: string
          internal_notes?: string | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          name: string
          performance_metrics?: Json | null
          points_multiplier?: number | null
          priority?: number | null
          promo_code?: string | null
          promotion_type: Database["public"]["Enums"]["promotion_type_enum"]
          public_id?: string
          requires_code?: boolean | null
          stackable?: boolean | null
          start_date: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["promotion_status_enum"] | null
          tenant_id: string
          terms_and_conditions?: string | null
          updated_at?: string | null
          usage_count_total?: number | null
          usage_limit_per_client?: number | null
          usage_limit_total?: number | null
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_apply?: boolean | null
          brand_id?: string
          budget_allocated?: number | null
          budget_spent?: number | null
          buy_quantity?: number | null
          campaign_id?: string | null
          created_at?: string | null
          created_by?: string
          creative_assets?: Json | null
          days_of_week?: Json | null
          deleted_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          end_date?: string
          end_time?: string | null
          get_quantity?: number | null
          id?: string
          internal_notes?: string | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          name?: string
          performance_metrics?: Json | null
          points_multiplier?: number | null
          priority?: number | null
          promo_code?: string | null
          promotion_type?: Database["public"]["Enums"]["promotion_type_enum"]
          public_id?: string
          requires_code?: boolean | null
          stackable?: boolean | null
          start_date?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["promotion_status_enum"] | null
          tenant_id?: string
          terms_and_conditions?: string | null
          updated_at?: string | null
          usage_count_total?: number | null
          usage_limit_per_client?: number | null
          usage_limit_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "promotions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      promotor_assignments: {
        Row: {
          assigned_by: string | null
          assigned_date: string | null
          created_at: string | null
          deleted_at: string | null
          experience_level: Database["public"]["Enums"]["promotor_experience_level_enum"]
          id: string
          is_active: boolean | null
          monthly_quota: number | null
          performance_rating: number | null
          public_id: string
          specialization: Database["public"]["Enums"]["promotor_specialization_enum"]
          tenant_id: string
          updated_at: string | null
          user_profile_id: string
          zone_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          experience_level?: Database["public"]["Enums"]["promotor_experience_level_enum"]
          id?: string
          is_active?: boolean | null
          monthly_quota?: number | null
          performance_rating?: number | null
          public_id?: string
          specialization?: Database["public"]["Enums"]["promotor_specialization_enum"]
          tenant_id: string
          updated_at?: string | null
          user_profile_id: string
          zone_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          experience_level?: Database["public"]["Enums"]["promotor_experience_level_enum"]
          id?: string
          is_active?: boolean | null
          monthly_quota?: number | null
          performance_rating?: number | null
          public_id?: string
          specialization?: Database["public"]["Enums"]["promotor_specialization_enum"]
          tenant_id?: string
          updated_at?: string | null
          user_profile_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advisor_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_assignments_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_assignments_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_assignments_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          brand_id: string | null
          client_id: string
          code: string
          created_at: string | null
          deleted_at: string | null
          discount_description: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          max_redemptions: number
          metadata: Json | null
          promotion_id: string | null
          qr_type: string
          redemption_count: number
          status: Database["public"]["Enums"]["qr_status_enum"]
          tenant_id: string
          updated_at: string | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          brand_id?: string | null
          client_id: string
          code: string
          created_at?: string | null
          deleted_at?: string | null
          discount_description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          max_redemptions?: number
          metadata?: Json | null
          promotion_id?: string | null
          qr_type?: string
          redemption_count?: number
          status?: Database["public"]["Enums"]["qr_status_enum"]
          tenant_id: string
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          brand_id?: string | null
          client_id?: string
          code?: string
          created_at?: string | null
          deleted_at?: string | null
          discount_description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          max_redemptions?: number
          metadata?: Json | null
          promotion_id?: string | null
          qr_type?: string
          redemption_count?: number
          status?: Database["public"]["Enums"]["qr_status_enum"]
          tenant_id?: string
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "qr_codes_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "qr_codes_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "qr_codes_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "qr_codes_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "qr_codes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "active_promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "qr_codes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "qr_codes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "qr_codes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_redemptions: {
        Row: {
          created_at: string | null
          discount_type: string | null
          discount_value: number | null
          distributor_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          notes: string | null
          qr_code_id: string
          redeemed_at: string | null
          redeemed_by: string
          status: Database["public"]["Enums"]["qr_redemption_status_enum"]
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number | null
          distributor_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          notes?: string | null
          qr_code_id: string
          redeemed_at?: string | null
          redeemed_by: string
          status?: Database["public"]["Enums"]["qr_redemption_status_enum"]
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number | null
          distributor_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          notes?: string | null
          qr_code_id?: string
          redeemed_at?: string | null
          redeemed_by?: string
          status?: Database["public"]["Enums"]["qr_redemption_status_enum"]
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_redemptions_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "active_distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_redemptions_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_redemptions_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_redemptions_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_redemptions_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "qr_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "qr_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "qr_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemptions: {
        Row: {
          applied_amount: number | null
          applied_to_order_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_brand_membership_id: string
          client_notes: string | null
          created_at: string | null
          deleted_at: string | null
          expiration_date: string | null
          id: string
          metadata: Json | null
          notification_sent: boolean | null
          notification_sent_at: string | null
          original_reward_value: number
          points_transaction_id: string
          public_id: string
          redeemed_by: string | null
          redemption_code: string
          redemption_date: string
          redemption_status:
            | Database["public"]["Enums"]["redemption_status_enum"]
            | null
          refund_transaction_id: string | null
          reward_id: string
          tenant_id: string
          updated_at: string | null
          usage_instructions: string | null
          used_date: string | null
          validated_by: string | null
          validation_notes: string | null
        }
        Insert: {
          applied_amount?: number | null
          applied_to_order_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_brand_membership_id: string
          client_notes?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expiration_date?: string | null
          id?: string
          metadata?: Json | null
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          original_reward_value: number
          points_transaction_id: string
          public_id?: string
          redeemed_by?: string | null
          redemption_code?: string
          redemption_date: string
          redemption_status?:
            | Database["public"]["Enums"]["redemption_status_enum"]
            | null
          refund_transaction_id?: string | null
          reward_id: string
          tenant_id: string
          updated_at?: string | null
          usage_instructions?: string | null
          used_date?: string | null
          validated_by?: string | null
          validation_notes?: string | null
        }
        Update: {
          applied_amount?: number | null
          applied_to_order_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_brand_membership_id?: string
          client_notes?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expiration_date?: string | null
          id?: string
          metadata?: Json | null
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          original_reward_value?: number
          points_transaction_id?: string
          public_id?: string
          redeemed_by?: string | null
          redemption_code?: string
          redemption_date?: string
          redemption_status?:
            | Database["public"]["Enums"]["redemption_status_enum"]
            | null
          refund_transaction_id?: string | null
          reward_id?: string
          tenant_id?: string
          updated_at?: string | null
          usage_instructions?: string | null
          used_date?: string | null
          validated_by?: string | null
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "active_client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_points_transaction_id_fkey"
            columns: ["points_transaction_id"]
            isOneToOne: false
            referencedRelation: "active_points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_points_transaction_id_fkey"
            columns: ["points_transaction_id"]
            isOneToOne: false
            referencedRelation: "points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_refund_transaction_id_fkey"
            columns: ["refund_transaction_id"]
            isOneToOne: false
            referencedRelation: "active_points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_refund_transaction_id_fkey"
            columns: ["refund_transaction_id"]
            isOneToOne: false
            referencedRelation: "points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "active_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "reward_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "reward_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "reward_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          applicable_categories: Json | null
          applicable_products: Json | null
          auto_apply: boolean | null
          brand_id: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          max_discount_amount: number | null
          min_purchase_amount: number | null
          monetary_value: number | null
          name: string
          notification_message: string | null
          points_cost: number
          product_id: string | null
          product_variant_id: string | null
          promotion_id: string | null
          public_id: string
          redemption_instructions: string | null
          reward_image_url: string | null
          reward_type: Database["public"]["Enums"]["reward_type_enum"]
          sort_order: number | null
          tenant_id: string
          terms_and_conditions: string | null
          tier_requirements: Json | null
          updated_at: string | null
          usage_count_total: number | null
          usage_limit_per_client: number | null
          usage_limit_total: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applicable_categories?: Json | null
          applicable_products?: Json | null
          auto_apply?: boolean | null
          brand_id: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          monetary_value?: number | null
          name: string
          notification_message?: string | null
          points_cost: number
          product_id?: string | null
          product_variant_id?: string | null
          promotion_id?: string | null
          public_id?: string
          redemption_instructions?: string | null
          reward_image_url?: string | null
          reward_type: Database["public"]["Enums"]["reward_type_enum"]
          sort_order?: number | null
          tenant_id: string
          terms_and_conditions?: string | null
          tier_requirements?: Json | null
          updated_at?: string | null
          usage_count_total?: number | null
          usage_limit_per_client?: number | null
          usage_limit_total?: number | null
          valid_from: string
          valid_until?: string | null
        }
        Update: {
          applicable_categories?: Json | null
          applicable_products?: Json | null
          auto_apply?: boolean | null
          brand_id?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          monetary_value?: number | null
          name?: string
          notification_message?: string | null
          points_cost?: number
          product_id?: string | null
          product_variant_id?: string | null
          promotion_id?: string | null
          public_id?: string
          redemption_instructions?: string | null
          reward_image_url?: string | null
          reward_type?: Database["public"]["Enums"]["reward_type_enum"]
          sort_order?: number | null
          tenant_id?: string
          terms_and_conditions?: string | null
          tier_requirements?: Json | null
          updated_at?: string | null
          usage_count_total?: number | null
          usage_limit_per_client?: number | null
          usage_limit_total?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "active_promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "rewards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "rewards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "rewards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_answers: {
        Row: {
          answer_boolean: boolean | null
          answer_choice: string | null
          answer_choices: string[] | null
          answer_json: Json | null
          answer_number: number | null
          answer_scale: number | null
          answer_text: string | null
          created_at: string
          id: string
          question_id: string
          response_id: string
          tenant_id: string
        }
        Insert: {
          answer_boolean?: boolean | null
          answer_choice?: string | null
          answer_choices?: string[] | null
          answer_json?: Json | null
          answer_number?: number | null
          answer_scale?: number | null
          answer_text?: string | null
          created_at?: string
          id?: string
          question_id: string
          response_id: string
          tenant_id: string
        }
        Update: {
          answer_boolean?: boolean | null
          answer_choice?: string | null
          answer_choices?: string[] | null
          answer_json?: Json | null
          answer_number?: number | null
          answer_scale?: number | null
          answer_text?: string | null
          created_at?: string
          id?: string
          question_id?: string
          response_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "survey_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_answers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_answers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "survey_answers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "survey_answers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "survey_answers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_sections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          sort_order: number
          survey_id: string
          tenant_id: string
          title: string
          updated_at: string
          visibility_condition: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          survey_id: string
          tenant_id: string
          title: string
          updated_at?: string
          visibility_condition?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          survey_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          visibility_condition?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_sections_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "survey_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "survey_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          created_at: string
          id: string
          input_attributes: Json | null
          is_required: boolean
          options: Json | null
          public_id: string
          question_text: string
          question_type: Database["public"]["Enums"]["survey_question_type_enum"]
          section_id: string | null
          sort_order: number
          survey_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_attributes?: Json | null
          is_required?: boolean
          options?: Json | null
          public_id?: string
          question_text: string
          question_type: Database["public"]["Enums"]["survey_question_type_enum"]
          section_id?: string | null
          sort_order?: number
          survey_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          input_attributes?: Json | null
          is_required?: boolean
          options?: Json | null
          public_id?: string
          question_text?: string
          question_type?: Database["public"]["Enums"]["survey_question_type_enum"]
          section_id?: string | null
          sort_order?: number
          survey_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "survey_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "survey_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "survey_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "survey_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          created_at: string
          id: string
          public_id: string
          respondent_id: string
          respondent_role: Database["public"]["Enums"]["survey_target_role_enum"]
          submitted_at: string
          survey_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          public_id?: string
          respondent_id: string
          respondent_role: Database["public"]["Enums"]["survey_target_role_enum"]
          submitted_at?: string
          survey_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          public_id?: string
          respondent_id?: string
          respondent_role?: Database["public"]["Enums"]["survey_target_role_enum"]
          submitted_at?: string
          survey_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_respondent_id_fkey"
            columns: ["respondent_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_respondent_id_fkey"
            columns: ["respondent_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "survey_responses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "survey_responses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "survey_responses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          brand_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          end_date: string
          id: string
          max_responses_per_user: number
          public_id: string
          rejection_reason: string | null
          start_date: string
          survey_status: Database["public"]["Enums"]["survey_status_enum"]
          target_client_type_categories:
            | Database["public"]["Enums"]["client_type_category_enum"][]
            | null
          target_roles: Database["public"]["Enums"]["survey_target_role_enum"][]
          target_zone_ids: string[] | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          brand_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          max_responses_per_user?: number
          public_id?: string
          rejection_reason?: string | null
          start_date: string
          survey_status?: Database["public"]["Enums"]["survey_status_enum"]
          target_client_type_categories?:
            | Database["public"]["Enums"]["client_type_category_enum"][]
            | null
          target_roles?: Database["public"]["Enums"]["survey_target_role_enum"][]
          target_zone_ids?: string[] | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          brand_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          max_responses_per_user?: number
          public_id?: string
          rejection_reason?: string | null
          start_date?: string
          survey_status?: Database["public"]["Enums"]["survey_status_enum"]
          target_client_type_categories?:
            | Database["public"]["Enums"]["client_type_category_enum"][]
            | null
          target_roles?: Database["public"]["Enums"]["survey_target_role_enum"][]
          target_zone_ids?: string[] | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "surveys_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "surveys_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "surveys_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "surveys_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "surveys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "surveys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "surveys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          public_id: string
          settings: Json | null
          slug: string
          status: Database["public"]["Enums"]["tenant_status_enum"] | null
          subscription_plan:
            | Database["public"]["Enums"]["tenant_subscription_plan_enum"]
            | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          public_id?: string
          settings?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["tenant_status_enum"] | null
          subscription_plan?:
            | Database["public"]["Enums"]["tenant_subscription_plan_enum"]
            | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          public_id?: string
          settings?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status_enum"] | null
          subscription_plan?:
            | Database["public"]["Enums"]["tenant_subscription_plan_enum"]
            | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tiers: {
        Row: {
          auto_assignment_enabled: boolean | null
          auto_assignment_rules: Json | null
          badge_image_url: string | null
          benefits: Json | null
          brand_id: string
          code: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          discount_percentage: number | null
          downgrade_enabled: boolean | null
          evaluation_period_months: number | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          min_points_required: number
          min_purchase_amount: number | null
          min_purchases_required: number | null
          min_visits_required: number | null
          name: string
          points_multiplier: number | null
          public_id: string
          requirements: Json | null
          retention_period_months: number | null
          sort_order: number | null
          tenant_id: string
          tier_color: string | null
          tier_icon_url: string | null
          tier_level: number
          updated_at: string | null
          upgrade_notification: boolean | null
        }
        Insert: {
          auto_assignment_enabled?: boolean | null
          auto_assignment_rules?: Json | null
          badge_image_url?: string | null
          benefits?: Json | null
          brand_id: string
          code: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          downgrade_enabled?: boolean | null
          evaluation_period_months?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          min_points_required: number
          min_purchase_amount?: number | null
          min_purchases_required?: number | null
          min_visits_required?: number | null
          name: string
          points_multiplier?: number | null
          public_id?: string
          requirements?: Json | null
          retention_period_months?: number | null
          sort_order?: number | null
          tenant_id: string
          tier_color?: string | null
          tier_icon_url?: string | null
          tier_level: number
          updated_at?: string | null
          upgrade_notification?: boolean | null
        }
        Update: {
          auto_assignment_enabled?: boolean | null
          auto_assignment_rules?: Json | null
          badge_image_url?: string | null
          benefits?: Json | null
          brand_id?: string
          code?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          downgrade_enabled?: boolean | null
          evaluation_period_months?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          min_points_required?: number
          min_purchase_amount?: number | null
          min_purchases_required?: number | null
          min_visits_required?: number | null
          name?: string
          points_multiplier?: number | null
          public_id?: string
          requirements?: Json | null
          retention_period_months?: number | null
          sort_order?: number | null
          tenant_id?: string
          tier_color?: string | null
          tier_icon_url?: string | null
          tier_level?: number
          updated_at?: string | null
          upgrade_notification?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "tiers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tiers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tiers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tiers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          department: string | null
          distributor_id: string | null
          email: string
          employee_code: string | null
          first_name: string
          hire_date: string | null
          id: string
          last_login_at: string | null
          last_name: string
          manager_id: string | null
          phone: string | null
          position: string | null
          preferences: Json | null
          public_id: string
          status: Database["public"]["Enums"]["user_profile_status_enum"] | null
          tenant_id: string
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          department?: string | null
          distributor_id?: string | null
          email: string
          employee_code?: string | null
          first_name: string
          hire_date?: string | null
          id?: string
          last_login_at?: string | null
          last_name: string
          manager_id?: string | null
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          public_id?: string
          status?:
            | Database["public"]["Enums"]["user_profile_status_enum"]
            | null
          tenant_id?: string
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          department?: string | null
          distributor_id?: string | null
          email?: string
          employee_code?: string | null
          first_name?: string
          hire_date?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string
          manager_id?: string | null
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          public_id?: string
          status?:
            | Database["public"]["Enums"]["user_profile_status_enum"]
            | null
          tenant_id?: string
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "active_distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          brand_id: string | null
          created_at: string | null
          deleted_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_primary: boolean | null
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role_type_enum"]
          scope: Database["public"]["Enums"]["user_role_scope_enum"]
          status: Database["public"]["Enums"]["user_role_status_enum"] | null
          tenant_id: string
          updated_at: string | null
          user_profile_id: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_primary?: boolean | null
          permissions?: Json | null
          role: Database["public"]["Enums"]["user_role_type_enum"]
          scope: Database["public"]["Enums"]["user_role_scope_enum"]
          status?: Database["public"]["Enums"]["user_role_status_enum"] | null
          tenant_id: string
          updated_at?: string | null
          user_profile_id: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_primary?: boolean | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role_type_enum"]
          scope?: Database["public"]["Enums"]["user_role_scope_enum"]
          status?: Database["public"]["Enums"]["user_role_status_enum"] | null
          tenant_id?: string
          updated_at?: string | null
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_assessments: {
        Row: {
          assessment_notes: string | null
          assessment_score: number | null
          assessment_type: Database["public"]["Enums"]["assessment_type_enum"]
          competitor_present: boolean | null
          competitor_prices: Json | null
          competitor_products: Json | null
          created_at: string | null
          current_price: number | null
          deleted_at: string | null
          display_quality:
            | Database["public"]["Enums"]["display_quality_enum"]
            | null
          expiration_date: string | null
          facing_count: number | null
          id: string
          is_present: boolean
          package_condition:
            | Database["public"]["Enums"]["package_condition_enum"]
            | null
          photo_evidence_urls: Json | null
          price_variance_percent: number | null
          product_id: string
          product_variant_id: string | null
          promotional_materials: Json | null
          public_id: string
          recommended_actions: Json | null
          requires_action: boolean | null
          shelf_position:
            | Database["public"]["Enums"]["shelf_position_enum"]
            | null
          shelf_space_cm: number | null
          stock_level: Database["public"]["Enums"]["stock_level_enum"] | null
          stock_quantity: number | null
          suggested_price: number | null
          tenant_id: string
          updated_at: string | null
          visit_id: string
        }
        Insert: {
          assessment_notes?: string | null
          assessment_score?: number | null
          assessment_type: Database["public"]["Enums"]["assessment_type_enum"]
          competitor_present?: boolean | null
          competitor_prices?: Json | null
          competitor_products?: Json | null
          created_at?: string | null
          current_price?: number | null
          deleted_at?: string | null
          display_quality?:
            | Database["public"]["Enums"]["display_quality_enum"]
            | null
          expiration_date?: string | null
          facing_count?: number | null
          id?: string
          is_present: boolean
          package_condition?:
            | Database["public"]["Enums"]["package_condition_enum"]
            | null
          photo_evidence_urls?: Json | null
          price_variance_percent?: number | null
          product_id: string
          product_variant_id?: string | null
          promotional_materials?: Json | null
          public_id?: string
          recommended_actions?: Json | null
          requires_action?: boolean | null
          shelf_position?:
            | Database["public"]["Enums"]["shelf_position_enum"]
            | null
          shelf_space_cm?: number | null
          stock_level?: Database["public"]["Enums"]["stock_level_enum"] | null
          stock_quantity?: number | null
          suggested_price?: number | null
          tenant_id: string
          updated_at?: string | null
          visit_id: string
        }
        Update: {
          assessment_notes?: string | null
          assessment_score?: number | null
          assessment_type?: Database["public"]["Enums"]["assessment_type_enum"]
          competitor_present?: boolean | null
          competitor_prices?: Json | null
          competitor_products?: Json | null
          created_at?: string | null
          current_price?: number | null
          deleted_at?: string | null
          display_quality?:
            | Database["public"]["Enums"]["display_quality_enum"]
            | null
          expiration_date?: string | null
          facing_count?: number | null
          id?: string
          is_present?: boolean
          package_condition?:
            | Database["public"]["Enums"]["package_condition_enum"]
            | null
          photo_evidence_urls?: Json | null
          price_variance_percent?: number | null
          product_id?: string
          product_variant_id?: string | null
          promotional_materials?: Json | null
          public_id?: string
          recommended_actions?: Json | null
          requires_action?: boolean | null
          shelf_position?:
            | Database["public"]["Enums"]["shelf_position_enum"]
            | null
          shelf_space_cm?: number | null
          stock_level?: Database["public"]["Enums"]["stock_level_enum"] | null
          stock_quantity?: number | null
          suggested_price?: number | null
          tenant_id?: string
          updated_at?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_assessments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "visit_assessments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_brand_product_assessments: {
        Row: {
          created_at: string | null
          current_price: number | null
          facing_count: number
          has_active_promotion: boolean | null
          has_pop_material: boolean | null
          id: string
          is_product_present: boolean | null
          product_id: string
          product_variant_id: string | null
          promotion_description: string | null
          shelf_position: string | null
          stock_level:
            | Database["public"]["Enums"]["stock_level_observed_enum"]
            | null
          suggested_price: number | null
          tenant_id: string
          updated_at: string | null
          visit_id: string
        }
        Insert: {
          created_at?: string | null
          current_price?: number | null
          facing_count?: number
          has_active_promotion?: boolean | null
          has_pop_material?: boolean | null
          id?: string
          is_product_present?: boolean | null
          product_id: string
          product_variant_id?: string | null
          promotion_description?: string | null
          shelf_position?: string | null
          stock_level?:
            | Database["public"]["Enums"]["stock_level_observed_enum"]
            | null
          suggested_price?: number | null
          tenant_id: string
          updated_at?: string | null
          visit_id: string
        }
        Update: {
          created_at?: string | null
          current_price?: number | null
          facing_count?: number
          has_active_promotion?: boolean | null
          has_pop_material?: boolean | null
          id?: string
          is_product_present?: boolean | null
          product_id?: string
          product_variant_id?: string | null
          promotion_description?: string | null
          shelf_position?: string | null
          stock_level?:
            | Database["public"]["Enums"]["stock_level_observed_enum"]
            | null
          suggested_price?: number | null
          tenant_id?: string
          updated_at?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_brand_product_assessments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_brand_product_assessments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "visit_brand_product_assessments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_brand_product_assessments_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_brand_product_assessments_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_brand_product_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_brand_product_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_brand_product_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_brand_product_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_brand_product_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_brand_product_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_brand_product_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_brand_product_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_communication_plans: {
        Row: {
          brand_id: string
          campaign_duration: Json | null
          campaign_id: string | null
          client_approval:
            | Database["public"]["Enums"]["client_approval_enum"]
            | null
          client_approval_notes: string | null
          created_at: string | null
          current_status: Database["public"]["Enums"]["communication_current_status_enum"]
          deleted_at: string | null
          effectiveness_rating: number | null
          follow_up_date: string | null
          follow_up_reason: string | null
          follow_up_required: boolean | null
          id: string
          implementation_notes: string | null
          installation_cost: number | null
          installation_date_actual: string | null
          installation_date_planned: string | null
          installation_location: string | null
          installed_by: string | null
          key_message: string | null
          material_condition_notes: string | null
          material_cost: number | null
          material_description: string | null
          material_name: string
          material_size: string | null
          material_type: Database["public"]["Enums"]["communication_material_type_enum"]
          photo_after_urls: Json | null
          photo_before_urls: Json | null
          planned_action: Database["public"]["Enums"]["communication_planned_action_enum"]
          public_id: string
          quantity_current: number | null
          quantity_planned: number | null
          target_audience: string | null
          tenant_id: string
          updated_at: string | null
          visit_id: string
        }
        Insert: {
          brand_id: string
          campaign_duration?: Json | null
          campaign_id?: string | null
          client_approval?:
            | Database["public"]["Enums"]["client_approval_enum"]
            | null
          client_approval_notes?: string | null
          created_at?: string | null
          current_status: Database["public"]["Enums"]["communication_current_status_enum"]
          deleted_at?: string | null
          effectiveness_rating?: number | null
          follow_up_date?: string | null
          follow_up_reason?: string | null
          follow_up_required?: boolean | null
          id?: string
          implementation_notes?: string | null
          installation_cost?: number | null
          installation_date_actual?: string | null
          installation_date_planned?: string | null
          installation_location?: string | null
          installed_by?: string | null
          key_message?: string | null
          material_condition_notes?: string | null
          material_cost?: number | null
          material_description?: string | null
          material_name: string
          material_size?: string | null
          material_type: Database["public"]["Enums"]["communication_material_type_enum"]
          photo_after_urls?: Json | null
          photo_before_urls?: Json | null
          planned_action: Database["public"]["Enums"]["communication_planned_action_enum"]
          public_id?: string
          quantity_current?: number | null
          quantity_planned?: number | null
          target_audience?: string | null
          tenant_id: string
          updated_at?: string | null
          visit_id: string
        }
        Update: {
          brand_id?: string
          campaign_duration?: Json | null
          campaign_id?: string | null
          client_approval?:
            | Database["public"]["Enums"]["client_approval_enum"]
            | null
          client_approval_notes?: string | null
          created_at?: string | null
          current_status?: Database["public"]["Enums"]["communication_current_status_enum"]
          deleted_at?: string | null
          effectiveness_rating?: number | null
          follow_up_date?: string | null
          follow_up_reason?: string | null
          follow_up_required?: boolean | null
          id?: string
          implementation_notes?: string | null
          installation_cost?: number | null
          installation_date_actual?: string | null
          installation_date_planned?: string | null
          installation_location?: string | null
          installed_by?: string | null
          key_message?: string | null
          material_condition_notes?: string | null
          material_cost?: number | null
          material_description?: string | null
          material_name?: string
          material_size?: string | null
          material_type?: Database["public"]["Enums"]["communication_material_type_enum"]
          photo_after_urls?: Json | null
          photo_before_urls?: Json | null
          planned_action?: Database["public"]["Enums"]["communication_planned_action_enum"]
          public_id?: string
          quantity_current?: number | null
          quantity_planned?: number | null
          target_audience?: string | null
          tenant_id?: string
          updated_at?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_installed_by_fkey"
            columns: ["installed_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_installed_by_fkey"
            columns: ["installed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_competitor_assessments: {
        Row: {
          competitor_id: string
          competitor_product_id: string | null
          created_at: string | null
          facing_count: number
          has_active_promotion: boolean | null
          has_pop_material: boolean | null
          id: string
          observed_price: number | null
          product_name_observed: string | null
          promotion_description: string | null
          size_grams: number | null
          tenant_id: string
          visit_id: string
        }
        Insert: {
          competitor_id: string
          competitor_product_id?: string | null
          created_at?: string | null
          facing_count?: number
          has_active_promotion?: boolean | null
          has_pop_material?: boolean | null
          id?: string
          observed_price?: number | null
          product_name_observed?: string | null
          promotion_description?: string | null
          size_grams?: number | null
          tenant_id: string
          visit_id: string
        }
        Update: {
          competitor_id?: string
          competitor_product_id?: string | null
          created_at?: string | null
          facing_count?: number
          has_active_promotion?: boolean | null
          has_pop_material?: boolean | null
          id?: string
          observed_price?: number | null
          product_name_observed?: string | null
          promotion_description?: string | null
          size_grams?: number | null
          tenant_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_competitor_assessments_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "brand_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_competitor_assessments_competitor_product_id_fkey"
            columns: ["competitor_product_id"]
            isOneToOne: false
            referencedRelation: "brand_competitor_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_competitor_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_competitor_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_competitor_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_competitor_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_competitor_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_competitor_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_competitor_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_competitor_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_evidence: {
        Row: {
          caption: string | null
          capture_latitude: number | null
          capture_longitude: number | null
          captured_at: string | null
          created_at: string | null
          deleted_at: string | null
          evidence_stage: Database["public"]["Enums"]["evidence_stage_enum"]
          evidence_type:
            | Database["public"]["Enums"]["evidence_type_enum"]
            | null
          file_name: string | null
          file_size_bytes: number | null
          file_url: string
          id: string
          mime_type: string | null
          public_id: string | null
          tenant_id: string
          visit_id: string
        }
        Insert: {
          caption?: string | null
          capture_latitude?: number | null
          capture_longitude?: number | null
          captured_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          evidence_stage: Database["public"]["Enums"]["evidence_stage_enum"]
          evidence_type?:
            | Database["public"]["Enums"]["evidence_type_enum"]
            | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          public_id?: string | null
          tenant_id: string
          visit_id: string
        }
        Update: {
          caption?: string | null
          capture_latitude?: number | null
          capture_longitude?: number | null
          captured_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          evidence_stage?: Database["public"]["Enums"]["evidence_stage_enum"]
          evidence_type?:
            | Database["public"]["Enums"]["evidence_type_enum"]
            | null
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          public_id?: string | null
          tenant_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_evidence_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_evidence_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_evidence_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_evidence_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_evidence_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_evidence_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_evidence_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_evidence_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_exhibition_checks: {
        Row: {
          created_at: string | null
          execution_quality:
            | Database["public"]["Enums"]["execution_quality_enum"]
            | null
          exhibition_id: string
          id: string
          is_executed: boolean | null
          notes: string | null
          tenant_id: string
          visit_id: string
        }
        Insert: {
          created_at?: string | null
          execution_quality?:
            | Database["public"]["Enums"]["execution_quality_enum"]
            | null
          exhibition_id: string
          id?: string
          is_executed?: boolean | null
          notes?: string | null
          tenant_id: string
          visit_id: string
        }
        Update: {
          created_at?: string | null
          execution_quality?:
            | Database["public"]["Enums"]["execution_quality_enum"]
            | null
          exhibition_id?: string
          id?: string
          is_executed?: boolean | null
          notes?: string | null
          tenant_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_exhibition_checks_exhibition_id_fkey"
            columns: ["exhibition_id"]
            isOneToOne: false
            referencedRelation: "brand_exhibitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_exhibition_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_exhibition_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_exhibition_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_exhibition_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_exhibition_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_exhibition_checks_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_exhibition_checks_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_exhibition_checks_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_inventories: {
        Row: {
          batch_numbers: Json | null
          condition_notes: string | null
          count_accuracy:
            | Database["public"]["Enums"]["count_accuracy_enum"]
            | null
          counted_by: string
          created_at: string | null
          current_stock: number
          deleted_at: string | null
          expiration_dates: Json | null
          id: string
          last_delivery_date: string | null
          location_in_store:
            | Database["public"]["Enums"]["location_in_store_enum"]
            | null
          next_delivery_expected: string | null
          notes: string | null
          photo_evidence_urls: Json | null
          product_id: string
          product_variant_id: string | null
          public_id: string
          restock_needed: boolean | null
          restock_priority:
            | Database["public"]["Enums"]["restock_priority_enum"]
            | null
          restock_quantity: number | null
          rotation_quality:
            | Database["public"]["Enums"]["rotation_quality_enum"]
            | null
          storage_conditions: Json | null
          tenant_id: string
          unit_type: Database["public"]["Enums"]["product_unit_type_enum"]
          updated_at: string | null
          verified_by: string | null
          visit_id: string
        }
        Insert: {
          batch_numbers?: Json | null
          condition_notes?: string | null
          count_accuracy?:
            | Database["public"]["Enums"]["count_accuracy_enum"]
            | null
          counted_by: string
          created_at?: string | null
          current_stock: number
          deleted_at?: string | null
          expiration_dates?: Json | null
          id?: string
          last_delivery_date?: string | null
          location_in_store?:
            | Database["public"]["Enums"]["location_in_store_enum"]
            | null
          next_delivery_expected?: string | null
          notes?: string | null
          photo_evidence_urls?: Json | null
          product_id: string
          product_variant_id?: string | null
          public_id?: string
          restock_needed?: boolean | null
          restock_priority?:
            | Database["public"]["Enums"]["restock_priority_enum"]
            | null
          restock_quantity?: number | null
          rotation_quality?:
            | Database["public"]["Enums"]["rotation_quality_enum"]
            | null
          storage_conditions?: Json | null
          tenant_id: string
          unit_type: Database["public"]["Enums"]["product_unit_type_enum"]
          updated_at?: string | null
          verified_by?: string | null
          visit_id: string
        }
        Update: {
          batch_numbers?: Json | null
          condition_notes?: string | null
          count_accuracy?:
            | Database["public"]["Enums"]["count_accuracy_enum"]
            | null
          counted_by?: string
          created_at?: string | null
          current_stock?: number
          deleted_at?: string | null
          expiration_dates?: Json | null
          id?: string
          last_delivery_date?: string | null
          location_in_store?:
            | Database["public"]["Enums"]["location_in_store_enum"]
            | null
          next_delivery_expected?: string | null
          notes?: string | null
          photo_evidence_urls?: Json | null
          product_id?: string
          product_variant_id?: string | null
          public_id?: string
          restock_needed?: boolean | null
          restock_priority?:
            | Database["public"]["Enums"]["restock_priority_enum"]
            | null
          restock_quantity?: number | null
          rotation_quality?:
            | Database["public"]["Enums"]["rotation_quality_enum"]
            | null
          storage_conditions?: Json | null
          tenant_id?: string
          unit_type?: Database["public"]["Enums"]["product_unit_type_enum"]
          updated_at?: string | null
          verified_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_inventories_counted_by_fkey"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_counted_by_fkey"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "visit_inventories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_inventories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_inventories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_inventories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_inventories_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_order_items: {
        Row: {
          approval_notes: string | null
          approved_by: string | null
          client_notes: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string
          cross_sell_item: boolean | null
          deleted_at: string | null
          delivery_date_requested: string | null
          delivery_preference:
            | Database["public"]["Enums"]["visit_order_item_delivery_preference_enum"]
            | null
          free_item_reason: string | null
          id: string
          item_priority:
            | Database["public"]["Enums"]["visit_order_item_priority_enum"]
            | null
          item_source:
            | Database["public"]["Enums"]["visit_order_item_source_enum"]
            | null
          item_urgency_notes: string | null
          line_discount_amount: number | null
          line_discount_percentage: number | null
          line_number: number
          line_subtotal: number
          line_total: number
          metadata: Json | null
          negotiation_reason: string | null
          original_price: number | null
          price_negotiated: boolean | null
          product_id: string
          product_variant_id: string | null
          promotion_manually_applied: boolean | null
          promotion_suggested_by_system: boolean | null
          promotor_notes: string | null
          public_id: string
          quality_requirements: string | null
          quantity_available: number | null
          quantity_confirmed: number | null
          quantity_ordered: number
          requires_approval: boolean | null
          sample_item: boolean | null
          suggested_price: number | null
          tax_amount: number | null
          tax_rate: number | null
          tenant_id: string
          unit_cost: number | null
          unit_price: number
          unit_type: Database["public"]["Enums"]["visit_order_item_unit_type_enum"]
          updated_at: string | null
          upsell_item: boolean | null
          visit_order_id: string
        }
        Insert: {
          approval_notes?: string | null
          approved_by?: string | null
          client_notes?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          cross_sell_item?: boolean | null
          deleted_at?: string | null
          delivery_date_requested?: string | null
          delivery_preference?:
            | Database["public"]["Enums"]["visit_order_item_delivery_preference_enum"]
            | null
          free_item_reason?: string | null
          id?: string
          item_priority?:
            | Database["public"]["Enums"]["visit_order_item_priority_enum"]
            | null
          item_source?:
            | Database["public"]["Enums"]["visit_order_item_source_enum"]
            | null
          item_urgency_notes?: string | null
          line_discount_amount?: number | null
          line_discount_percentage?: number | null
          line_number: number
          line_subtotal: number
          line_total: number
          metadata?: Json | null
          negotiation_reason?: string | null
          original_price?: number | null
          price_negotiated?: boolean | null
          product_id: string
          product_variant_id?: string | null
          promotion_manually_applied?: boolean | null
          promotion_suggested_by_system?: boolean | null
          promotor_notes?: string | null
          public_id?: string
          quality_requirements?: string | null
          quantity_available?: number | null
          quantity_confirmed?: number | null
          quantity_ordered: number
          requires_approval?: boolean | null
          sample_item?: boolean | null
          suggested_price?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          tenant_id: string
          unit_cost?: number | null
          unit_price: number
          unit_type: Database["public"]["Enums"]["visit_order_item_unit_type_enum"]
          updated_at?: string | null
          upsell_item?: boolean | null
          visit_order_id: string
        }
        Update: {
          approval_notes?: string | null
          approved_by?: string | null
          client_notes?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          cross_sell_item?: boolean | null
          deleted_at?: string | null
          delivery_date_requested?: string | null
          delivery_preference?:
            | Database["public"]["Enums"]["visit_order_item_delivery_preference_enum"]
            | null
          free_item_reason?: string | null
          id?: string
          item_priority?:
            | Database["public"]["Enums"]["visit_order_item_priority_enum"]
            | null
          item_source?:
            | Database["public"]["Enums"]["visit_order_item_source_enum"]
            | null
          item_urgency_notes?: string | null
          line_discount_amount?: number | null
          line_discount_percentage?: number | null
          line_number?: number
          line_subtotal?: number
          line_total?: number
          metadata?: Json | null
          negotiation_reason?: string | null
          original_price?: number | null
          price_negotiated?: boolean | null
          product_id?: string
          product_variant_id?: string | null
          promotion_manually_applied?: boolean | null
          promotion_suggested_by_system?: boolean | null
          promotor_notes?: string | null
          public_id?: string
          quality_requirements?: string | null
          quantity_available?: number | null
          quantity_confirmed?: number | null
          quantity_ordered?: number
          requires_approval?: boolean | null
          sample_item?: boolean | null
          suggested_price?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          tenant_id?: string
          unit_cost?: number | null
          unit_price?: number
          unit_type?: Database["public"]["Enums"]["visit_order_item_unit_type_enum"]
          updated_at?: string | null
          upsell_item?: boolean | null
          visit_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_visit_order_items_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_product_variant"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_product_variant"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_visit_order"
            columns: ["visit_order_id"]
            isOneToOne: false
            referencedRelation: "active_visit_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_visit_order"
            columns: ["visit_order_id"]
            isOneToOne: false
            referencedRelation: "visit_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          client_id: string
          client_invoice_data_id: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string | null
          currency: string | null
          deleted_at: string | null
          delivery_address: string | null
          delivery_date: string | null
          delivery_instructions: string | null
          discount_amount: number | null
          distributor_id: string | null
          exchange_rate: number | null
          external_order_id: string | null
          id: string
          invoice_required: boolean | null
          order_attachments: Json | null
          order_date: string
          order_notes: string | null
          order_number: string | null
          order_status:
            | Database["public"]["Enums"]["visit_order_status_enum"]
            | null
          order_type:
            | Database["public"]["Enums"]["visit_order_type_enum"]
            | null
          payment_method:
            | Database["public"]["Enums"]["visit_order_payment_method_enum"]
            | null
          payment_terms: string | null
          promotor_id: string
          public_id: string
          requires_approval: boolean | null
          subtotal: number
          tax_amount: number | null
          tenant_id: string
          total_amount: number
          updated_at: string | null
          visit_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          client_id: string
          client_invoice_data_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_instructions?: string | null
          discount_amount?: number | null
          distributor_id?: string | null
          exchange_rate?: number | null
          external_order_id?: string | null
          id?: string
          invoice_required?: boolean | null
          order_attachments?: Json | null
          order_date: string
          order_notes?: string | null
          order_number?: string | null
          order_status?:
            | Database["public"]["Enums"]["visit_order_status_enum"]
            | null
          order_type?:
            | Database["public"]["Enums"]["visit_order_type_enum"]
            | null
          payment_method?:
            | Database["public"]["Enums"]["visit_order_payment_method_enum"]
            | null
          payment_terms?: string | null
          promotor_id: string
          public_id?: string
          requires_approval?: boolean | null
          subtotal?: number
          tax_amount?: number | null
          tenant_id: string
          total_amount?: number
          updated_at?: string | null
          visit_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string
          client_invoice_data_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_instructions?: string | null
          discount_amount?: number | null
          distributor_id?: string | null
          exchange_rate?: number | null
          external_order_id?: string | null
          id?: string
          invoice_required?: boolean | null
          order_attachments?: Json | null
          order_date?: string
          order_notes?: string | null
          order_number?: string | null
          order_status?:
            | Database["public"]["Enums"]["visit_order_status_enum"]
            | null
          order_type?:
            | Database["public"]["Enums"]["visit_order_type_enum"]
            | null
          payment_method?:
            | Database["public"]["Enums"]["visit_order_payment_method_enum"]
            | null
          payment_terms?: string | null
          promotor_id?: string
          public_id?: string
          requires_approval?: boolean | null
          subtotal?: number
          tax_amount?: number | null
          tenant_id?: string
          total_amount?: number
          updated_at?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_orders_advisor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_advisor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_client_invoice_data_id_fkey"
            columns: ["client_invoice_data_id"]
            isOneToOne: false
            referencedRelation: "active_client_invoice_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_client_invoice_data_id_fkey"
            columns: ["client_invoice_data_id"]
            isOneToOne: false
            referencedRelation: "client_invoice_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "active_distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_pop_material_checks: {
        Row: {
          condition:
            | Database["public"]["Enums"]["material_condition_enum"]
            | null
          created_at: string | null
          id: string
          is_present: boolean | null
          notes: string | null
          pop_material_id: string
          tenant_id: string
          visit_id: string
        }
        Insert: {
          condition?:
            | Database["public"]["Enums"]["material_condition_enum"]
            | null
          created_at?: string | null
          id?: string
          is_present?: boolean | null
          notes?: string | null
          pop_material_id: string
          tenant_id: string
          visit_id: string
        }
        Update: {
          condition?:
            | Database["public"]["Enums"]["material_condition_enum"]
            | null
          created_at?: string | null
          id?: string
          is_present?: boolean | null
          notes?: string | null
          pop_material_id?: string
          tenant_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_pop_material_checks_pop_material_id_fkey"
            columns: ["pop_material_id"]
            isOneToOne: false
            referencedRelation: "brand_pop_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_pop_material_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_pop_material_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_pop_material_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_pop_material_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_pop_material_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_pop_material_checks_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_pop_material_checks_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_pop_material_checks_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_stage_assessments: {
        Row: {
          all_stages_completed: boolean | null
          communication_compliance:
            | Database["public"]["Enums"]["compliance_level"]
            | null
          communication_plan_id: string | null
          competitor_analysis_notes: string | null
          completed_at: string | null
          created_at: string | null
          deleted_at: string | null
          has_inventory: boolean | null
          has_purchase_order: boolean | null
          id: string
          order_id: string | null
          pop_execution_notes: string | null
          pricing_audit_notes: string | null
          public_id: string | null
          purchase_inventory_notes: string | null
          purchase_order_number: string | null
          stage1_completed_at: string | null
          stage2_completed_at: string | null
          stage3_completed_at: string | null
          tenant_id: string
          updated_at: string | null
          visit_id: string
          why_not_buying:
            | Database["public"]["Enums"]["why_not_buying_reason"]
            | null
        }
        Insert: {
          all_stages_completed?: boolean | null
          communication_compliance?:
            | Database["public"]["Enums"]["compliance_level"]
            | null
          communication_plan_id?: string | null
          competitor_analysis_notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          has_inventory?: boolean | null
          has_purchase_order?: boolean | null
          id?: string
          order_id?: string | null
          pop_execution_notes?: string | null
          pricing_audit_notes?: string | null
          public_id?: string | null
          purchase_inventory_notes?: string | null
          purchase_order_number?: string | null
          stage1_completed_at?: string | null
          stage2_completed_at?: string | null
          stage3_completed_at?: string | null
          tenant_id: string
          updated_at?: string | null
          visit_id: string
          why_not_buying?:
            | Database["public"]["Enums"]["why_not_buying_reason"]
            | null
        }
        Update: {
          all_stages_completed?: boolean | null
          communication_compliance?:
            | Database["public"]["Enums"]["compliance_level"]
            | null
          communication_plan_id?: string | null
          competitor_analysis_notes?: string | null
          completed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          has_inventory?: boolean | null
          has_purchase_order?: boolean | null
          id?: string
          order_id?: string | null
          pop_execution_notes?: string | null
          pricing_audit_notes?: string | null
          public_id?: string | null
          purchase_inventory_notes?: string | null
          purchase_order_number?: string | null
          stage1_completed_at?: string | null
          stage2_completed_at?: string | null
          stage3_completed_at?: string | null
          tenant_id?: string
          updated_at?: string | null
          visit_id?: string
          why_not_buying?:
            | Database["public"]["Enums"]["why_not_buying_reason"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_stage_assessments_communication_plan_id_fkey"
            columns: ["communication_plan_id"]
            isOneToOne: false
            referencedRelation: "brand_communication_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_stage_assessments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "active_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_stage_assessments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_stage_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_stage_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_stage_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_stage_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_stage_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_stage_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_stage_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_stage_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          brand_id: string | null
          check_in_time: string | null
          check_out_time: string | null
          client_id: string
          client_satisfaction_rating: number | null
          created_at: string | null
          deleted_at: string | null
          duration_minutes: number | null
          follow_up_reason: string | null
          id: string
          latitude: number | null
          location_coordinates: unknown
          longitude: number | null
          metadata: Json | null
          next_visit_date: string | null
          promotor_id: string
          promotor_notes: string | null
          public_id: string
          requires_follow_up: boolean | null
          supervisor_notes: string | null
          tenant_id: string
          updated_at: string | null
          visit_attachments: Json | null
          visit_date: string
          visit_notes: string | null
          visit_objective: string | null
          visit_status: Database["public"]["Enums"]["visit_status_enum"] | null
          visit_time_end: string | null
          visit_time_start: string | null
          visit_type: Database["public"]["Enums"]["visit_type_enum"] | null
          weather_conditions: string | null
          workflow_status:
            | Database["public"]["Enums"]["visit_workflow_status_enum"]
            | null
        }
        Insert: {
          brand_id?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          client_id: string
          client_satisfaction_rating?: number | null
          created_at?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          follow_up_reason?: string | null
          id?: string
          latitude?: number | null
          location_coordinates?: unknown
          longitude?: number | null
          metadata?: Json | null
          next_visit_date?: string | null
          promotor_id: string
          promotor_notes?: string | null
          public_id?: string
          requires_follow_up?: boolean | null
          supervisor_notes?: string | null
          tenant_id: string
          updated_at?: string | null
          visit_attachments?: Json | null
          visit_date: string
          visit_notes?: string | null
          visit_objective?: string | null
          visit_status?: Database["public"]["Enums"]["visit_status_enum"] | null
          visit_time_end?: string | null
          visit_time_start?: string | null
          visit_type?: Database["public"]["Enums"]["visit_type_enum"] | null
          weather_conditions?: string | null
          workflow_status?:
            | Database["public"]["Enums"]["visit_workflow_status_enum"]
            | null
        }
        Update: {
          brand_id?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          client_id?: string
          client_satisfaction_rating?: number | null
          created_at?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          follow_up_reason?: string | null
          id?: string
          latitude?: number | null
          location_coordinates?: unknown
          longitude?: number | null
          metadata?: Json | null
          next_visit_date?: string | null
          promotor_id?: string
          promotor_notes?: string | null
          public_id?: string
          requires_follow_up?: boolean | null
          supervisor_notes?: string | null
          tenant_id?: string
          updated_at?: string | null
          visit_attachments?: Json | null
          visit_date?: string
          visit_notes?: string | null
          visit_objective?: string | null
          visit_status?: Database["public"]["Enums"]["visit_status_enum"] | null
          visit_time_end?: string | null
          visit_time_start?: string | null
          visit_type?: Database["public"]["Enums"]["visit_type_enum"] | null
          weather_conditions?: string | null
          workflow_status?:
            | Database["public"]["Enums"]["visit_workflow_status_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_advisor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_advisor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          cities: Json | null
          code: string
          coordinates: Json | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_zone_id: string | null
          postal_codes: Json | null
          public_id: string
          sort_order: number | null
          state: string | null
          tenant_id: string
          updated_at: string | null
          zone_type: Database["public"]["Enums"]["zone_type_enum"]
        }
        Insert: {
          cities?: Json | null
          code: string
          coordinates?: Json | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_zone_id?: string | null
          postal_codes?: Json | null
          public_id?: string
          sort_order?: number | null
          state?: string | null
          tenant_id: string
          updated_at?: string | null
          zone_type: Database["public"]["Enums"]["zone_type_enum"]
        }
        Update: {
          cities?: Json | null
          code?: string
          coordinates?: Json | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_zone_id?: string | null
          postal_codes?: Json | null
          public_id?: string
          sort_order?: number | null
          state?: string | null
          tenant_id?: string
          updated_at?: string | null
          zone_type?: Database["public"]["Enums"]["zone_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "zones_parent_zone_id_fkey"
            columns: ["parent_zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "zones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "zones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "zones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_brands: {
        Row: {
          brand_color_primary: string | null
          brand_color_secondary: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          dashboard_metrics: Json | null
          deleted_at: string | null
          description: string | null
          id: string | null
          logo_url: string | null
          name: string | null
          public_id: string | null
          settings: Json | null
          slug: string | null
          status: Database["public"]["Enums"]["brand_status_enum"] | null
          tenant_id: string | null
          updated_at: string | null
          website: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_campaigns: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          approved_by_first_name: string | null
          approved_by_last_name: string | null
          attachments: Json | null
          attachments_count: number | null
          brand_id: string | null
          brand_name: string | null
          brand_slug: string | null
          budget_remaining: number | null
          budget_spent: number | null
          budget_total: number | null
          budget_utilization_percentage: number | null
          campaign_display_status: string | null
          campaign_duration_days: number | null
          campaign_objectives: Json | null
          campaign_progress_percentage: number | null
          campaign_tags: Json | null
          campaign_type:
            | Database["public"]["Enums"]["campaign_type_enum"]
            | null
          channels: Json | null
          competitive_context: string | null
          created_at: string | null
          created_by: string | null
          created_by_first_name: string | null
          created_by_last_name: string | null
          days_since_start: number | null
          days_until_end: number | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          geographic_scope: Json | null
          id: string | null
          is_template: boolean | null
          key_messages: Json | null
          launch_checklist: Json | null
          launch_ready: boolean | null
          lessons_learned: string | null
          name: string | null
          performance_metrics: Json | null
          post_campaign_analysis: string | null
          public_id: string | null
          roi_actual: number | null
          roi_target: number | null
          roi_variance: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status_enum"] | null
          success_criteria: Json | null
          tags_count: number | null
          target_audience: Json | null
          template_name: string | null
          tenant_id: string | null
          tenant_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_client_brand_memberships: {
        Row: {
          approved_by: string | null
          approved_by_first_name: string | null
          approved_by_last_name: string | null
          approved_date: string | null
          brand_id: string | null
          brand_name: string | null
          brand_slug: string | null
          brand_status: Database["public"]["Enums"]["brand_status_enum"] | null
          client_business_name: string | null
          client_email: string | null
          client_id: string | null
          client_owner_name: string | null
          client_status:
            | Database["public"]["Enums"]["client_status_enum"]
            | null
          communication_preferences: Json | null
          created_at: string | null
          current_tier_id: string | null
          days_since_last_purchase: number | null
          deleted_at: string | null
          id: string | null
          is_primary_brand: boolean | null
          joined_date: string | null
          last_points_earned_date: string | null
          last_purchase_date: string | null
          lifetime_points: number | null
          membership_days: number | null
          membership_preferences: Json | null
          membership_status:
            | Database["public"]["Enums"]["membership_status_enum"]
            | null
          points_balance: number | null
          points_utilization_rate: number | null
          public_id: string | null
          tenant_id: string | null
          tenant_name: string | null
          tenant_slug: string | null
          terms_accepted_date: string | null
          terms_version: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_brand_memberships_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_current_tier_id_fkey"
            columns: ["current_tier_id"]
            isOneToOne: false
            referencedRelation: "active_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_current_tier_id_fkey"
            columns: ["current_tier_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["tier_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_current_tier_id_fkey"
            columns: ["current_tier_id"]
            isOneToOne: false
            referencedRelation: "tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_client_invoice_data: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_neighborhood: string | null
          address_postal_code: string | null
          address_state: string | null
          address_street: string | null
          business_name: string | null
          cfdi_use: string | null
          cfdi_use_description: string | null
          client_business_name: string | null
          client_email: string | null
          client_id: string | null
          client_owner_name: string | null
          created_at: string | null
          deleted_at: string | null
          email_invoice: string | null
          full_address: string | null
          id: string | null
          invoice_name: string | null
          is_active: boolean | null
          is_preferred: boolean | null
          notes: string | null
          payment_form: string | null
          payment_form_description: string | null
          payment_method: string | null
          payment_method_description: string | null
          person_type:
            | Database["public"]["Enums"]["rfc_person_type_enum"]
            | null
          person_type_description: string | null
          public_id: string | null
          rfc: string | null
          tax_regime: string | null
          tenant_id: string | null
          tenant_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_invoice_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoice_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoice_data_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoice_data_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_invoice_data_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_invoice_data_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_invoice_data_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_client_tier_assignments: {
        Row: {
          assigned_by: string | null
          assigned_by_first_name: string | null
          assigned_by_last_name: string | null
          assigned_date: string | null
          assignment_duration_days: number | null
          assignment_notes: string | null
          assignment_status: string | null
          assignment_type:
            | Database["public"]["Enums"]["tier_assignment_type_enum"]
            | null
          auto_assignment_rule_id: string | null
          benefits_activated: boolean | null
          brand_id: string | null
          brand_name: string | null
          client_acknowledgment: boolean | null
          client_brand_membership_id: string | null
          client_business_name: string | null
          client_id: string | null
          client_owner_name: string | null
          created_at: string | null
          days_since_assignment: number | null
          deleted_at: string | null
          discount_percentage: number | null
          effective_from: string | null
          effective_until: string | null
          evaluation_period_end: string | null
          evaluation_period_start: string | null
          id: string | null
          is_current: boolean | null
          joined_date: string | null
          lifetime_points: number | null
          membership_status:
            | Database["public"]["Enums"]["membership_status_enum"]
            | null
          metadata: Json | null
          notification_sent: boolean | null
          notification_sent_at: string | null
          notification_status: string | null
          points_at_assignment: number | null
          points_balance: number | null
          points_multiplier: number | null
          previous_tier_id: string | null
          previous_tier_level: number | null
          previous_tier_name: string | null
          public_id: string | null
          purchase_amount_at_assignment: number | null
          purchases_at_assignment: number | null
          reason: string | null
          tenant_id: string | null
          tenant_name: string | null
          tier_id: string | null
          tier_level: number | null
          tier_movement_type: string | null
          tier_name: string | null
          updated_at: string | null
          visits_at_assignment: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "active_client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_previous_tier_id_fkey"
            columns: ["previous_tier_id"]
            isOneToOne: false
            referencedRelation: "active_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_previous_tier_id_fkey"
            columns: ["previous_tier_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["tier_id"]
          },
          {
            foreignKeyName: "client_tier_assignments_previous_tier_id_fkey"
            columns: ["previous_tier_id"]
            isOneToOne: false
            referencedRelation: "tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "active_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["tier_id"]
          },
          {
            foreignKeyName: "client_tier_assignments_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      active_client_types: {
        Row: {
          active_client_count: number | null
          assessment_frequency_days: number | null
          avg_assessment_compliance_rate: number | null
          avg_effective_assessment_frequency: number | null
          avg_effective_visit_frequency: number | null
          avg_monthly_visits: number | null
          avg_satisfaction_score: number | null
          category:
            | Database["public"]["Enums"]["client_type_category_enum"]
            | null
          characteristics: Json | null
          code: string | null
          created_at: string | null
          default_visit_frequency_days: number | null
          deleted_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          kpi_targets: Json | null
          market_distribution: Json | null
          name: string | null
          prospect_client_count: number | null
          public_id: string | null
          requires_assessment: boolean | null
          requires_inventory: boolean | null
          sort_order: number | null
          tenant_id: string | null
          tenant_name: string | null
          tenant_slug: string | null
          total_client_count: number | null
          updated_at: string | null
          zone_distribution: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_commercial_structures: {
        Row: {
          client_count: number | null
          code: string | null
          commission_structure: Json | null
          contact_company: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          coverage_zones: Json | null
          coverage_zones_details: Json | null
          created_at: string | null
          deleted_at: string | null
          delivery_time_days: number | null
          description: string | null
          id: string | null
          is_active: boolean | null
          minimum_order: number | null
          name: string | null
          payment_terms: string | null
          public_id: string | null
          sort_order: number | null
          structure_type:
            | Database["public"]["Enums"]["commercial_structure_type_enum"]
            | null
          supported_markets: Json | null
          supported_markets_details: Json | null
          tenant_id: string | null
          tenant_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_structures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_structures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "commercial_structures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "commercial_structures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "commercial_structures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_distributors: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_postal_code: string | null
          address_state: string | null
          address_street: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          employee_count: number | null
          id: string | null
          legal_name: string | null
          metadata: Json | null
          name: string | null
          notes: string | null
          public_id: string | null
          rfc: string | null
          status: string | null
          tenant_id: string | null
          tenant_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distributors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "distributors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "distributors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "distributors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_markets: {
        Row: {
          active_client_count: number | null
          avg_client_credit_limit: number | null
          characteristics: Json | null
          client_type_distribution: Json | null
          code: string | null
          commercial_structure_distribution: Json | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          first_client_registered: string | null
          id: string | null
          is_active: boolean | null
          last_client_registered: string | null
          last_visit_recorded: string | null
          name: string | null
          prospect_client_count: number | null
          public_id: string | null
          sort_order: number | null
          target_volume_max: number | null
          target_volume_min: number | null
          tenant_id: string | null
          tenant_name: string | null
          tenant_slug: string | null
          total_client_count: number | null
          updated_at: string | null
          zone_distribution: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_order_items: {
        Row: {
          batch_number: string | null
          client_id: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string | null
          deleted_at: string | null
          delivery_notes: string | null
          expiration_date_delivered: string | null
          expiration_date_requested: string | null
          free_item: boolean | null
          id: string | null
          item_notes: string | null
          item_status:
            | Database["public"]["Enums"]["order_item_status_enum"]
            | null
          line_discount_amount: number | null
          line_discount_percentage: number | null
          line_number: number | null
          line_subtotal: number | null
          line_total: number | null
          metadata: Json | null
          order_brand_id: string | null
          order_id: string | null
          order_number: string | null
          parent_order_status:
            | Database["public"]["Enums"]["order_status_enum"]
            | null
          product_code: string | null
          product_id: string | null
          product_name: string | null
          product_variant_id: string | null
          promotion_applied: boolean | null
          public_id: string | null
          quality_notes: string | null
          quality_rating: number | null
          quantity_confirmed: number | null
          quantity_delivered: number | null
          quantity_ordered: number | null
          refund_amount: number | null
          return_reason: string | null
          returned_quantity: number | null
          substitute_product_id: string | null
          substitute_variant_id: string | null
          substitution_reason: string | null
          tax_amount: number | null
          tax_rate: number | null
          tenant_id: string | null
          unit_cost: number | null
          unit_price: number | null
          unit_type:
            | Database["public"]["Enums"]["order_item_unit_type_enum"]
            | null
          updated_at: string | null
          variant_code: string | null
          variant_name: string | null
          volume_per_unit_ml: number | null
          weight_per_unit_grams: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_items_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "active_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_product_variant"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_product_variant"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_substitute_product"
            columns: ["substitute_product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_substitute_product"
            columns: ["substitute_product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_order_items_substitute_product"
            columns: ["substitute_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_substitute_variant"
            columns: ["substitute_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_substitute_variant"
            columns: ["substitute_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "fk_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "fk_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "fk_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["order_brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["order_brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["order_brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["order_brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["order_brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["order_brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["order_brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
        ]
      }
      active_orders: {
        Row: {
          actual_delivery_date: string | null
          assigned_to: string | null
          assigned_to_first_name: string | null
          assigned_to_last_name: string | null
          brand_id: string | null
          brand_name: string | null
          brand_slug: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_by_first_name: string | null
          cancelled_by_last_name: string | null
          client_business_name: string | null
          client_id: string | null
          client_invoice_data_id: string | null
          client_notes: string | null
          client_owner_name: string | null
          commercial_structure_id: string | null
          commercial_structure_name: string | null
          confirmed_delivery_date: string | null
          created_at: string | null
          currency: string | null
          customer_feedback: string | null
          customer_rating: number | null
          days_since_order: number | null
          days_until_confirmed_delivery: number | null
          days_until_requested_delivery: number | null
          deleted_at: string | null
          delivery_address: string | null
          delivery_confirmation: Json | null
          delivery_instructions: string | null
          delivery_status: string | null
          delivery_time_slot: string | null
          discount_amount: number | null
          discount_percentage: number | null
          estimated_delivery_time: unknown
          id: string | null
          internal_notes: string | null
          invoice_name: string | null
          invoice_required: boolean | null
          metadata: Json | null
          order_attachments: Json | null
          order_date: string | null
          order_display_status: string | null
          order_number: string | null
          order_status: Database["public"]["Enums"]["order_status_enum"] | null
          order_type: Database["public"]["Enums"]["order_type_enum"] | null
          payment_method:
            | Database["public"]["Enums"]["order_payment_method_enum"]
            | null
          payment_status:
            | Database["public"]["Enums"]["order_payment_status_enum"]
            | null
          payment_terms: string | null
          priority: Database["public"]["Enums"]["order_priority_enum"] | null
          processing_days: number | null
          public_id: string | null
          requested_delivery_date: string | null
          revenue_amount: number | null
          satisfaction_level: string | null
          shipping_cost: number | null
          source_channel:
            | Database["public"]["Enums"]["order_source_channel_enum"]
            | null
          structure_type:
            | Database["public"]["Enums"]["commercial_structure_type_enum"]
            | null
          subtotal: number | null
          tax_amount: number | null
          tenant_id: string | null
          tenant_name: string | null
          total_amount: number | null
          tracking_number: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "orders_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_invoice_data_id_fkey"
            columns: ["client_invoice_data_id"]
            isOneToOne: false
            referencedRelation: "active_client_invoice_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_invoice_data_id_fkey"
            columns: ["client_invoice_data_id"]
            isOneToOne: false
            referencedRelation: "client_invoice_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_commercial_structure_id_fkey"
            columns: ["commercial_structure_id"]
            isOneToOne: false
            referencedRelation: "active_commercial_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_commercial_structure_id_fkey"
            columns: ["commercial_structure_id"]
            isOneToOne: false
            referencedRelation: "commercial_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_points_transactions: {
        Row: {
          approval_required: boolean | null
          approved_at: string | null
          approved_by: string | null
          approved_by_first_name: string | null
          approved_by_last_name: string | null
          balance_after: number | null
          base_points: number | null
          brand_id: string | null
          brand_name: string | null
          campaign_id: string | null
          client_brand_membership_id: string | null
          client_business_name: string | null
          client_id: string | null
          client_owner_name: string | null
          created_at: string | null
          days_since_transaction: number | null
          days_until_expiration: number | null
          deleted_at: string | null
          effective_multiplier: number | null
          expiration_date: string | null
          expired_date: string | null
          id: string | null
          is_expired: boolean | null
          membership_status:
            | Database["public"]["Enums"]["membership_status_enum"]
            | null
          metadata: Json | null
          multiplier_applied: number | null
          notes: string | null
          points: number | null
          points_absolute: number | null
          points_classification: string | null
          points_rule_id: string | null
          processed_by: string | null
          processed_by_first_name: string | null
          processed_by_last_name: string | null
          promotion_id: string | null
          public_id: string | null
          reversal_of: string | null
          reversal_of_public_id: string | null
          reversed_by: string | null
          reversed_by_public_id: string | null
          source_description: string | null
          source_id: string | null
          source_type:
            | Database["public"]["Enums"]["points_source_type_enum"]
            | null
          tenant_id: string | null
          tenant_name: string | null
          transaction_date: string | null
          transaction_status: string | null
          transaction_type:
            | Database["public"]["Enums"]["points_transaction_type_enum"]
            | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "active_client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_reversal_of_fkey"
            columns: ["reversal_of"]
            isOneToOne: false
            referencedRelation: "active_points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_reversal_of_fkey"
            columns: ["reversal_of"]
            isOneToOne: false
            referencedRelation: "points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "active_points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "points_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "points_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "points_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_product_categories: {
        Row: {
          brand_id: string | null
          brand_name: string | null
          brand_slug: string | null
          category_level: number | null
          characteristics: Json | null
          code: string | null
          color_hex: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          full_path: string | null
          icon_url: string | null
          id: string | null
          is_active: boolean | null
          level_depth: number | null
          name: string | null
          parent_category_id: string | null
          product_count: number | null
          public_id: string | null
          sort_order: number | null
          tenant_id: string | null
          tenant_name: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      active_product_variants: {
        Row: {
          barcode: string | null
          brand_name: string | null
          brand_slug: string | null
          case_dimensions: Json | null
          case_weight_kg: number | null
          category_code: string | null
          category_name: string | null
          cost: number | null
          created_at: string | null
          deleted_at: string | null
          dimensions: Json | null
          discontinue_date: string | null
          full_package_description: string | null
          id: string | null
          is_active: boolean | null
          is_default: boolean | null
          launch_date: string | null
          package_material: string | null
          package_type: string | null
          price: number | null
          price_per_unit: number | null
          price_vs_base_percent: number | null
          product_base_price: number | null
          product_code: string | null
          product_id: string | null
          product_name: string | null
          product_unit_type:
            | Database["public"]["Enums"]["product_unit_type_enum"]
            | null
          public_id: string | null
          size_unit:
            | Database["public"]["Enums"]["product_variant_size_unit_enum"]
            | null
          size_value: number | null
          sort_order: number | null
          tenant_id: string | null
          tenant_name: string | null
          units_per_case: number | null
          updated_at: string | null
          variant_code: string | null
          variant_image_url: string | null
          variant_margin: number | null
          variant_name: string | null
          variant_status: string | null
          weight_grams: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "product_variants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "product_variants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "product_variants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_products: {
        Row: {
          barcode: string | null
          base_price: number | null
          brand_id: string | null
          brand_name: string | null
          brand_slug: string | null
          category_code: string | null
          category_full_path: string | null
          category_id: string | null
          category_name: string | null
          code: string | null
          cost: number | null
          created_at: string | null
          current_margin: number | null
          days_since_launch: number | null
          days_until_discontinuation: number | null
          deleted_at: string | null
          description: string | null
          dimensions: Json | null
          discontinue_date: string | null
          gallery_urls: Json | null
          id: string | null
          is_active: boolean | null
          is_featured: boolean | null
          launch_date: string | null
          margin_gap: number | null
          margin_target: number | null
          marketing_tags: Json | null
          maximum_stock: number | null
          minimum_stock: number | null
          name: string | null
          product_image_url: string | null
          product_status: string | null
          public_id: string | null
          requires_refrigeration: boolean | null
          shelf_life_days: number | null
          sort_order: number | null
          specifications: Json | null
          tenant_id: string | null
          tenant_name: string | null
          unit_type:
            | Database["public"]["Enums"]["product_unit_type_enum"]
            | null
          updated_at: string | null
          volume_ml: number | null
          weight_grams: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_promotion_redemptions: {
        Row: {
          application_type: string | null
          applied_by: string | null
          applied_by_first_name: string | null
          applied_by_last_name: string | null
          applied_discount_amount: number | null
          applied_percentage: number | null
          auto_applied: boolean | null
          bonus_points_awarded: number | null
          brand_id: string | null
          brand_name: string | null
          client_brand_membership_id: string | null
          client_business_name: string | null
          client_id: string | null
          client_notification_sent: boolean | null
          client_owner_name: string | null
          created_at: string | null
          days_since_redemption: number | null
          deleted_at: string | null
          discount_percentage_effective: number | null
          free_items_quantity: number | null
          id: string | null
          internal_notes: string | null
          maximum_discount_reached: boolean | null
          metadata: Json | null
          minimum_met: boolean | null
          order_id: string | null
          order_source_description: string | null
          order_subtotal_at_application: number | null
          order_type:
            | Database["public"]["Enums"]["promotion_order_type_enum"]
            | null
          original_promotion_value: number | null
          points_multiplier_applied: number | null
          promotion_id: string | null
          promotion_name: string | null
          promotion_status:
            | Database["public"]["Enums"]["promotion_status_enum"]
            | null
          promotion_type:
            | Database["public"]["Enums"]["promotion_type_enum"]
            | null
          promotion_type_applied:
            | Database["public"]["Enums"]["promotion_type_applied_enum"]
            | null
          public_id: string | null
          redemption_date: string | null
          redemption_display_status: string | null
          redemption_status:
            | Database["public"]["Enums"]["promotion_redemption_status_enum"]
            | null
          reversal_reason: string | null
          reversed_at: string | null
          reversed_by: string | null
          reversed_by_first_name: string | null
          reversed_by_last_name: string | null
          rules_validation: Json | null
          tenant_id: string | null
          tenant_name: string | null
          total_benefit_value: number | null
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
          validated_by_first_name: string | null
          validated_by_last_name: string | null
          validation_required: boolean | null
          validation_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "active_client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "active_promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotion_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotion_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotion_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      active_promotion_rules: {
        Row: {
          actual_reach: number | null
          apply_to_all: boolean | null
          brand_name: string | null
          created_at: string | null
          created_by: string | null
          created_by_first_name: string | null
          created_by_last_name: string | null
          custom_conditions: Json | null
          days_until_activation: number | null
          days_until_expiration: number | null
          deleted_at: string | null
          effective_from: string | null
          effective_until: string | null
          estimated_reach: number | null
          id: string | null
          is_active: boolean | null
          is_inclusion: boolean | null
          last_calculated_at: string | null
          priority: number | null
          promotion_id: string | null
          promotion_name: string | null
          promotion_status:
            | Database["public"]["Enums"]["promotion_status_enum"]
            | null
          promotion_type:
            | Database["public"]["Enums"]["promotion_type_enum"]
            | null
          public_id: string | null
          reach_accuracy_percentage: number | null
          rule_description: string | null
          rule_display_status: string | null
          rule_name: string | null
          rule_type:
            | Database["public"]["Enums"]["promotion_rule_type_enum"]
            | null
          segmentation_type: string | null
          target_categories: Json | null
          target_client_types: Json | null
          target_clients: Json | null
          target_commercial_structures: Json | null
          target_markets: Json | null
          target_products: Json | null
          target_states: Json | null
          target_tiers: Json | null
          target_zones: Json | null
          tenant_id: string | null
          tenant_name: string | null
          updated_at: string | null
          validation_query: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_rules_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "active_promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_rules_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotion_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotion_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotion_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_promotions: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          approved_by_first_name: string | null
          approved_by_last_name: string | null
          auto_apply: boolean | null
          brand_id: string | null
          brand_name: string | null
          brand_slug: string | null
          budget_allocated: number | null
          budget_remaining: number | null
          budget_spent: number | null
          budget_utilization_percentage: number | null
          buy_quantity: number | null
          campaign_id: string | null
          campaign_name: string | null
          campaign_type:
            | Database["public"]["Enums"]["campaign_type_enum"]
            | null
          created_at: string | null
          created_by: string | null
          created_by_first_name: string | null
          created_by_last_name: string | null
          creative_assets: Json | null
          days_of_week: Json | null
          days_until_end: number | null
          deleted_at: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          end_date: string | null
          end_time: string | null
          get_quantity: number | null
          id: string | null
          internal_notes: string | null
          max_discount_amount: number | null
          min_purchase_amount: number | null
          name: string | null
          performance_metrics: Json | null
          points_multiplier: number | null
          priority: number | null
          promo_code: string | null
          promotion_display_status: string | null
          promotion_duration_days: number | null
          promotion_progress_percentage: number | null
          promotion_type:
            | Database["public"]["Enums"]["promotion_type_enum"]
            | null
          public_id: string | null
          remaining_usage: number | null
          requires_code: boolean | null
          stackable: boolean | null
          start_date: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["promotion_status_enum"] | null
          tenant_id: string | null
          tenant_name: string | null
          terms_and_conditions: string | null
          updated_at: string | null
          usage_count_total: number | null
          usage_limit_per_client: number | null
          usage_limit_total: number | null
          usage_percentage: number | null
          valid_now: boolean | null
          valid_today: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "promotions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "promotions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_reward_redemptions: {
        Row: {
          actual_savings: number | null
          applied_amount: number | null
          applied_to_order_id: string | null
          brand_id: string | null
          brand_name: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_by_first_name: string | null
          cancelled_by_last_name: string | null
          client_brand_membership_id: string | null
          client_business_name: string | null
          client_id: string | null
          client_notes: string | null
          client_owner_name: string | null
          created_at: string | null
          days_since_redemption: number | null
          days_to_use: number | null
          days_until_expiration: number | null
          deleted_at: string | null
          expiration_date: string | null
          id: string | null
          membership_status:
            | Database["public"]["Enums"]["membership_status_enum"]
            | null
          metadata: Json | null
          notification_sent: boolean | null
          notification_sent_at: string | null
          original_reward_value: number | null
          points_deducted: number | null
          points_refunded: number | null
          points_transaction_id: string | null
          public_id: string | null
          redeemed_by: string | null
          redeemed_by_first_name: string | null
          redeemed_by_last_name: string | null
          redemption_code: string | null
          redemption_date: string | null
          redemption_display_status: string | null
          redemption_status:
            | Database["public"]["Enums"]["redemption_status_enum"]
            | null
          refund_transaction_id: string | null
          reward_id: string | null
          reward_name: string | null
          reward_points_cost: number | null
          reward_type: Database["public"]["Enums"]["reward_type_enum"] | null
          tenant_id: string | null
          tenant_name: string | null
          updated_at: string | null
          usage_instructions: string | null
          used_date: string | null
          validated_by: string | null
          validated_by_first_name: string | null
          validated_by_last_name: string | null
          validation_notes: string | null
          value_utilization_percentage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "client_brand_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_brand_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "active_client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_client_brand_membership_id_fkey"
            columns: ["client_brand_membership_id"]
            isOneToOne: false
            referencedRelation: "client_brand_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_points_transaction_id_fkey"
            columns: ["points_transaction_id"]
            isOneToOne: false
            referencedRelation: "active_points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_points_transaction_id_fkey"
            columns: ["points_transaction_id"]
            isOneToOne: false
            referencedRelation: "points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_refund_transaction_id_fkey"
            columns: ["refund_transaction_id"]
            isOneToOne: false
            referencedRelation: "active_points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_refund_transaction_id_fkey"
            columns: ["refund_transaction_id"]
            isOneToOne: false
            referencedRelation: "points_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "active_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "reward_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "reward_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "reward_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      active_rewards: {
        Row: {
          applicable_categories: Json | null
          applicable_products: Json | null
          auto_apply: boolean | null
          brand_id: string | null
          brand_name: string | null
          brand_slug: string | null
          cost_category: string | null
          created_at: string | null
          days_until_activation: number | null
          days_until_expiration: number | null
          deleted_at: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          id: string | null
          is_active: boolean | null
          is_featured: boolean | null
          max_discount_amount: number | null
          min_purchase_amount: number | null
          monetary_value: number | null
          name: string | null
          notification_message: string | null
          points_cost: number | null
          product_code: string | null
          product_id: string | null
          product_name: string | null
          product_variant_id: string | null
          public_id: string | null
          redemption_instructions: string | null
          remaining_usage: number | null
          restriction_type: string | null
          reward_image_url: string | null
          reward_status: string | null
          reward_type: Database["public"]["Enums"]["reward_type_enum"] | null
          sort_order: number | null
          tenant_id: string | null
          tenant_name: string | null
          terms_and_conditions: string | null
          tier_requirements: Json | null
          updated_at: string | null
          usage_count_total: number | null
          usage_limit_per_client: number | null
          usage_limit_total: number | null
          usage_percentage: number | null
          valid_from: string | null
          valid_until: string | null
          value_per_point: number | null
          variant_code: string | null
          variant_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "rewards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "rewards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "rewards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_tenants: {
        Row: {
          address: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string | null
          name: string | null
          phone: string | null
          public_id: string | null
          settings: Json | null
          slug: string | null
          status: Database["public"]["Enums"]["tenant_status_enum"] | null
          subscription_plan:
            | Database["public"]["Enums"]["tenant_subscription_plan_enum"]
            | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          public_id?: string | null
          settings?: Json | null
          slug?: string | null
          status?: Database["public"]["Enums"]["tenant_status_enum"] | null
          subscription_plan?:
            | Database["public"]["Enums"]["tenant_subscription_plan_enum"]
            | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          public_id?: string | null
          settings?: Json | null
          slug?: string | null
          status?: Database["public"]["Enums"]["tenant_status_enum"] | null
          subscription_plan?:
            | Database["public"]["Enums"]["tenant_subscription_plan_enum"]
            | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      active_tiers: {
        Row: {
          active_members: number | null
          auto_assignment_enabled: boolean | null
          auto_assignment_rules: Json | null
          badge_image_url: string | null
          benefits: Json | null
          benefits_count: number | null
          brand_id: string | null
          brand_name: string | null
          brand_slug: string | null
          code: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          discount_percentage: number | null
          display_color: string | null
          downgrade_enabled: boolean | null
          evaluation_period_months: number | null
          id: string | null
          is_active: boolean | null
          is_default: boolean | null
          min_points_required: number | null
          min_purchase_amount: number | null
          min_purchases_required: number | null
          min_visits_required: number | null
          name: string | null
          next_tier_min_points: number | null
          points_multiplier: number | null
          previous_tier_min_points: number | null
          public_id: string | null
          requirements: Json | null
          retention_period_months: number | null
          sort_order: number | null
          tenant_id: string | null
          tenant_name: string | null
          tier_color: string | null
          tier_icon_url: string | null
          tier_level: number | null
          tier_status: string | null
          tier_value_level: string | null
          total_members: number | null
          updated_at: string | null
          upgrade_notification: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "tiers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tiers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tiers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tiers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          department: string | null
          email: string | null
          employee_code: string | null
          first_name: string | null
          hire_date: string | null
          id: string | null
          last_login_at: string | null
          last_name: string | null
          manager_id: string | null
          phone: string | null
          position: string | null
          preferences: Json | null
          public_id: string | null
          status: Database["public"]["Enums"]["user_profile_status_enum"] | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          employee_code?: string | null
          first_name?: string | null
          hire_date?: string | null
          id?: string | null
          last_login_at?: string | null
          last_name?: string | null
          manager_id?: string | null
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          public_id?: string | null
          status?:
            | Database["public"]["Enums"]["user_profile_status_enum"]
            | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          employee_code?: string | null
          first_name?: string | null
          hire_date?: string | null
          id?: string | null
          last_login_at?: string | null
          last_name?: string | null
          manager_id?: string | null
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          public_id?: string | null
          status?:
            | Database["public"]["Enums"]["user_profile_status_enum"]
            | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      active_user_roles: {
        Row: {
          brand_id: string | null
          created_at: string | null
          deleted_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string | null
          is_currently_active: boolean | null
          is_primary: boolean | null
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role_type_enum"] | null
          scope: Database["public"]["Enums"]["user_role_scope_enum"] | null
          status: Database["public"]["Enums"]["user_role_status_enum"] | null
          tenant_id: string | null
          updated_at: string | null
          user_profile_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      active_visit_assessments: {
        Row: {
          assessment_notes: string | null
          assessment_score: number | null
          assessment_status: string | null
          assessment_type:
            | Database["public"]["Enums"]["assessment_type_enum"]
            | null
          brand_name: string | null
          calculated_price_variance: number | null
          client_business_name: string | null
          competitor_count: number | null
          competitor_present: boolean | null
          competitor_prices: Json | null
          competitor_products: Json | null
          created_at: string | null
          current_price: number | null
          deleted_at: string | null
          display_quality:
            | Database["public"]["Enums"]["display_quality_enum"]
            | null
          expiration_date: string | null
          facing_count: number | null
          id: string | null
          is_present: boolean | null
          package_condition:
            | Database["public"]["Enums"]["package_condition_enum"]
            | null
          photo_evidence_urls: Json | null
          price_variance_percent: number | null
          product_code: string | null
          product_id: string | null
          product_name: string | null
          product_variant_id: string | null
          promotional_materials: Json | null
          promotor_first_name: string | null
          promotor_last_name: string | null
          public_id: string | null
          recommended_actions: Json | null
          requires_action: boolean | null
          shelf_position:
            | Database["public"]["Enums"]["shelf_position_enum"]
            | null
          shelf_space_cm: number | null
          stock_level: Database["public"]["Enums"]["stock_level_enum"] | null
          stock_quantity: number | null
          suggested_price: number | null
          tenant_id: string | null
          tenant_name: string | null
          updated_at: string | null
          variant_code: string | null
          variant_name: string | null
          visit_date: string | null
          visit_id: string | null
          visit_status: Database["public"]["Enums"]["visit_status_enum"] | null
          visit_workflow_status:
            | Database["public"]["Enums"]["visit_workflow_status_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_assessments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "visit_assessments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      active_visit_communication_plans: {
        Row: {
          brand_id: string | null
          brand_name: string | null
          brand_slug: string | null
          campaign_duration: Json | null
          campaign_end_date: string | null
          campaign_id: string | null
          client_approval:
            | Database["public"]["Enums"]["client_approval_enum"]
            | null
          client_approval_notes: string | null
          client_business_name: string | null
          created_at: string | null
          current_status:
            | Database["public"]["Enums"]["communication_current_status_enum"]
            | null
          days_until_follow_up: number | null
          deleted_at: string | null
          effectiveness_category: string | null
          effectiveness_rating: number | null
          follow_up_date: string | null
          follow_up_reason: string | null
          follow_up_required: boolean | null
          id: string | null
          implementation_notes: string | null
          installation_cost: number | null
          installation_date_actual: string | null
          installation_date_planned: string | null
          installation_location: string | null
          installed_by: string | null
          installed_by_first_name: string | null
          installed_by_last_name: string | null
          key_message: string | null
          material_condition_notes: string | null
          material_cost: number | null
          material_description: string | null
          material_name: string | null
          material_size: string | null
          material_type:
            | Database["public"]["Enums"]["communication_material_type_enum"]
            | null
          photo_after_count: number | null
          photo_after_urls: Json | null
          photo_before_count: number | null
          photo_before_urls: Json | null
          plan_status: string | null
          planned_action:
            | Database["public"]["Enums"]["communication_planned_action_enum"]
            | null
          public_id: string | null
          quantity_current: number | null
          quantity_planned: number | null
          target_audience: string | null
          tenant_id: string | null
          tenant_name: string | null
          total_cost: number | null
          updated_at: string | null
          visit_date: string | null
          visit_id: string | null
          visit_promotor_first_name: string | null
          visit_promotor_last_name: string | null
          visit_status: Database["public"]["Enums"]["visit_status_enum"] | null
          visit_workflow_status:
            | Database["public"]["Enums"]["visit_workflow_status_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_installed_by_fkey"
            columns: ["installed_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_installed_by_fkey"
            columns: ["installed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_communication_plans_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_communication_plans_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      active_visit_inventories: {
        Row: {
          batch_numbers: Json | null
          brand_name: string | null
          client_business_name: string | null
          condition_notes: string | null
          count_accuracy:
            | Database["public"]["Enums"]["count_accuracy_enum"]
            | null
          count_verification_status: string | null
          counted_by: string | null
          counted_by_first_name: string | null
          counted_by_last_name: string | null
          created_at: string | null
          current_stock: number | null
          deleted_at: string | null
          expiration_dates: Json | null
          id: string | null
          last_delivery_date: string | null
          location_in_store:
            | Database["public"]["Enums"]["location_in_store_enum"]
            | null
          nearest_expiration_date: string | null
          next_delivery_expected: string | null
          notes: string | null
          photo_evidence_urls: Json | null
          product_code: string | null
          product_id: string | null
          product_maximum_stock: number | null
          product_minimum_stock: number | null
          product_name: string | null
          product_variant_id: string | null
          public_id: string | null
          restock_needed: boolean | null
          restock_priority:
            | Database["public"]["Enums"]["restock_priority_enum"]
            | null
          restock_quantity: number | null
          restock_status: string | null
          rotation_quality:
            | Database["public"]["Enums"]["rotation_quality_enum"]
            | null
          stock_status_vs_product_limits: string | null
          storage_conditions: Json | null
          tenant_id: string | null
          tenant_name: string | null
          unit_type:
            | Database["public"]["Enums"]["product_unit_type_enum"]
            | null
          updated_at: string | null
          variant_code: string | null
          variant_name: string | null
          verified_by: string | null
          verified_by_first_name: string | null
          verified_by_last_name: string | null
          visit_date: string | null
          visit_id: string | null
          visit_status: Database["public"]["Enums"]["visit_status_enum"] | null
          visit_workflow_status:
            | Database["public"]["Enums"]["visit_workflow_status_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_inventories_counted_by_fkey"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_counted_by_fkey"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "visit_inventories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_inventories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_inventories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_inventories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_inventories_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_inventories_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      active_visit_order_items: {
        Row: {
          approval_notes: string | null
          approved_by: string | null
          client_id: string | null
          client_notes: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string | null
          cross_sell_item: boolean | null
          deleted_at: string | null
          delivery_date_requested: string | null
          delivery_preference:
            | Database["public"]["Enums"]["visit_order_item_delivery_preference_enum"]
            | null
          free_item_reason: string | null
          id: string | null
          item_priority:
            | Database["public"]["Enums"]["visit_order_item_priority_enum"]
            | null
          item_source:
            | Database["public"]["Enums"]["visit_order_item_source_enum"]
            | null
          item_urgency_notes: string | null
          line_discount_amount: number | null
          line_discount_percentage: number | null
          line_number: number | null
          line_subtotal: number | null
          line_total: number | null
          metadata: Json | null
          negotiation_reason: string | null
          original_price: number | null
          parent_order_status:
            | Database["public"]["Enums"]["visit_order_status_enum"]
            | null
          price_negotiated: boolean | null
          product_code: string | null
          product_id: string | null
          product_name: string | null
          product_variant_id: string | null
          promotion_manually_applied: boolean | null
          promotion_suggested_by_system: boolean | null
          promotor_id: string | null
          promotor_notes: string | null
          public_id: string | null
          quality_requirements: string | null
          quantity_available: number | null
          quantity_confirmed: number | null
          quantity_ordered: number | null
          requires_approval: boolean | null
          sample_item: boolean | null
          suggested_price: number | null
          tax_amount: number | null
          tax_rate: number | null
          tenant_id: string | null
          unit_cost: number | null
          unit_price: number | null
          unit_type:
            | Database["public"]["Enums"]["visit_order_item_unit_type_enum"]
            | null
          updated_at: string | null
          upsell_item: boolean | null
          variant_code: string | null
          variant_name: string | null
          visit_order_id: string | null
          visit_order_number: string | null
          visit_public_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_visit_order_items_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_variant_stats"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_product_variant"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "active_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_product_variant"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_visit_order"
            columns: ["visit_order_id"]
            isOneToOne: false
            referencedRelation: "active_visit_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_order_items_visit_order"
            columns: ["visit_order_id"]
            isOneToOne: false
            referencedRelation: "visit_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_advisor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_advisor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
        ]
      }
      active_visit_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_by_first_name: string | null
          approved_by_last_name: string | null
          attachment_count: number | null
          calculated_commission: number | null
          client_business_name: string | null
          client_id: string | null
          client_invoice_data_id: string | null
          client_owner_name: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string | null
          currency: string | null
          days_until_delivery: number | null
          deleted_at: string | null
          delivery_address: string | null
          delivery_date: string | null
          delivery_instructions: string | null
          discount_amount: number | null
          exchange_rate: number | null
          external_order_id: string | null
          id: string | null
          invoice_business_name: string | null
          invoice_required: boolean | null
          invoice_rfc: string | null
          order_attachments: Json | null
          order_date: string | null
          order_display_status: string | null
          order_notes: string | null
          order_number: string | null
          order_status:
            | Database["public"]["Enums"]["visit_order_status_enum"]
            | null
          order_type:
            | Database["public"]["Enums"]["visit_order_type_enum"]
            | null
          payment_method:
            | Database["public"]["Enums"]["visit_order_payment_method_enum"]
            | null
          payment_terms: string | null
          promotor_first_name: string | null
          promotor_id: string | null
          promotor_last_name: string | null
          public_id: string | null
          requires_approval: boolean | null
          subtotal: number | null
          tax_amount: number | null
          tenant_id: string | null
          tenant_name: string | null
          total_amount: number | null
          total_amount_mxn: number | null
          updated_at: string | null
          visit_date: string | null
          visit_id: string | null
          visit_status: Database["public"]["Enums"]["visit_status_enum"] | null
          visit_workflow_status:
            | Database["public"]["Enums"]["visit_workflow_status_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_orders_advisor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_advisor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_client_invoice_data_id_fkey"
            columns: ["client_invoice_data_id"]
            isOneToOne: false
            referencedRelation: "active_client_invoice_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_client_invoice_data_id_fkey"
            columns: ["client_invoice_data_id"]
            isOneToOne: false
            referencedRelation: "client_invoice_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visit_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "active_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "v_visit_assessment_facts"
            referencedColumns: ["visit_id"]
          },
          {
            foreignKeyName: "visit_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      active_visits: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          client_business_name: string | null
          client_id: string | null
          client_market_name: string | null
          client_owner_name: string | null
          client_satisfaction_rating: number | null
          client_zone_name: string | null
          created_at: string | null
          days_since_visit: number | null
          days_until_next_visit: number | null
          deleted_at: string | null
          duration_minutes: number | null
          effective_duration_minutes: number | null
          follow_up_reason: string | null
          id: string | null
          location_coordinates: unknown
          metadata: Json | null
          next_visit_date: string | null
          overall_status: string | null
          promotor_email: string | null
          promotor_first_name: string | null
          promotor_id: string | null
          promotor_last_name: string | null
          promotor_notes: string | null
          public_id: string | null
          requires_follow_up: boolean | null
          supervisor_first_name: string | null
          supervisor_last_name: string | null
          supervisor_notes: string | null
          tenant_id: string | null
          tenant_name: string | null
          updated_at: string | null
          visit_attachments: Json | null
          visit_date: string | null
          visit_notes: string | null
          visit_objective: string | null
          visit_status: Database["public"]["Enums"]["visit_status_enum"] | null
          visit_time_end: string | null
          visit_time_start: string | null
          visit_type: Database["public"]["Enums"]["visit_type_enum"] | null
          weather_conditions: string | null
          workflow_status:
            | Database["public"]["Enums"]["visit_workflow_status_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_advisor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_advisor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      active_zones: {
        Row: {
          cities: Json | null
          code: string | null
          coordinates: Json | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          full_path: string | null
          id: string | null
          is_active: boolean | null
          level: number | null
          name: string | null
          parent_zone_id: string | null
          postal_codes: Json | null
          public_id: string | null
          sort_order: number | null
          state: string | null
          tenant_id: string | null
          tenant_name: string | null
          updated_at: string | null
          zone_type: Database["public"]["Enums"]["zone_type_enum"] | null
        }
        Relationships: []
      }
      brand_membership_stats: {
        Row: {
          active_memberships: number | null
          avg_lifetime_points: number | null
          avg_points_balance: number | null
          brand_id: string | null
          brand_name: string | null
          brand_public_id: string | null
          first_membership_date: string | null
          inactive_memberships: number | null
          last_membership_date: string | null
          last_purchase_recorded: string | null
          pending_memberships: number | null
          primary_brand_memberships: number | null
          rejected_memberships: number | null
          suspended_memberships: number | null
          tenant_id: string | null
          tenant_name: string | null
          total_lifetime_points: number | null
          total_memberships: number | null
          total_points_balance: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_product_stats: {
        Row: {
          active_products: number | null
          avg_base_price: number | null
          avg_current_margin: number | null
          avg_target_margin: number | null
          brand_id: string | null
          brand_name: string | null
          brand_public_id: string | null
          categories_used: number | null
          discontinued_products: number | null
          featured_products: number | null
          max_base_price: number | null
          min_base_price: number | null
          products_with_barcode: number | null
          products_with_cost_data: number | null
          refrigerated_products: number | null
          tenant_id: string | null
          total_products: number | null
          upcoming_products: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_tier_member_distribution: {
        Row: {
          active_members: number | null
          brand_id: string | null
          brand_name: string | null
          tier_id: string | null
          tier_level: number | null
          tier_name: string | null
          total_members: number | null
        }
        Relationships: []
      }
      brand_tier_stats: {
        Row: {
          active_tiers: number | null
          auto_assignment_tiers: number | null
          avg_discount_percentage: number | null
          avg_points_multiplier: number | null
          brand_id: string | null
          brand_name: string | null
          highest_tier_points: number | null
          lowest_tier_points: number | null
          tenant_name: string | null
          total_active_members: number | null
          total_tiers: number | null
        }
        Relationships: []
      }
      client_type_kpi_analysis: {
        Row: {
          active_clients: number | null
          actual_assessment_compliance: number | null
          actual_average_order_value: number | null
          actual_conversion_rate: number | null
          actual_inventory_accuracy: number | null
          actual_monthly_visits: number | null
          actual_satisfaction_score: number | null
          avg_credit_limit: number | null
          avg_effective_assessment_frequency: number | null
          avg_effective_visit_frequency: number | null
          category:
            | Database["public"]["Enums"]["client_type_category_enum"]
            | null
          client_type_code: string | null
          client_type_id: string | null
          client_type_name: string | null
          client_type_public_id: string | null
          commercial_structures_used: number | null
          conversion_rate_gap: number | null
          first_client_registered: string | null
          inactive_clients: number | null
          kpi_targets: Json | null
          last_client_registered: string | null
          last_visit_recorded: string | null
          markets_covered: number | null
          monthly_visits_gap: number | null
          prospect_clients: number | null
          requires_assessment: boolean | null
          requires_inventory: boolean | null
          suspended_clients: number | null
          target_assessment_compliance: number | null
          target_average_order_value: number | null
          target_conversion_rate: number | null
          target_inventory_accuracy: number | null
          target_monthly_visits: number | null
          target_satisfaction_score: number | null
          tenant_id: string | null
          tenant_name: string | null
          total_clients: number | null
          zones_covered: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "client_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_type_tenant_summary: {
        Row: {
          active_client_types: number | null
          active_clients_across_types: number | null
          avg_assessment_frequency: number | null
          avg_default_visit_frequency: number | null
          hybrid_types: number | null
          institutional_types: number | null
          online_types: number | null
          retail_types: number | null
          tenant_id: string | null
          tenant_name: string | null
          tenant_public_id: string | null
          total_client_types: number | null
          total_clients_across_types: number | null
          types_requiring_assessment: number | null
          types_requiring_inventory: number | null
          wholesale_types: number | null
        }
        Relationships: []
      }
      clients_with_inherited_values: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_neighborhood: string | null
          address_postal_code: string | null
          address_state: string | null
          address_street: string | null
          assessment_frequency_days: number | null
          business_name: string | null
          client_type_code: string | null
          client_type_id: string | null
          client_type_name: string | null
          commercial_structure_code: string | null
          commercial_structure_id: string | null
          commercial_structure_name: string | null
          coordinates: unknown
          created_at: string | null
          credit_limit: number | null
          deleted_at: string | null
          effective_assessment_frequency_days: number | null
          effective_minimum_order: number | null
          effective_payment_terms: string | null
          effective_visit_frequency_days: number | null
          email: string | null
          id: string | null
          inherits_assessment_frequency: boolean | null
          inherits_minimum_order: boolean | null
          inherits_payment_terms: boolean | null
          inherits_visit_frequency: boolean | null
          last_visit_date: string | null
          legal_name: string | null
          market_code: string | null
          market_id: string | null
          market_name: string | null
          metadata: Json | null
          minimum_order: number | null
          notes: string | null
          owner_last_name: string | null
          owner_name: string | null
          payment_terms: string | null
          phone: string | null
          public_id: string | null
          registration_date: string | null
          status: Database["public"]["Enums"]["client_status_enum"] | null
          tax_id: string | null
          tenant_id: string | null
          tenant_name: string | null
          updated_at: string | null
          user_id: string | null
          visit_frequency_days: number | null
          whatsapp: string | null
          zone_code: string | null
          zone_id: string | null
          zone_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_client_type_id_fkey"
            columns: ["client_type_id"]
            isOneToOne: false
            referencedRelation: "active_client_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_client_type_id_fkey"
            columns: ["client_type_id"]
            isOneToOne: false
            referencedRelation: "client_type_kpi_analysis"
            referencedColumns: ["client_type_id"]
          },
          {
            foreignKeyName: "clients_client_type_id_fkey"
            columns: ["client_type_id"]
            isOneToOne: false
            referencedRelation: "client_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_commercial_structure_id_fkey"
            columns: ["commercial_structure_id"]
            isOneToOne: false
            referencedRelation: "active_commercial_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_commercial_structure_id_fkey"
            columns: ["commercial_structure_id"]
            isOneToOne: false
            referencedRelation: "commercial_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "active_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "market_stats"
            referencedColumns: ["market_id"]
          },
          {
            foreignKeyName: "clients_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      market_stats: {
        Row: {
          active_clients: number | null
          actual_average_order_value: number | null
          actual_monthly_volume: number | null
          assessment_compliance_rate: number | null
          avg_credit_limit: number | null
          avg_effective_assessment_frequency: number | null
          avg_effective_visit_frequency: number | null
          characteristics: Json | null
          client_types_present: number | null
          commercial_structures_used: number | null
          first_client_registered: string | null
          inactive_clients: number | null
          last_client_registered: string | null
          last_visit_recorded: string | null
          market_code: string | null
          market_id: string | null
          market_name: string | null
          market_public_id: string | null
          prospect_clients: number | null
          suspended_clients: number | null
          target_volume_max: number | null
          target_volume_midpoint: number | null
          target_volume_min: number | null
          target_volume_range: number | null
          tenant_id: string | null
          tenant_name: string | null
          total_assessments_this_month: number | null
          total_clients: number | null
          total_visits_this_month: number | null
          visit_compliance_rate: number | null
          volume_excess_over_max_target: number | null
          volume_gap_to_min_target: number | null
          zones_covered: number | null
        }
        Relationships: [
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "markets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      market_tenant_summary: {
        Row: {
          active_clients_across_markets: number | null
          active_markets: number | null
          avg_target_volume_max: number | null
          avg_target_volume_min: number | null
          max_target_volume_across_markets: number | null
          min_target_volume_across_markets: number | null
          tenant_id: string | null
          tenant_name: string | null
          tenant_public_id: string | null
          total_client_types_present: number | null
          total_clients_across_markets: number | null
          total_markets: number | null
          total_zones_covered: number | null
        }
        Relationships: []
      }
      product_category_stats: {
        Row: {
          active_categories: number | null
          brand_id: string | null
          brand_name: string | null
          brand_specific_categories: number | null
          global_categories: number | null
          level_2_categories: number | null
          level_3_categories: number | null
          level_4_categories: number | null
          level_5_categories: number | null
          max_level_depth: number | null
          root_categories: number | null
          tenant_id: string | null
          tenant_name: string | null
          total_categories: number | null
        }
        Relationships: []
      }
      product_variant_stats: {
        Row: {
          active_variants: number | null
          avg_size_value: number | null
          avg_variant_margin: number | null
          avg_variant_price: number | null
          brand_name: string | null
          default_variants: number | null
          discontinued_variants: number | null
          max_size_value: number | null
          max_variant_price: number | null
          min_size_value: number | null
          min_variant_price: number | null
          package_types_used: number | null
          product_code: string | null
          product_id: string | null
          product_name: string | null
          size_units_used: number | null
          tenant_id: string | null
          total_variants: number | null
          upcoming_variants: number | null
          variants_with_barcode: number | null
          variants_with_cost_data: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_kpi_assortment: {
        Row: {
          avg_assortment_pct: number | null
          brand_id: string | null
          period_month: string | null
          tenant_id: string | null
          visit_count: number | null
          zone_id: string | null
          zone_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_kpi_dashboard_summary: {
        Row: {
          achievement_pct: number | null
          actual_value: number | null
          brand_id: string | null
          kpi_slug: string | null
          period_month: string | null
          target_value: number | null
          tenant_id: string | null
          unit: string | null
        }
        Relationships: []
      }
      v_kpi_market_share: {
        Row: {
          brand_facings: number | null
          brand_id: string | null
          brand_present: number | null
          competitor_facings: number | null
          competitor_present: number | null
          period_month: string | null
          share_by_facings_pct: number | null
          share_pct: number | null
          tenant_id: string | null
          zone_id: string | null
          zone_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_kpi_mix: {
        Row: {
          brand_id: string | null
          distinct_client_types_visited: number | null
          distinct_markets_visited: number | null
          period_month: string | null
          tenant_id: string | null
          total_clients_visited: number | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_kpi_reach: {
        Row: {
          brand_id: string | null
          clients_visited: number | null
          market_id: string | null
          market_name: string | null
          period_month: string | null
          reach_pct: number | null
          tenant_id: string | null
          total_active_members: number | null
          zone_id: string | null
          zone_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "active_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "market_stats"
            referencedColumns: ["market_id"]
          },
          {
            foreignKeyName: "clients_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_kpi_share_of_shelf: {
        Row: {
          brand_id: string | null
          combined_pct: number | null
          exhib_executed: number | null
          exhib_pct: number | null
          exhib_total: number | null
          period_month: string | null
          pop_pct: number | null
          pop_present: number | null
          pop_total: number | null
          tenant_id: string | null
          zone_id: string | null
          zone_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_kpi_volume: {
        Row: {
          brand_id: string | null
          market_id: string | null
          market_name: string | null
          order_count: number | null
          period_month: string | null
          period_week: string | null
          revenue_mxn: number | null
          tenant_id: string | null
          unique_clients: number | null
          weight_tons: number | null
          zone_id: string | null
          zone_name: string | null
        }
        Relationships: []
      }
      v_order_line_facts: {
        Row: {
          brand_id: string | null
          client_id: string | null
          line_id: string | null
          line_total: number | null
          market_id: string | null
          market_name: string | null
          order_date: string | null
          order_id: string | null
          period_month: string | null
          period_week: string | null
          product_id: string | null
          quantity: number | null
          source: string | null
          tenant_id: string | null
          unit_price: number | null
          variant_id: string | null
          weight_kg: number | null
          zone_id: string | null
          zone_name: string | null
        }
        Relationships: []
      }
      v_visit_assessment_facts: {
        Row: {
          brand_id: string | null
          client_id: string | null
          client_type_category:
            | Database["public"]["Enums"]["client_type_category_enum"]
            | null
          market_id: string | null
          market_name: string | null
          period_month: string | null
          period_week: string | null
          promotor_id: string | null
          tenant_id: string | null
          visit_date: string | null
          visit_id: string | null
          visit_status: Database["public"]["Enums"]["visit_status_enum"] | null
          workflow_status:
            | Database["public"]["Enums"]["visit_workflow_status_enum"]
            | null
          zone_id: string | null
          zone_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "active_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "market_stats"
            referencedColumns: ["market_id"]
          },
          {
            foreignKeyName: "clients_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_advisor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_advisor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "active_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_membership_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_product_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_member_distribution"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_tier_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_with_inherited_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "active_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "client_type_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "market_tenant_summary"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "product_category_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_current_margin: {
        Args: { product_base_price: number; product_cost: number }
        Returns: number
      }
      calculate_order_item_totals: {
        Args: {
          p_discount_percentage?: number
          p_quantity: number
          p_tax_rate?: number
          p_unit_price: number
        }
        Returns: {
          line_discount_amount: number
          line_subtotal: number
          line_total: number
          tax_amount: number
        }[]
      }
      calculate_visit_order_item_totals: {
        Args: {
          p_discount_percentage?: number
          p_quantity: number
          p_tax_rate?: number
          p_unit_price: number
        }
        Returns: {
          line_discount_amount: number
          line_subtotal: number
          line_total: number
          tax_amount: number
        }[]
      }
      complete_visit: { Args: { p_visit_id: string }; Returns: Json }
      create_purchase_with_promotions: {
        Args: {
          p_apply_promotions?: boolean
          p_invoice_number?: string
          p_invoice_photo_url?: string
          p_items: Json
          p_payment_method: string
          p_visit_id: string
        }
        Returns: Json
      }
      expire_user_roles: { Args: never; Returns: undefined }
      expire_user_roles_batch: {
        Args: { batch_size?: number }
        Returns: {
          execution_time_ms: number
          expired_count: number
          expired_role_ids: string[]
        }[]
      }
      expire_user_roles_manual: {
        Args: never
        Returns: {
          affected_tenants: number
          affected_users: number
          execution_time_ms: number
          total_expired: number
        }[]
      }
      generate_brand_competitor_public_id: { Args: never; Returns: string }
      generate_brand_public_id: { Args: never; Returns: string }
      generate_campaign_public_id: { Args: never; Returns: string }
      generate_client_assignment_public_id: { Args: never; Returns: string }
      generate_client_brand_membership_public_id: {
        Args: never
        Returns: string
      }
      generate_client_invoice_data_public_id: { Args: never; Returns: string }
      generate_client_public_id: { Args: never; Returns: string }
      generate_client_tier_assignment_public_id: {
        Args: never
        Returns: string
      }
      generate_client_type_public_id: { Args: never; Returns: string }
      generate_commercial_structure_public_id: { Args: never; Returns: string }
      generate_communication_plan_public_id: { Args: never; Returns: string }
      generate_distributor_public_id: { Args: never; Returns: string }
      generate_exhibition_public_id: { Args: never; Returns: string }
      generate_market_public_id: { Args: never; Returns: string }
      generate_order_item_public_id: { Args: never; Returns: string }
      generate_order_number: {
        Args: { brand_id: string; order_date: string }
        Returns: string
      }
      generate_order_public_id: { Args: never; Returns: string }
      generate_point_transaction_public_id: { Args: never; Returns: string }
      generate_points_transaction_public_id: { Args: never; Returns: string }
      generate_pop_material_public_id: { Args: never; Returns: string }
      generate_product_category_public_id: { Args: never; Returns: string }
      generate_product_public_id: { Args: never; Returns: string }
      generate_product_variant_public_id: { Args: never; Returns: string }
      generate_promotion_public_id: { Args: never; Returns: string }
      generate_promotion_redemption_public_id: { Args: never; Returns: string }
      generate_promotion_rule_public_id: { Args: never; Returns: string }
      generate_promotor_assignment_public_id: { Args: never; Returns: string }
      generate_promotor_client_assignment_public_id: {
        Args: never
        Returns: string
      }
      generate_public_id: { Args: { entity_type: string }; Returns: string }
      generate_qr_code: { Args: never; Returns: string }
      generate_redemption_code: { Args: never; Returns: string }
      generate_reward_public_id: { Args: never; Returns: string }
      generate_reward_redemption_public_id: { Args: never; Returns: string }
      generate_tenant_public_id: { Args: never; Returns: string }
      generate_tier_public_id: { Args: never; Returns: string }
      generate_user_profile_public_id: { Args: never; Returns: string }
      generate_visit_assessment_public_id: { Args: never; Returns: string }
      generate_visit_communication_plan_public_id: {
        Args: never
        Returns: string
      }
      generate_visit_evidence_public_id: { Args: never; Returns: string }
      generate_visit_inventory_public_id: { Args: never; Returns: string }
      generate_visit_order_item_public_id: { Args: never; Returns: string }
      generate_visit_order_public_id: { Args: never; Returns: string }
      generate_visit_public_id: { Args: never; Returns: string }
      generate_visit_stage_assessment_public_id: {
        Args: never
        Returns: string
      }
      generate_zone_public_id: { Args: never; Returns: string }
      get_admin_dashboard_metrics: {
        Args: { p_tenant_id: string }
        Returns: Json
      }
      get_applicable_promotions: {
        Args: {
          p_brand_id: string
          p_client_id: string
          p_purchase_amount?: number
        }
        Returns: {
          end_date: string
          estimated_discount: number
          is_applicable: boolean
          maximum_discount_amount: number
          minimum_purchase_amount: number
          promotion_code: string
          promotion_id: string
          promotion_name: string
          promotion_type: string
          promotion_value: number
          start_date: string
        }[]
      }
      get_brand_manager_brand_ids: { Args: never; Returns: string[] }
      get_client_ids_for_auth_user: { Args: never; Returns: string[] }
      get_current_tenant_id: { Args: never; Returns: string }
      get_field_user_tenant_id: { Args: never; Returns: string }
      get_next_order_item_line_number: {
        Args: { p_order_id: string }
        Returns: number
      }
      get_next_visit_order_item_line_number: {
        Args: { p_visit_order_id: string }
        Returns: number
      }
      get_promotor_profile_ids: { Args: never; Returns: string[] }
      get_role_expiration_stats: {
        Args: never
        Returns: {
          expires_in_hours: number
          role_count: number
          role_types: string[]
        }[]
      }
      get_role_system_health: {
        Args: never
        Returns: {
          active_roles: number
          avg_query_time_ms: number
          expired_roles: number
          roles_expiring_today: number
          total_roles: number
        }[]
      }
      get_supervised_profile_ids: { Args: never; Returns: string[] }
      get_tenant_admin_tenant_ids: { Args: never; Returns: string[] }
      get_user_profile_id: { Args: never; Returns: string }
      get_user_role_brand_ids: {
        Args: { p_role: Database["public"]["Enums"]["user_role_type_enum"] }
        Returns: string[]
      }
      get_user_tenant_ids: { Args: never; Returns: string[] }
      is_client_assigned_to_user: {
        Args: { p_client_id: string }
        Returns: boolean
      }
      is_global_admin: { Args: never; Returns: boolean }
      is_role_active: {
        Args: {
          deleted_at: string
          expires_at: string
          role_status: Database["public"]["Enums"]["user_role_status_enum"]
        }
        Returns: boolean
      }
      is_tenant_admin: { Args: never; Returns: boolean }
      redeem_qr_code: {
        Args: {
          p_distributor_id?: string
          p_latitude?: number
          p_longitude?: number
          p_notes?: string
          p_qr_code: string
          p_user_profile_id: string
        }
        Returns: {
          message: string
          qr_data: Json
          redemption_id: string
          success: boolean
        }[]
      }
      reset_public_id_sequence: {
        Args: { entity_type: string }
        Returns: undefined
      }
      update_visit_assessment: {
        Args: { p_assessment_data: Json; p_visit_id: string }
        Returns: Json
      }
      user_has_role: {
        Args: {
          brand_uuid?: string
          role_name: Database["public"]["Enums"]["user_role_type_enum"]
        }
        Returns: boolean
      }
      validate_public_id: {
        Args: { entity_type: string; public_id_value: string }
        Returns: boolean
      }
    }
    Enums: {
      assessment_type_enum:
        | "product"
        | "package"
        | "price"
        | "display"
        | "competition"
      audit_action_enum:
        | "create"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "failed_attempt"
      brand_status_enum: "active" | "inactive" | "draft"
      campaign_status_enum:
        | "draft"
        | "pending_approval"
        | "approved"
        | "active"
        | "paused"
        | "completed"
        | "cancelled"
      campaign_type_enum:
        | "product_launch"
        | "seasonal"
        | "promotional"
        | "awareness"
        | "loyalty"
        | "competitive"
        | "retention"
      client_approval_enum: "pending" | "approved" | "rejected" | "not_required"
      client_status_enum: "active" | "inactive" | "suspended" | "prospect"
      client_type_category_enum:
        | "retail"
        | "wholesale"
        | "institutional"
        | "online"
        | "hybrid"
      commercial_structure_type_enum:
        | "direct"
        | "distributor"
        | "wholesaler"
        | "retailer"
        | "hybrid"
      communication_current_status_enum:
        | "not_present"
        | "present_good"
        | "present_damaged"
        | "present_outdated"
        | "installed_today"
      communication_material_type_enum:
        | "poster"
        | "banner"
        | "wobbler"
        | "display"
        | "refrigerator"
        | "cooler"
        | "shelf_talker"
        | "floor_graphic"
        | "window_cling"
        | "promotional_stand"
      communication_planned_action_enum:
        | "install_new"
        | "replace_existing"
        | "repair"
        | "remove"
        | "relocate"
        | "no_action"
      compliance_level: "full" | "partial" | "non_compliant"
      count_accuracy_enum: "exact" | "estimated" | "partial"
      display_quality_enum: "excellent" | "good" | "fair" | "poor" | "none"
      evidence_stage_enum: "pricing" | "inventory" | "communication"
      evidence_type_enum:
        | "shelf_photo"
        | "price_tag"
        | "competitor_display"
        | "purchase_order"
        | "inventory_count"
        | "promotion_display"
        | "pop_material"
        | "exhibition"
        | "activity"
        | "general"
      execution_quality_enum: "excellent" | "good" | "fair" | "poor"
      location_in_store_enum:
        | "shelf"
        | "storage"
        | "display"
        | "refrigerator"
        | "freezer"
        | "counter"
      material_condition_enum: "good" | "damaged" | "missing"
      membership_status_enum:
        | "active"
        | "inactive"
        | "suspended"
        | "pending"
        | "rejected"
      notification_type_enum:
        | "promotion_approved"
        | "promotion_rejected"
        | "new_promotion"
        | "visit_completed"
        | "order_created"
        | "qr_redeemed"
        | "tier_upgrade"
        | "survey_assigned"
        | "system"
        | "survey_approved"
        | "survey_rejected"
        | "new_survey_pending"
        | "points_adjusted"
        | "assignment_changed"
        | "supervisor_changed"
        | "welcome"
        | "membership_pending"
        | "client_status_changed"
      order_item_status_enum:
        | "pending"
        | "confirmed"
        | "out_of_stock"
        | "substituted"
        | "delivered"
        | "returned"
      order_item_unit_type_enum: "pieza" | "kg" | "litro" | "caja" | "paquete"
      order_payment_method_enum:
        | "cash"
        | "transfer"
        | "credit"
        | "check"
        | "card"
        | "points"
      order_payment_status_enum:
        | "pending"
        | "paid"
        | "partial"
        | "failed"
        | "refunded"
      order_priority_enum: "low" | "normal" | "high" | "urgent"
      order_source_channel_enum:
        | "client_portal"
        | "mobile_app"
        | "whatsapp"
        | "phone"
        | "email"
        | "field_sales"
      order_status_enum:
        | "draft"
        | "submitted"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "completed"
        | "cancelled"
        | "returned"
      order_type_enum:
        | "standard"
        | "express"
        | "scheduled"
        | "recurring"
        | "sample"
      package_condition_enum: "excellent" | "good" | "fair" | "poor" | "damaged"
      points_source_type_enum:
        | "purchase"
        | "visit"
        | "campaign"
        | "referral"
        | "bonus"
        | "manual"
        | "expiration"
        | "redemption"
      points_transaction_type_enum:
        | "earned"
        | "redeemed"
        | "expired"
        | "adjusted"
        | "bonus"
        | "penalty"
        | "transferred"
      product_unit_type_enum: "pieza" | "kg" | "litro" | "caja" | "paquete"
      product_variant_size_unit_enum: "ml" | "g" | "kg" | "l" | "unidades"
      promotion_order_type_enum: "independent_order" | "visit_order"
      promotion_redemption_status_enum:
        | "applied"
        | "pending_validation"
        | "validated"
        | "rejected"
        | "reversed"
      promotion_rule_type_enum:
        | "zone"
        | "state"
        | "market_type"
        | "commercial_structure"
        | "client_type"
        | "specific_client"
        | "product"
        | "category"
        | "tier"
        | "custom"
      promotion_status_enum:
        | "draft"
        | "pending_approval"
        | "approved"
        | "active"
        | "paused"
        | "completed"
        | "cancelled"
      promotion_type_applied_enum:
        | "discount_percentage"
        | "discount_amount"
        | "buy_x_get_y"
        | "free_product"
        | "volume_discount"
        | "points_multiplier"
        | "tier_bonus"
      promotion_type_enum:
        | "discount_percentage"
        | "discount_amount"
        | "buy_x_get_y"
        | "free_product"
        | "volume_discount"
        | "tier_bonus"
        | "cashback"
        | "points_multiplier"
      promotor_experience_level_enum:
        | "trainee"
        | "junior"
        | "senior"
        | "expert"
        | "team_lead"
      promotor_specialization_enum:
        | "retail"
        | "wholesale"
        | "pharma"
        | "food_service"
        | "convenience"
        | "supermarket"
        | "general"
      qr_redemption_status_enum: "pending" | "completed" | "failed" | "reversed"
      qr_status_enum: "active" | "fully_redeemed" | "expired" | "cancelled"
      redemption_status_enum:
        | "pending"
        | "confirmed"
        | "applied"
        | "expired"
        | "cancelled"
      restock_priority_enum: "urgent" | "high" | "medium" | "low"
      reward_type_enum:
        | "discount_percentage"
        | "discount_amount"
        | "free_product"
        | "free_shipping"
        | "exclusive_access"
        | "service_upgrade"
        | "cashback"
        | "gift"
      rfc_person_type_enum: "fisica" | "moral"
      rotation_quality_enum: "excellent" | "good" | "fair" | "poor"
      shelf_position_enum:
        | "eye_level"
        | "top_shelf"
        | "middle_shelf"
        | "bottom_shelf"
        | "end_cap"
        | "floor_display"
      status: "active" | "inactive" | "suspended" | "pending_approval"
      stock_level_enum:
        | "out_of_stock"
        | "low"
        | "adequate"
        | "high"
        | "overstocked"
      stock_level_observed_enum: "out_of_stock" | "low" | "medium" | "high"
      subscription_plan: "base" | "pro" | "enterprise"
      survey_question_type_enum:
        | "text"
        | "number"
        | "multiple_choice"
        | "scale"
        | "yes_no"
        | "checkbox"
        | "ordered_list"
        | "percentage_distribution"
      survey_status_enum:
        | "draft"
        | "pending_approval"
        | "approved"
        | "active"
        | "closed"
        | "archived"
      survey_target_role_enum: "promotor" | "asesor_de_ventas" | "client"
      tenant_status_enum: "active" | "suspended" | "trial"
      tenant_subscription_plan_enum: "base" | "pro" | "enterprise"
      tier_assigned_by: "system" | "manual" | "external_sync"
      tier_assignment_type_enum:
        | "manual"
        | "automatic"
        | "initial"
        | "promotion"
        | "demotion"
        | "correction"
      tier_recalculation_frequency: "daily" | "weekly" | "monthly" | "manual"
      tier_system_type:
        | "points_based"
        | "purchase_based"
        | "manual"
        | "external_api"
      user_profile_status_enum: "active" | "inactive" | "suspended"
      user_role_scope_enum: "global" | "tenant" | "brand"
      user_role_status_enum: "active" | "inactive" | "suspended"
      user_role_type:
        | "admin"
        | "brand_manager"
        | "supervisor"
        | "advisor"
        | "market_analyst"
        | "client"
      user_role_type_enum:
        | "admin"
        | "brand_manager"
        | "supervisor"
        | "advisor"
        | "market_analyst"
        | "promotor"
        | "asesor_de_ventas"
      visit_order_item_delivery_preference_enum:
        | "immediate"
        | "scheduled"
        | "next_visit"
      visit_order_item_priority_enum: "low" | "normal" | "high" | "urgent"
      visit_order_item_source_enum:
        | "catalog"
        | "special_order"
        | "sample"
        | "demo"
      visit_order_item_unit_type_enum:
        | "pieza"
        | "kg"
        | "litro"
        | "caja"
        | "paquete"
      visit_order_payment_method_enum:
        | "cash"
        | "transfer"
        | "credit"
        | "check"
        | "card"
      visit_order_status_enum:
        | "draft"
        | "confirmed"
        | "processed"
        | "delivered"
        | "cancelled"
      visit_order_type_enum: "immediate" | "scheduled" | "quote" | "sample"
      visit_status_enum:
        | "planned"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      visit_type_enum: "scheduled" | "spontaneous" | "follow_up" | "emergency"
      visit_workflow_status_enum:
        | "assessment_pending"
        | "inventory_pending"
        | "purchase_pending"
        | "communication_pending"
        | "completed"
      why_not_buying_reason:
        | "lack_of_budget"
        | "low_turnover"
        | "sufficient_inventory"
        | "prefers_other_brand"
        | "distributor_issues"
        | "not_applicable"
      zone_type_enum:
        | "country"
        | "region"
        | "state"
        | "city"
        | "district"
        | "custom"
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
      assessment_type_enum: [
        "product",
        "package",
        "price",
        "display",
        "competition",
      ],
      audit_action_enum: [
        "create",
        "update",
        "delete",
        "login",
        "logout",
        "failed_attempt",
      ],
      brand_status_enum: ["active", "inactive", "draft"],
      campaign_status_enum: [
        "draft",
        "pending_approval",
        "approved",
        "active",
        "paused",
        "completed",
        "cancelled",
      ],
      campaign_type_enum: [
        "product_launch",
        "seasonal",
        "promotional",
        "awareness",
        "loyalty",
        "competitive",
        "retention",
      ],
      client_approval_enum: ["pending", "approved", "rejected", "not_required"],
      client_status_enum: ["active", "inactive", "suspended", "prospect"],
      client_type_category_enum: [
        "retail",
        "wholesale",
        "institutional",
        "online",
        "hybrid",
      ],
      commercial_structure_type_enum: [
        "direct",
        "distributor",
        "wholesaler",
        "retailer",
        "hybrid",
      ],
      communication_current_status_enum: [
        "not_present",
        "present_good",
        "present_damaged",
        "present_outdated",
        "installed_today",
      ],
      communication_material_type_enum: [
        "poster",
        "banner",
        "wobbler",
        "display",
        "refrigerator",
        "cooler",
        "shelf_talker",
        "floor_graphic",
        "window_cling",
        "promotional_stand",
      ],
      communication_planned_action_enum: [
        "install_new",
        "replace_existing",
        "repair",
        "remove",
        "relocate",
        "no_action",
      ],
      compliance_level: ["full", "partial", "non_compliant"],
      count_accuracy_enum: ["exact", "estimated", "partial"],
      display_quality_enum: ["excellent", "good", "fair", "poor", "none"],
      evidence_stage_enum: ["pricing", "inventory", "communication"],
      evidence_type_enum: [
        "shelf_photo",
        "price_tag",
        "competitor_display",
        "purchase_order",
        "inventory_count",
        "promotion_display",
        "pop_material",
        "exhibition",
        "activity",
        "general",
      ],
      execution_quality_enum: ["excellent", "good", "fair", "poor"],
      location_in_store_enum: [
        "shelf",
        "storage",
        "display",
        "refrigerator",
        "freezer",
        "counter",
      ],
      material_condition_enum: ["good", "damaged", "missing"],
      membership_status_enum: [
        "active",
        "inactive",
        "suspended",
        "pending",
        "rejected",
      ],
      notification_type_enum: [
        "promotion_approved",
        "promotion_rejected",
        "new_promotion",
        "visit_completed",
        "order_created",
        "qr_redeemed",
        "tier_upgrade",
        "survey_assigned",
        "system",
        "survey_approved",
        "survey_rejected",
        "new_survey_pending",
        "points_adjusted",
        "assignment_changed",
        "supervisor_changed",
        "welcome",
        "membership_pending",
        "client_status_changed",
      ],
      order_item_status_enum: [
        "pending",
        "confirmed",
        "out_of_stock",
        "substituted",
        "delivered",
        "returned",
      ],
      order_item_unit_type_enum: ["pieza", "kg", "litro", "caja", "paquete"],
      order_payment_method_enum: [
        "cash",
        "transfer",
        "credit",
        "check",
        "card",
        "points",
      ],
      order_payment_status_enum: [
        "pending",
        "paid",
        "partial",
        "failed",
        "refunded",
      ],
      order_priority_enum: ["low", "normal", "high", "urgent"],
      order_source_channel_enum: [
        "client_portal",
        "mobile_app",
        "whatsapp",
        "phone",
        "email",
        "field_sales",
      ],
      order_status_enum: [
        "draft",
        "submitted",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
        "returned",
      ],
      order_type_enum: [
        "standard",
        "express",
        "scheduled",
        "recurring",
        "sample",
      ],
      package_condition_enum: ["excellent", "good", "fair", "poor", "damaged"],
      points_source_type_enum: [
        "purchase",
        "visit",
        "campaign",
        "referral",
        "bonus",
        "manual",
        "expiration",
        "redemption",
      ],
      points_transaction_type_enum: [
        "earned",
        "redeemed",
        "expired",
        "adjusted",
        "bonus",
        "penalty",
        "transferred",
      ],
      product_unit_type_enum: ["pieza", "kg", "litro", "caja", "paquete"],
      product_variant_size_unit_enum: ["ml", "g", "kg", "l", "unidades"],
      promotion_order_type_enum: ["independent_order", "visit_order"],
      promotion_redemption_status_enum: [
        "applied",
        "pending_validation",
        "validated",
        "rejected",
        "reversed",
      ],
      promotion_rule_type_enum: [
        "zone",
        "state",
        "market_type",
        "commercial_structure",
        "client_type",
        "specific_client",
        "product",
        "category",
        "tier",
        "custom",
      ],
      promotion_status_enum: [
        "draft",
        "pending_approval",
        "approved",
        "active",
        "paused",
        "completed",
        "cancelled",
      ],
      promotion_type_applied_enum: [
        "discount_percentage",
        "discount_amount",
        "buy_x_get_y",
        "free_product",
        "volume_discount",
        "points_multiplier",
        "tier_bonus",
      ],
      promotion_type_enum: [
        "discount_percentage",
        "discount_amount",
        "buy_x_get_y",
        "free_product",
        "volume_discount",
        "tier_bonus",
        "cashback",
        "points_multiplier",
      ],
      promotor_experience_level_enum: [
        "trainee",
        "junior",
        "senior",
        "expert",
        "team_lead",
      ],
      promotor_specialization_enum: [
        "retail",
        "wholesale",
        "pharma",
        "food_service",
        "convenience",
        "supermarket",
        "general",
      ],
      qr_redemption_status_enum: ["pending", "completed", "failed", "reversed"],
      qr_status_enum: ["active", "fully_redeemed", "expired", "cancelled"],
      redemption_status_enum: [
        "pending",
        "confirmed",
        "applied",
        "expired",
        "cancelled",
      ],
      restock_priority_enum: ["urgent", "high", "medium", "low"],
      reward_type_enum: [
        "discount_percentage",
        "discount_amount",
        "free_product",
        "free_shipping",
        "exclusive_access",
        "service_upgrade",
        "cashback",
        "gift",
      ],
      rfc_person_type_enum: ["fisica", "moral"],
      rotation_quality_enum: ["excellent", "good", "fair", "poor"],
      shelf_position_enum: [
        "eye_level",
        "top_shelf",
        "middle_shelf",
        "bottom_shelf",
        "end_cap",
        "floor_display",
      ],
      status: ["active", "inactive", "suspended", "pending_approval"],
      stock_level_enum: [
        "out_of_stock",
        "low",
        "adequate",
        "high",
        "overstocked",
      ],
      stock_level_observed_enum: ["out_of_stock", "low", "medium", "high"],
      subscription_plan: ["base", "pro", "enterprise"],
      survey_question_type_enum: [
        "text",
        "number",
        "multiple_choice",
        "scale",
        "yes_no",
        "checkbox",
        "ordered_list",
        "percentage_distribution",
      ],
      survey_status_enum: [
        "draft",
        "pending_approval",
        "approved",
        "active",
        "closed",
        "archived",
      ],
      survey_target_role_enum: ["promotor", "asesor_de_ventas", "client"],
      tenant_status_enum: ["active", "suspended", "trial"],
      tenant_subscription_plan_enum: ["base", "pro", "enterprise"],
      tier_assigned_by: ["system", "manual", "external_sync"],
      tier_assignment_type_enum: [
        "manual",
        "automatic",
        "initial",
        "promotion",
        "demotion",
        "correction",
      ],
      tier_recalculation_frequency: ["daily", "weekly", "monthly", "manual"],
      tier_system_type: [
        "points_based",
        "purchase_based",
        "manual",
        "external_api",
      ],
      user_profile_status_enum: ["active", "inactive", "suspended"],
      user_role_scope_enum: ["global", "tenant", "brand"],
      user_role_status_enum: ["active", "inactive", "suspended"],
      user_role_type: [
        "admin",
        "brand_manager",
        "supervisor",
        "advisor",
        "market_analyst",
        "client",
      ],
      user_role_type_enum: [
        "admin",
        "brand_manager",
        "supervisor",
        "advisor",
        "market_analyst",
        "promotor",
        "asesor_de_ventas",
      ],
      visit_order_item_delivery_preference_enum: [
        "immediate",
        "scheduled",
        "next_visit",
      ],
      visit_order_item_priority_enum: ["low", "normal", "high", "urgent"],
      visit_order_item_source_enum: [
        "catalog",
        "special_order",
        "sample",
        "demo",
      ],
      visit_order_item_unit_type_enum: [
        "pieza",
        "kg",
        "litro",
        "caja",
        "paquete",
      ],
      visit_order_payment_method_enum: [
        "cash",
        "transfer",
        "credit",
        "check",
        "card",
      ],
      visit_order_status_enum: [
        "draft",
        "confirmed",
        "processed",
        "delivered",
        "cancelled",
      ],
      visit_order_type_enum: ["immediate", "scheduled", "quote", "sample"],
      visit_status_enum: [
        "planned",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      visit_type_enum: ["scheduled", "spontaneous", "follow_up", "emergency"],
      visit_workflow_status_enum: [
        "assessment_pending",
        "inventory_pending",
        "purchase_pending",
        "communication_pending",
        "completed",
      ],
      why_not_buying_reason: [
        "lack_of_budget",
        "low_turnover",
        "sufficient_inventory",
        "prefers_other_brand",
        "distributor_issues",
        "not_applicable",
      ],
      zone_type_enum: [
        "country",
        "region",
        "state",
        "city",
        "district",
        "custom",
      ],
    },
  },
} as const
