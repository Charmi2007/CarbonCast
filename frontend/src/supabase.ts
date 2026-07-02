import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://agnsyypllvhjyjiskkqe.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-Bn4UIomwztjGRyV4uAlcA_X2nwTtMu';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
