export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: '14.5';
    };
    public: {
        Tables: {
            duelo: {
                Row: {
                    id: number;
                    jogo_id: number;
                    palpite_1_id: number;
                    palpite_2_id: number | null;
                };
                Insert: {
                    id?: never;
                    jogo_id: number;
                    palpite_1_id: number;
                    palpite_2_id?: number | null;
                };
                Update: {
                    id?: never;
                    jogo_id?: number;
                    palpite_1_id?: number;
                    palpite_2_id?: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'duelo_jogo_id_fkey';
                        columns: ['jogo_id'];
                        isOneToOne: false;
                        referencedRelation: 'jogo';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'duelo_palpite_1_id_fkey';
                        columns: ['palpite_1_id'];
                        isOneToOne: false;
                        referencedRelation: 'palpite';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'duelo_palpite_2_id_fkey';
                        columns: ['palpite_2_id'];
                        isOneToOne: false;
                        referencedRelation: 'palpite';
                        referencedColumns: ['id'];
                    },
                ];
            };
            jogo: {
                Row: {
                    casa_gol: number | null;
                    casa_id: number;
                    decisao: Database['public']['Enums']['jogo_decisao'] | null;
                    fora_gol: number | null;
                    fora_id: number;
                    id: number;
                    inicio: string;
                    status: Database['public']['Enums']['jogo_status'];
                };
                Insert: {
                    casa_gol?: number | null;
                    casa_id: number;
                    decisao?:
                        | Database['public']['Enums']['jogo_decisao']
                        | null;
                    fora_gol?: number | null;
                    fora_id: number;
                    id?: never;
                    inicio: string;
                    status?: Database['public']['Enums']['jogo_status'];
                };
                Update: {
                    casa_gol?: number | null;
                    casa_id?: number;
                    decisao?:
                        | Database['public']['Enums']['jogo_decisao']
                        | null;
                    fora_gol?: number | null;
                    fora_id?: number;
                    id?: never;
                    inicio?: string;
                    status?: Database['public']['Enums']['jogo_status'];
                };
                Relationships: [
                    {
                        foreignKeyName: 'jogo_casa_id_fkey';
                        columns: ['casa_id'];
                        isOneToOne: false;
                        referencedRelation: 'selecao';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'jogo_fora_id_fkey';
                        columns: ['fora_id'];
                        isOneToOne: false;
                        referencedRelation: 'selecao';
                        referencedColumns: ['id'];
                    },
                ];
            };
            palpite: {
                Row: {
                    casa_gol: number | null;
                    fora_gol: number | null;
                    id: number;
                    jogo_id: number;
                    tipo: Database['public']['Enums']['palpite_tipo'];
                    usuario_id: number;
                    vencedor: Database['public']['Enums']['vencedor_lado'];
                };
                Insert: {
                    casa_gol?: number | null;
                    fora_gol?: number | null;
                    id?: never;
                    jogo_id: number;
                    tipo: Database['public']['Enums']['palpite_tipo'];
                    usuario_id: number;
                    vencedor: Database['public']['Enums']['vencedor_lado'];
                };
                Update: {
                    casa_gol?: number | null;
                    fora_gol?: number | null;
                    id?: never;
                    jogo_id?: number;
                    tipo?: Database['public']['Enums']['palpite_tipo'];
                    usuario_id?: number;
                    vencedor?: Database['public']['Enums']['vencedor_lado'];
                };
                Relationships: [
                    {
                        foreignKeyName: 'palpite_jogo_id_fkey';
                        columns: ['jogo_id'];
                        isOneToOne: false;
                        referencedRelation: 'jogo';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'palpite_usuario_id_fkey';
                        columns: ['usuario_id'];
                        isOneToOne: false;
                        referencedRelation: 'perfil';
                        referencedColumns: ['id'];
                    },
                ];
            };
            perfil: {
                Row: {
                    email: string;
                    id: number;
                    nickname: string;
                    selecao_id: number | null;
                    telefone: string | null;
                };
                Insert: {
                    email: string;
                    id?: never;
                    nickname: string;
                    selecao_id?: number | null;
                    telefone?: string | null;
                };
                Update: {
                    email?: string;
                    id?: never;
                    nickname?: string;
                    selecao_id?: number | null;
                    telefone?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'perfil_selecao_id_fkey';
                        columns: ['selecao_id'];
                        isOneToOne: false;
                        referencedRelation: 'selecao';
                        referencedColumns: ['id'];
                    },
                ];
            };
            selecao: {
                Row: {
                    abreviacao: string;
                    id: number;
                    nome: string;
                    bandeira: string;
                };
                Insert: {
                    abreviacao: string;
                    id?: never;
                    nome: string;
                    bandeira: string;
                };
                Update: {
                    abreviacao?: string;
                    id?: never;
                    nome?: string;
                    bandeira?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            jogo_decisao: 'normal' | 'prorrogacao' | 'penaltis';
            jogo_status: 'por_vir' | 'ao_vivo' | 'finalizado';
            palpite_tipo: 'simples' | 'exato';
            vencedor_lado: 'casa' | 'fora' | 'empate';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
    keyof Database,
    'public'
>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
            DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] &
            DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
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
        | keyof DefaultSchema['Tables']
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
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
        | keyof DefaultSchema['Enums']
        | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
      ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema['CompositeTypes']
        | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
      ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    public: {
        Enums: {
            jogo_decisao: ['normal', 'prorrogacao', 'penaltis'],
            jogo_status: ['por_vir', 'ao_vivo', 'finalizado'],
            palpite_tipo: ['simples', 'exato'],
            vencedor_lado: ['casa', 'fora', 'empate'],
        },
    },
} as const;
