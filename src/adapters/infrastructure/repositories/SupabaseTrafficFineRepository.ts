import { ITrafficFineRepository } from '../../../core/ports/ITrafficFineRepository.js';
import { TrafficFine, FineStatus } from '../../../core/domain/TrafficFine.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';

export class SupabaseTrafficFineRepository implements ITrafficFineRepository {
  private getClient() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY.');
    }
    return client;
  }

  async findByTenant(tenantId: string): Promise<TrafficFine[]> {
    const client = this.getClient();
    const { data, error } = await client.from('traffic_fines').select('*').eq('tenant_id', tenantId).order('date', { ascending: false });
    if (error) {
      console.error('[SupabaseTrafficFineRepository] findByTenant error:', error.message);
      return [];
    }
    return (data || []).map(this.mapFromDb);
  }

  async findByVehicle(tenantId: string, vehicleId: string): Promise<TrafficFine[]> {
    const client = this.getClient();
    const { data, error } = await client.from('traffic_fines').select('*').eq('tenant_id', tenantId).eq('vehicle_id', vehicleId).order('date', { ascending: false });
    if (error) {
      console.error('[SupabaseTrafficFineRepository] findByVehicle error:', error.message);
      return [];
    }
    return (data || []).map(this.mapFromDb);
  }

  async findById(tenantId: string, id: string): Promise<TrafficFine | null> {
    const client = this.getClient();
    const { data, error } = await client.from('traffic_fines').select('*').eq('tenant_id', tenantId).eq('id', id).maybeSingle();
    if (error) {
      console.error('[SupabaseTrafficFineRepository] findById error:', error.message);
      return null;
    }
    return data ? this.mapFromDb(data) : null;
  }

  async create(fine: Omit<TrafficFine, 'id' | 'createdAt'>): Promise<TrafficFine> {
    const client = this.getClient();
    const { data, error } = await client.from('traffic_fines').insert({
      tenant_id: fine.tenantId,
      vehicle_id: fine.vehicleId,
      driver_id: fine.driverId,
      date: fine.date,
      reason: fine.reason,
      amount_eur: fine.amountEur,
      status: fine.status,
      fine_reference: fine.fineReference,
      organism: fine.organism,
      notes: fine.notes
    }).select().single();

    if (error || !data) {
      throw new Error(`Failed to create traffic fine: ${error?.message}`);
    }
    return this.mapFromDb(data);
  }

  async updateStatus(tenantId: string, id: string, status: FineStatus): Promise<TrafficFine> {
    const client = this.getClient();
    const { data, error } = await client.from('traffic_fines').update({ status }).eq('tenant_id', tenantId).eq('id', id).select().single();
    if (error || !data) {
      throw new Error(`Failed to update fine status: ${error?.message}`);
    }
    return this.mapFromDb(data);
  }

  private mapFromDb(row: any): TrafficFine {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      vehicleId: row.vehicle_id,
      driverId: row.driver_id,
      date: row.date,
      reason: row.reason,
      amountEur: Number(row.amount_eur || 0),
      status: row.status,
      fineReference: row.fine_reference,
      organism: row.organism,
      notes: row.notes,
      createdAt: row.created_at
    };
  }
}
