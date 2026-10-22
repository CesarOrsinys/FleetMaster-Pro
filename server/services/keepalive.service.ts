import { getSupabaseKeepaliveClient } from '../../src/adapters/infrastructure/services/SupabaseClient.js';

const KEEPALIVE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
let schedulerTimer: NodeJS.Timeout | null = null;

export interface KeepaliveResult {
  ok: boolean;
  project: string;
  timestamp: string;
  latencyMs: number;
  recordsCount?: number;
  error?: string;
  note?: string;
}

/**
 * Executes a minuscule query to Supabase solely to keep the project active and prevent pausing.
 * Runs strictly server-side without sending notices or alerts to the UI.
 */
export async function executeKeepalivePing(): Promise<KeepaliveResult> {
  const startTime = Date.now();
  try {
    const client = getSupabaseKeepaliveClient();
    if (!client) {
      const latencyMs = Date.now() - startTime;
      return {
        ok: true,
        project: 'FleetMaster-Pro',
        timestamp: new Date().toISOString(),
        latencyMs,
        error: 'Supabase credentials not configured'
      };
    }

    // Ultra-lightweight query: fetch 1 ID only from tenants
    const { data, error } = await client.from('tenants').select('id').limit(1);

    const latencyMs = Date.now() - startTime;
    if (error) {
      // Even if tables have not been created yet in SQL editor, Supabase API responded and inactivity timer is reset
      if (error.message.includes('Could not find the table') || (error as any).code === 'PGRST205') {
        console.log(`[Keepalive:FleetMaster-Pro] Ping reachable (${latencyMs}ms). Supabase kept active (tables pending schema.sql).`);
        return {
          ok: true,
          project: 'FleetMaster-Pro',
          timestamp: new Date().toISOString(),
          latencyMs,
          note: 'Supabase active and reachable. Tables pending execution in SQL editor.'
        };
      }

      console.warn(`[Keepalive:FleetMaster-Pro] Ping error after ${latencyMs}ms:`, error.message);
      return {
        ok: false,
        project: 'FleetMaster-Pro',
        timestamp: new Date().toISOString(),
        latencyMs,
        error: error.message
      };
    }

    console.log(`[Keepalive:FleetMaster-Pro] Ping successful (${latencyMs}ms). Supabase project kept active.`);
    return {
      ok: true,
      project: 'FleetMaster-Pro',
      timestamp: new Date().toISOString(),
      latencyMs,
      recordsCount: data?.length || 0
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    console.warn(`[Keepalive:FleetMaster-Pro] Ping exception after ${latencyMs}ms:`, err.message);
    return {
      ok: false,
      project: 'FleetMaster-Pro',
      timestamp: new Date().toISOString(),
      latencyMs,
      error: err.message || 'Unknown error'
    };
  }
}

/**
 * Starts recurring 1-hour background timer on the server.
 */
export function startKeepaliveScheduler(): void {
  if (schedulerTimer) return;

  // Run initial ping 10 seconds after server startup
  setTimeout(() => {
    executeKeepalivePing().catch(err => {
      console.warn('[Keepalive:FleetMaster-Pro] Initial ping failed:', err.message);
    });
  }, 10000);

  // Repeat every 1 hour
  schedulerTimer = setInterval(() => {
    executeKeepalivePing().catch(err => {
      console.warn('[Keepalive:FleetMaster-Pro] Recurring ping failed:', err.message);
    });
  }, KEEPALIVE_INTERVAL_MS);

  // Unref timer so it doesn't prevent graceful process exit
  if (schedulerTimer.unref) {
    schedulerTimer.unref();
  }

  console.log('⏰ [Keepalive:FleetMaster-Pro] Server-side keepalive scheduler active (every 1 hour).');
}
