import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Service Key is not set in environment variables.');
}

// Create a single supabase client for interacting with your database using the service role key
export const supabase = createClient(supabaseUrl, supabaseKey);

