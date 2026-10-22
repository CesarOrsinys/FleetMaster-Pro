import { ITrafficFineRepository } from '../../../core/ports/ITrafficFineRepository.js';
import { TrafficFine, FineStatus } from '../../../core/domain/TrafficFine.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';

export class SupabaseTrafficFineRepository implements ITrafficFineRepository {
  private getClient() {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client unavailable. Check USE_MOCK_DB and credentials.');
    return client;
  }

  async findByTenant(tenantId: string): Promise<TrafficFine[]> {
    const { data, error } = await this.getClient().from('traffic_fines').select('*').eq('tenant_id', tenantId);
    if (error) throw error;
    return (data || []).map(this.mapFromDb);
  }

  async findByVehicle(tenantId: string, vehicleId: string): Promise<TrafficFine[]> {
    const { data, error } = await this.getClient().from('traffic_fines').select('*').eq('tenant_id', tenantId).eq('vehicle_id', vehicleId);
    if (error) throw error;
    return (data || []).map(this.mapFromDb);
  }

  async findById(tenantId: string, id: string): Promise<TrafficFine | null> {
    const { data, error } = await this.getClient().from('traffic_fines').select('*').eq('tenant_id', tenantId).eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? this.mapFromDb(data) : null;
  }

  async create(fine: Omit<TrafficFine, 'id' | 'createdAt'>): Promise<TrafficFine> {
    const { data, error } = await this.getClient().from('traffic_fines').insert({
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
    if (error) throw error;
    return this.mapFromDb(data);
  }

  async updateStatus(tenantId: string, id: string, status: FineStatus): Promise<TrafficFine> {
    const { data, error } = await this.getClient().from('traffic_fines').update({ status }).eq('tenant_id', tenantId).eq('id', id).select().single();
    if (error) throw error;
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
      amountEur: Number(row.amount_eur ?? 0),
      status: row.status as FineStatus,
      fineReference: row.fine_reference,
      organism: row.organism,
      notes: row.notes,
      createdAt: row.created_at
    };
  }
}
