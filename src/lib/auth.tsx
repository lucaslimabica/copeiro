import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

type Perfil = Tables<'perfil'>;

type AuthContextValue = {
    session: Session | null;
    user: User | null;
    perfil: Perfil | null;
    loading: boolean;
    signIn: (
        email: string,
        password: string,
    ) => Promise<{ error: AuthError | null }>;
    signUp: (
        email: string,
        password: string,
        nickname: string,
    ) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!session?.user) {
            setPerfil(null);
            return;
        }
        let active = true;
        supabase
            .from('perfil')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data }) => {
                if (active) setPerfil(data);
            });
        return () => {
            active = false;
        };
    }, [session?.user?.id]);

    const value: AuthContextValue = {
        session,
        user: session?.user ?? null,
        perfil,
        loading,
        signIn: async (email, password) => {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error };
        },
        signUp: async (email, password, nickname) => {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { nickname } },
            });
            return { error };
        },
        signOut: async () => {
            await supabase.auth.signOut();
        },
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
    return ctx;
}
