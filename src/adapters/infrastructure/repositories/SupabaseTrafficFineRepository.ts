import { ITrafficFineRepository } from '../../../core/ports/ITrafficFineRepository.js';
import { TrafficFine, FineStatus } from '../../../core/domain/TrafficFine.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';
import { JsonTrafficFineRepository } from './JsonTrafficFineRepository.js';

export class SupabaseTrafficFineRepository implements ITrafficFineRepository {
  private fallbackJsonRepo = new JsonTrafficFineRepository();

  private getClient() {
    return getSupabaseClient();
  }

  async findByTenant(tenantId: string): Promise<TrafficFine[]> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('traffic_fines').select('*').eq('tenant_id', tenantId);
        if (!error && data && data.length > 0) {
          return data.map(this.mapFromDb);
        }
      }
    } catch (err) {
      console.warn('[SupabaseTrafficFineRepository] findByTenant fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findByTenant(tenantId);
  }

  async findByVehicle(tenantId: string, vehicleId: string): Promise<TrafficFine[]> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('traffic_fines').select('*').eq('tenant_id', tenantId).eq('vehicle_id', vehicleId);
        if (!error && data && data.length > 0) {
          return data.map(this.mapFromDb);
        }
      }
    } catch (err) {
      console.warn('[SupabaseTrafficFineRepository] findByVehicle fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findByVehicle(tenantId, vehicleId);
  }

  async findById(tenantId: string, id: string): Promise<TrafficFine | null> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('traffic_fines').select('*').eq('tenant_id', tenantId).eq('id', id).maybeSingle();
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseTrafficFineRepository] findById fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findById(tenantId, id);
  }

  async create(fine: Omit<TrafficFine, 'id' | 'createdAt'>): Promise<TrafficFine> {
    try {
      const client = this.getClient();
      if (client) {
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
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseTrafficFineRepository] create fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.create(fine);
  }

  async updateStatus(tenantId: string, id: string, status: FineStatus): Promise<TrafficFine> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('traffic_fines').update({ status }).eq('tenant_id', tenantId).eq('id', id).select().single();
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseTrafficFineRepository] updateStatus fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.updateStatus(tenantId, id, status);
  }

  private mapFromDb(row: any): TrafficFine {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      vehicleId: row.vehicle_id,
      driverId: row.driver_id,
      date: row.date,
      reason: row.reason,
      amountEur: Number(row.amount_eur),
      status: row.status as FineStatus,
      fineReference: row.fine_reference,
      organism: row.organism,
      notes: row.notes,
      createdAt: row.created_at
    };
  }
}
