import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jylsaljthenattjwufqk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_JSbqJv3bT5Y17REjyztQ5w_yfYPKP2t';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
