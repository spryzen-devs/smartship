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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          company_id: string | null
          role: string
          name: string | null
          email: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          company_id?: string | null
          role?: string
          name?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string | null
          role?: string
          name?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      drivers: {
        Row: {
          created_at: string | null
          id: string
          license_number: string
          name: string
          phone: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          license_number: string
          name: string
          phone: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          license_number?: string
          name?: string
          phone?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shipments: {
        Row: {
          cargo_description: string | null
          created_at: string | null
          dest_lat: number
          dest_lng: number
          dest_name: string
          driver_id: string | null
          driver_name: string | null
          eta: string | null
          id: string
          origin_lat: number
          origin_lng: number
          origin_name: string
          priority: string | null
          status: string | null
          tracking_id: string
          updated_at: string | null
          vehicle_id: string | null
          vehicle_number: string | null
          route_coordinates: Json | null
          current_lat: number | null
          current_lng: number | null
          current_route_index: number | null
          source_warehouse_id: string | null
          destination_warehouse_id: string | null
          product_name: string | null
          product_quantity: number | null
        }
        Insert: {
          cargo_description?: string | null
          created_at?: string | null
          dest_lat: number
          dest_lng: number
          dest_name: string
          driver_id?: string | null
          driver_name?: string | null
          eta?: string | null
          id?: string
          origin_lat: number
          origin_lng: number
          origin_name: string
          priority?: string | null
          status?: string | null
          tracking_id: string
          updated_at?: string | null
          vehicle_id?: string | null
          vehicle_number?: string | null
          source_warehouse_id?: string | null
          destination_warehouse_id?: string | null
          product_name?: string | null
          product_quantity?: number | null
        }
        Update: {
          cargo_description?: string | null
          created_at?: string | null
          dest_lat?: number
          dest_lng?: number
          dest_name?: string
          driver_id?: string | null
          driver_name?: string | null
          eta?: string | null
          id?: string
          origin_lat?: number
          origin_lng?: number
          origin_name?: string
          priority?: string | null
          status?: string | null
          tracking_id?: string
          updated_at?: string | null
          vehicle_id?: string | null
          vehicle_number?: string | null
          route_coordinates?: Json | null
          current_lat?: number | null
          current_lng?: number | null
          current_route_index?: number | null
          source_warehouse_id?: string | null
          destination_warehouse_id?: string | null
          product_name?: string | null
          product_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_source_warehouse_id_fkey"
            columns: ["source_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_destination_warehouse_id_fkey"
            columns: ["destination_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
      }
      vehicles: {
        Row: {
          capacity: string
          created_at: string | null
          id: string
          status: string | null
          type: string
          updated_at: string | null
          vehicle_number: string
        }
        Insert: {
          capacity: string
          created_at?: string | null
          id?: string
          status?: string | null
          type: string
          updated_at?: string | null
          vehicle_number: string
        }
        Update: {
          capacity?: string
          created_at?: string | null
          id?: string
          status?: string | null
          type?: string
          updated_at?: string | null
          vehicle_number?: string
        }
        Relationships: []
      }
      tracking_logs: {
        Row: {
          id: string
          shipment_id: string | null
          latitude: number
          longitude: number
          timestamp: string | null
        }
        Insert: {
          id?: string
          shipment_id?: string | null
          latitude: number
          longitude: number
          timestamp?: string | null
        }
        Update: {
          id?: string
          shipment_id?: string | null
          latitude?: number
          longitude?: number
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_logs_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          }
        ]
      }
      warehouses: {
        Row: {
          id: string
          name: string
          location: string
          lat: number
          lng: number
          capacity: number
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          location: string
          lat: number
          lng: number
          capacity?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          location?: string
          lat?: number
          lng?: number
          capacity?: number
          created_at?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          warehouse_id: string | null
          product_name: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          id?: string
          warehouse_id?: string | null
          product_name: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          id?: string
          warehouse_id?: string | null
          product_name?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
      }
    }



    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
