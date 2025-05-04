import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is not set in environment variables.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Note: For server-side operations requiring admin privileges (like bypassing RLS for service tasks),
// you might need to create a separate client using the SUPABASE_SERVICE_ROLE_KEY.
// However, for user-based uploads respecting RLS, the anon key is usually sufficient
// when combined with user authentication tokens passed from the client-side or NextAuth session.

