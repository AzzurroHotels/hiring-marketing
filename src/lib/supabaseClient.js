import { createClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../config';

export const hasSupabaseConfig =
  APP_CONFIG.supabaseUrl &&
  APP_CONFIG.supabaseUrl.includes('supabase.co') &&
  APP_CONFIG.supabaseAnonKey &&
  APP_CONFIG.supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

export const supabase = hasSupabaseConfig
  ? createClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabaseAnonKey)
  : null;
