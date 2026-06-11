import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !anonKey) {
    throw new Error(
        'Missing VITE_PUBLIC_SUPABASE_URL or VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local',
    );
}

export const supabase = createClient<Database>(url, anonKey);
