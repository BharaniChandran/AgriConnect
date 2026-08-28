import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qzblitdwibzwlzkasskp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YmxpdGR3aWJ6d2x6a2Fzc2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MDAxMjYsImV4cCI6MjEwMzM3NjEyNn0.sHunUgo79X86YD7TEooQ5XzIXSGfzEtIcp20PE7oC3c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
