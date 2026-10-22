import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const useMock = (process.env.USE_MOCK_DB || 'true').toLowerCase() === 'true';
  
  // Guard condition: Never connect to or execute requests against Supabase when USE_MOCK_DB is enabled
  if (useMock) {
    return null;
  }

  if (!clientInstance) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Supabase credentials missing while USE_MOCK_DB=false. Falling back to null.');
      return null;
    }

    clientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
  }

  return clientInstance;
}

let keepaliveClientInstance: SupabaseClient | null = null;

/**
 * Returns a dedicated lightweight client solely for the keepalive ping to prevent Supabase inactivity pausing.
 */
export function getSupabaseKeepaliveClient(): SupabaseClient | null {
  if (keepaliveClientInstance) return keepaliveClientInstance;
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseKey) return null;

  keepaliveClientInstance = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
  return keepaliveClientInstance;
}

