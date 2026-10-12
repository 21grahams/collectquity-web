export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      holds: {
        Row: {
          completed_at: string | null;
          cost_basis: number | null;
          created_at: string;
          id: number;
          kind: string;
          name: string;
          number: number | null;
          profit: number | null;
          sold_price: number | null;
          updated_at: string;
        };
        Insert: {
          completed_at?: string | null;
          cost_basis?: number | null;
          created_at?: string;
          id?: never;
          kind: string;
          name: string;
          number?: number | null;
          profit?: number | null;
          sold_price?: number | null;
          updated_at?: string;
        };
        Update: {
          completed_at?: string | null;
          cost_basis?: number | null;
          created_at?: string;
          id?: never;
          kind?: string;
          name?: string;
          number?: number | null;
          profit?: number | null;
          sold_price?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      market_links: {
        Row: {
          created_at: string;
          fetched_unit_value: number | null;
          graded_basis: string;
          id: number;
          last_run_at: string | null;
          last_status: string | null;
          long_term_unit_value: number | null;
          pinned: boolean;
          printing: string | null;
          product_name: string;
          recent_unit_value: number | null;
          sealed_item_id: number | null;
          single_id: number | null;
          tcgplayer_id: string;
          updated_at: string;
          market_value: number | null;
        };
        Insert: {
          created_at?: string;
          fetched_unit_value?: number | null;
          graded_basis?: string;
          id?: never;
          last_run_at?: string | null;
          last_status?: string | null;
          long_term_unit_value?: number | null;
          pinned?: boolean;
          printing?: string | null;
          product_name: string;
          recent_unit_value?: number | null;
          sealed_item_id?: number | null;
          single_id?: number | null;
          tcgplayer_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          fetched_unit_value?: number | null;
          graded_basis?: string;
          id?: never;
          last_run_at?: string | null;
          last_status?: string | null;
          long_term_unit_value?: number | null;
          pinned?: boolean;
          printing?: string | null;
          product_name?: string;
          recent_unit_value?: number | null;
          sealed_item_id?: number | null;
          single_id?: number | null;
          tcgplayer_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'market_links_sealed_item_id_fkey';
            columns: ['sealed_item_id'];
            isOneToOne: true;
            referencedRelation: 'sealed_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'market_links_single_id_fkey';
            columns: ['single_id'];
            isOneToOne: true;
            referencedRelation: 'singles';
            referencedColumns: ['id'];
          },
        ];
      };
      price_checks: {
        Row: {
          checked_on: string;
          created_at: string;
          id: number;
          sealed_item_id: number | null;
          single_id: number | null;
          unit_value: number;
        };
        Insert: {
          checked_on: string;
          created_at?: string;
          id?: never;
          sealed_item_id?: number | null;
          single_id?: number | null;
          unit_value: number;
        };
        Update: {
          checked_on?: string;
          created_at?: string;
          id?: never;
          sealed_item_id?: number | null;
          single_id?: number | null;
          unit_value?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'price_checks_sealed_item_id_fkey';
            columns: ['sealed_item_id'];
            isOneToOne: false;
            referencedRelation: 'sealed_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'price_checks_single_id_fkey';
            columns: ['single_id'];
            isOneToOne: false;
            referencedRelation: 'singles';
            referencedColumns: ['id'];
          },
        ];
      };
      processed_requests: {
        Row: {
          action: string;
          created_at: string;
          request_id: string;
          response: NonNullable<Json>;
        };
        Insert: {
          action: string;
          created_at?: string;
          request_id: string;
          response: NonNullable<Json>;
        };
        Update: {
          action?: string;
          created_at?: string;
          request_id?: string;
          response?: NonNullable<Json>;
        };
        Relationships: [];
      };
      retailer_accounts: {
        Row: {
          card_last2: string;
          created_at: string;
          deleted_at: string | null;
          email: string;
          id: number;
          label: string;
          loop: string;
          notes: string;
          phone_last4: string;
          retailer: string;
          updated_at: string;
        };
        Insert: {
          card_last2?: string;
          created_at?: string;
          deleted_at?: string | null;
          email?: string;
          id?: never;
          label: string;
          loop?: string;
          notes?: string;
          phone_last4?: string;
          retailer: string;
          updated_at?: string;
        };
        Update: {
          card_last2?: string;
          created_at?: string;
          deleted_at?: string | null;
          email?: string;
          id?: never;
          label?: string;
          loop?: string;
          notes?: string;
          phone_last4?: string;
          retailer?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sealed_items: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          fee_units: number;
          fees: number;
          hold_id: number;
          id: number;
          name: string;
          purchase_date: string | null;
          quantity: number;
          total_cost: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          fee_units?: number;
          fees?: number;
          hold_id: number;
          id?: never;
          name: string;
          purchase_date?: string | null;
          quantity: number;
          total_cost?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          fee_units?: number;
          fees?: number;
          hold_id?: number;
          id?: never;
          name?: string;
          purchase_date?: string | null;
          quantity?: number;
          total_cost?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sealed_items_hold_id_fkey';
            columns: ['hold_id'];
            isOneToOne: false;
            referencedRelation: 'holds';
            referencedColumns: ['id'];
          },
        ];
      };
      singles: {
        Row: {
          condition: string;
          created_at: string;
          deleted_at: string | null;
          extra: string;
          fee_units: number;
          fees: number;
          id: number;
          pokemon: string;
          purchase_date: string | null;
          quantity: number;
          set_name: string;
          total_cost: number;
          updated_at: string;
          single_display_name: string | null;
        };
        Insert: {
          condition?: string;
          created_at?: string;
          deleted_at?: string | null;
          extra?: string;
          fee_units?: number;
          fees?: number;
          id?: never;
          pokemon: string;
          purchase_date?: string | null;
          quantity: number;
          set_name?: string;
          total_cost?: number;
          updated_at?: string;
        };
        Update: {
          condition?: string;
          created_at?: string;
          deleted_at?: string | null;
          extra?: string;
          fee_units?: number;
          fees?: number;
          id?: never;
          pokemon?: string;
          purchase_date?: string | null;
          quantity?: number;
          set_name?: string;
          total_cost?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      sold_log: {
        Row: {
          category: string;
          cost_basis: number;
          created_at: string;
          id: number;
          is_legacy_adjustment: boolean;
          item_name: string;
          profit: number;
          quantity: number;
          sales_count: number;
          sealed_item_id: number | null;
          single_id: number | null;
          sold_at: string;
          sold_price: number;
        };
        Insert: {
          category: string;
          cost_basis: number;
          created_at?: string;
          id?: never;
          is_legacy_adjustment?: boolean;
          item_name: string;
          profit: number;
          quantity: number;
          sales_count?: number;
          sealed_item_id?: number | null;
          single_id?: number | null;
          sold_at?: string;
          sold_price: number;
        };
        Update: {
          category?: string;
          cost_basis?: number;
          created_at?: string;
          id?: never;
          is_legacy_adjustment?: boolean;
          item_name?: string;
          profit?: number;
          quantity?: number;
          sales_count?: number;
          sealed_item_id?: number | null;
          single_id?: number | null;
          sold_at?: string;
          sold_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'sold_log_sealed_item_id_fkey';
            columns: ['sealed_item_id'];
            isOneToOne: false;
            referencedRelation: 'sealed_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sold_log_single_id_fkey';
            columns: ['single_id'];
            isOneToOne: false;
            referencedRelation: 'singles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_account: {
        Args: {
          p_card_last2: string;
          p_email: string;
          p_label: string;
          p_loop: string;
          p_notes: string;
          p_phone_last4: string;
          p_retailer: string;
        };
        Returns: number;
      };
      add_sealed: {
        Args: {
          p_base_cost: number;
          p_fee_units: number;
          p_fees: number;
          p_hold: string;
          p_name: string;
          p_purchase_date: string;
          p_quantity: number;
          p_unit_value: number;
        };
        Returns: number;
      };
      add_single: {
        Args: {
          p_base_cost: number;
          p_condition: string;
          p_extra: string;
          p_fee_units: number;
          p_fees: number;
          p_pokemon: string;
          p_purchase_date: string;
          p_quantity: number;
          p_set_name: string;
          p_unit_value: number;
        };
        Returns: number;
      };
      adopt_price: { Args: { p_source: number; p_target: number }; Returns: undefined };
      api_add_account: {
        Args: {
          p_card_last2: string;
          p_email: string;
          p_label: string;
          p_loop: string;
          p_notes: string;
          p_phone_last4: string;
          p_request_id: string;
          p_retailer: string;
        };
        Returns: number;
      };
      api_add_sealed: {
        Args: {
          p_base_cost: number;
          p_fee_units: number;
          p_fees: number;
          p_hold: string;
          p_name: string;
          p_purchase_date: string;
          p_quantity: number;
          p_request_id: string;
          p_unit_value: number;
        };
        Returns: number;
      };
      api_add_single: {
        Args: {
          p_base_cost: number;
          p_condition: string;
          p_extra: string;
          p_fee_units: number;
          p_fees: number;
          p_pokemon: string;
          p_purchase_date: string;
          p_quantity: number;
          p_request_id: string;
          p_set_name: string;
          p_unit_value: number;
        };
        Returns: number;
      };
      api_complete_short_hold: {
        Args: { p_profit: number; p_request_id: string; p_sold_price: number };
        Returns: string;
      };
      api_delete_account: { Args: { p_id: number; p_request_id: string }; Returns: undefined };
      api_delete_sealed: { Args: { p_id: number; p_request_id: string }; Returns: undefined };
      api_delete_single: { Args: { p_id: number; p_request_id: string }; Returns: undefined };
      api_edit_account: {
        Args: {
          p_card_last2: string;
          p_email: string;
          p_id: number;
          p_label: string;
          p_loop: string;
          p_notes: string;
          p_phone_last4: string;
          p_request_id: string;
        };
        Returns: undefined;
      };
      api_edit_sealed: {
        Args: {
          p_base_cost: number;
          p_fee_units: number;
          p_fees: number;
          p_id: number;
          p_name: string;
          p_purchase_date: string;
          p_quantity: number;
          p_request_id: string;
          p_unit_value: number;
        };
        Returns: undefined;
      };
      api_edit_single: {
        Args: {
          p_base_cost: number;
          p_condition: string;
          p_extra: string;
          p_fee_units: number;
          p_fees: number;
          p_id: number;
          p_pokemon: string;
          p_purchase_date: string;
          p_quantity: number;
          p_request_id: string;
          p_set_name: string;
          p_unit_value: number;
        };
        Returns: undefined;
      };
      api_get_context: {
        Args: Record<PropertyKey, never>;
        Returns: {
          current_short_hold_id: number;
          current_short_hold_name: string;
          quarter: number;
          today: string;
          year: number;
        }[];
      };
      api_get_summary: {
        Args: Record<PropertyKey, never>;
        Returns: {
          completed_hold_count: number;
          completed_holds_profit: number;
          current_short_exit_80: number;
          current_short_gain: number;
          current_short_name: string;
          current_short_profit_80: number;
          current_short_spent: number;
          current_short_value: number;
          long_hold_exit_80: number;
          long_hold_gain: number;
          long_hold_has_sales: boolean;
          long_hold_profit_80: number;
          long_hold_sold_margin: number;
          long_hold_sold_markup: number;
          long_hold_sold_price: number;
          long_hold_sold_profit: number;
          long_hold_spent: number;
          long_hold_value: number;
          portfolio_exit_80: number;
          portfolio_gain: number;
          portfolio_profit_80: number;
          portfolio_spent: number;
          portfolio_value: number;
          singles_exit_80: number;
          singles_gain: number;
          singles_has_sales: boolean;
          singles_profit_80: number;
          singles_sold_margin: number;
          singles_sold_markup: number;
          singles_sold_price: number;
          singles_sold_profit: number;
          singles_spent: number;
          singles_value: number;
          total_realized_profit: number;
        }[];
      };
      api_list_accounts: {
        Args: Record<PropertyKey, never>;
        Returns: {
          card_last2: string;
          email: string;
          id: number;
          label: string;
          loop: string;
          notes: string;
          phone_last4: string;
          retailer: string;
        }[];
      };
      api_list_completed_holds: {
        Args: Record<PropertyKey, never>;
        Returns: {
          completed_at: string;
          cost_basis: number;
          id: number;
          margin: number;
          markup: number;
          name: string;
          number: number;
          profit: number;
          sold_price: number;
        }[];
      };
      api_list_market_links: {
        Args: Record<PropertyKey, never>;
        Returns: {
          graded_basis: string;
          last_run_at: string;
          last_status: string;
          long_term_unit_value: number;
          pinned: boolean;
          product_name: string;
          recent_unit_value: number;
          sealed_item_id: number;
          single_id: number;
        }[];
      };
      api_list_sealed: {
        Args: Record<PropertyKey, never>;
        Returns: {
          fee_units: number;
          fees: number;
          hold_id: number;
          hold_name: string;
          hold_number: number;
          hold_status: string;
          id: number;
          name: string;
          purchase_date: string;
          q1_unit_value: number;
          q2_unit_value: number;
          q3_unit_value: number;
          q4_unit_value: number;
          quantity: number;
          total_cost: number;
          unit_value: number;
        }[];
      };
      api_list_singles: {
        Args: Record<PropertyKey, never>;
        Returns: {
          condition: string;
          display_name: string;
          extra: string;
          fee_units: number;
          fees: number;
          id: number;
          pokemon: string;
          purchase_date: string;
          q1_unit_value: number;
          q2_unit_value: number;
          q3_unit_value: number;
          q4_unit_value: number;
          quantity: number;
          set_name: string;
          total_cost: number;
          unit_value: number;
        }[];
      };
      api_move_sealed: { Args: { p_id: number; p_quantity: number; p_request_id: string }; Returns: string };
      api_sell_long_hold_item: {
        Args: {
          p_id: number;
          p_profit: number;
          p_quantity: number;
          p_request_id: string;
          p_sold_price: number;
        };
        Returns: undefined;
      };
      api_sell_single: {
        Args: {
          p_id: number;
          p_profit: number;
          p_quantity: number;
          p_request_id: string;
          p_sold_price: number;
        };
        Returns: undefined;
      };
      api_set_market_link: {
        Args: {
          p_graded_basis: string;
          p_pinned: boolean;
          p_request_id: string;
          p_sealed_item_id: number;
          p_single_id: number;
        };
        Returns: undefined;
      };
      api_set_quarter_price: {
        Args: {
          p_quarter: number;
          p_request_id: string;
          p_sealed_item_id: number;
          p_single_id: number;
          p_unit_value: number;
        };
        Returns: undefined;
      };
      app_timezone: { Args: Record<PropertyKey, never>; Returns: string };
      app_today: { Args: Record<PropertyKey, never>; Returns: string };
      complete_short_hold: { Args: { p_profit: number; p_sold_price: number }; Returns: string };
      copy_market_link: { Args: { p_source: number; p_target: number }; Returns: undefined };
      delete_account: { Args: { p_id: number }; Returns: undefined };
      delete_sealed: { Args: { p_id: number }; Returns: undefined };
      delete_single: { Args: { p_id: number }; Returns: undefined };
      edit_account: {
        Args: {
          p_card_last2: string;
          p_email: string;
          p_id: number;
          p_label: string;
          p_loop: string;
          p_notes: string;
          p_phone_last4: string;
        };
        Returns: undefined;
      };
      edit_sealed: {
        Args: {
          p_base_cost: number;
          p_fee_units: number;
          p_fees: number;
          p_id: number;
          p_name: string;
          p_purchase_date: string;
          p_quantity: number;
          p_unit_value: number;
        };
        Returns: undefined;
      };
      edit_single: {
        Args: {
          p_base_cost: number;
          p_condition: string;
          p_extra: string;
          p_fee_units: number;
          p_fees: number;
          p_id: number;
          p_pokemon: string;
          p_purchase_date: string;
          p_quantity: number;
          p_set_name: string;
          p_unit_value: number;
        };
        Returns: undefined;
      };
      ensure_active_short_hold: {
        Args: Record<PropertyKey, never>;
        Returns: {
          completed_at: string | null;
          cost_basis: number | null;
          created_at: string;
          id: number;
          kind: string;
          name: string;
          number: number | null;
          profit: number | null;
          sold_price: number | null;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'holds';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      is_app_user: { Args: Record<PropertyKey, never>; Returns: boolean };
      latest_unit_value: {
        Args: { p_from?: string; p_sealed_item_id: number; p_single_id: number; p_to?: string };
        Returns: number;
      };
      long_hold_id: { Args: Record<PropertyKey, never>; Returns: number };
      market_job_secrets: { Args: Record<PropertyKey, never>; Returns: Json };
      market_links_to_refresh: {
        Args: Record<PropertyKey, never>;
        Returns: {
          condition: string;
          kind: string;
          link_id: number;
          printing: string;
          tcgplayer_id: string;
        }[];
      };
      market_value: { Args: { l: Database['public']['Tables']['market_links']['Row'] }; Returns: number };
      move_sealed: { Args: { p_id: number; p_quantity: number }; Returns: string };
      pin_market_link: { Args: { p_sealed_item_id: number; p_single_id: number }; Returns: undefined };
      quarter_end: { Args: { p_quarter: number; p_year: number }; Returns: string };
      quarter_of: { Args: { p_date: string }; Returns: number };
      quarter_start: { Args: { p_quarter: number; p_year: number }; Returns: string };
      record_market_prices: { Args: { p_results: Json }; Returns: number };
      request_record: {
        Args: { p_action: string; p_request_id: string; p_result?: Json };
        Returns: undefined;
      };
      request_replay: { Args: { p_request_id: string }; Returns: Json };
      sealed_name_key: { Args: { p_name: string }; Returns: string };
      sealed_twin: {
        Args: { p_except: number; p_hold_id: number; p_name: string };
        Returns: {
          created_at: string;
          deleted_at: string | null;
          fee_units: number;
          fees: number;
          hold_id: number;
          id: number;
          name: string;
          purchase_date: string | null;
          quantity: number;
          total_cost: number;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'sealed_items';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      sell_long_hold_item: {
        Args: { p_id: number; p_profit: number; p_quantity: number; p_sold_price: number };
        Returns: undefined;
      };
      sell_single: {
        Args: { p_id: number; p_profit: number; p_quantity: number; p_sold_price: number };
        Returns: undefined;
      };
      set_quarter_price: {
        Args: { p_quarter: number; p_sealed_item_id: number; p_single_id: number; p_unit_value: number };
        Returns: undefined;
      };
      short_hold_name: { Args: { p_number: number }; Returns: string };
      single_display_name: { Args: { s: Database['public']['Tables']['singles']['Row'] }; Returns: string };
      stale_item_message: { Args: Record<PropertyKey, never>; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    keyof (DefaultSchema['Tables'] & DefaultSchema['Views']) | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
