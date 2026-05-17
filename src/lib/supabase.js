import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cbanvzipzfmllexraiei.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYW52emlwemZtbGxleHJhaWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTA2MTAsImV4cCI6MjA5NDU2NjYxMH0.mPpEUZJ5m1cI0Ds-NlE7_EUB41oroPyvD1thnikthQc';

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
