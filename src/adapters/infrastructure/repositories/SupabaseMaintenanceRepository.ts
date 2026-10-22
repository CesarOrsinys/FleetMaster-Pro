import { IMaintenanceRepository } from '../../../core/ports/IMaintenanceRepository.js';
import { MaintenanceRecord } from '../../../core/domain/MaintenanceRecord.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';
import { JsonMaintenanceRepository } from './JsonMaintenanceRepository.js';

export class SupabaseMaintenanceRepository implements IMaintenanceRepository {
  private fallbackJsonRepo = new JsonMaintenanceRepository();

  private getClient() {
    return getSupabaseClient();
  }

  async findByTenant(tenantId: string): Promise<MaintenanceRecord[]> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('maintenance_records').select('*').eq('tenant_id', tenantId);
        if (!error && data && data.length > 0) {
          return data.map(this.mapFromDb);
        }
      }
    } catch (err) {
      console.warn('[SupabaseMaintenanceRepository] findByTenant fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findByTenant(tenantId);
  }

  async findByVehicle(tenantId: string, vehicleId: string): Promise<MaintenanceRecord[]> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('maintenance_records').select('*').eq('tenant_id', tenantId).eq('vehicle_id', vehicleId);
        if (!error && data && data.length > 0) {
          return data.map(this.mapFromDb);
        }
      }
    } catch (err) {
      console.warn('[SupabaseMaintenanceRepository] findByVehicle fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findByVehicle(tenantId, vehicleId);
  }

  async findById(tenantId: string, id: string): Promise<MaintenanceRecord | null> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('maintenance_records').select('*').eq('tenant_id', tenantId).eq('id', id).maybeSingle();
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseMaintenanceRepository] findById fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findById(tenantId, id);
  }

  async create(record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRecord> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('maintenance_records').insert({
          tenant_id: record.tenantId,
          vehicle_id: record.vehicleId,
          type: record.type,
          status: record.status,
          scheduled_date: record.scheduledDate,
          completed_date: record.completedDate,
          odometer_at_service_km: record.odometerAtServiceKm,
          cost_eur: record.costEur,
          workshop_name: record.workshopName,
          notes: record.notes,
          created_by: record.createdBy
        }).select().single();
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseMaintenanceRepository] create fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.create(record);
  }

  async update(tenantId: string, id: string, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    try {
      const client = this.getClient();
      if (client) {
        const dbPayload: any = {};
        if (updates.type !== undefined) dbPayload.type = updates.type;
        if (updates.status !== undefined) dbPayload.status = updates.status;
        if (updates.scheduledDate !== undefined) dbPayload.scheduled_date = updates.scheduledDate;
        if (updates.completedDate !== undefined) dbPayload.completed_date = updates.completedDate;
        if (updates.odometerAtServiceKm !== undefined) dbPayload.odometer_at_service_km = updates.odometerAtServiceKm;
        if (updates.costEur !== undefined) dbPayload.cost_eur = updates.costEur;
        if (updates.workshopName !== undefined) dbPayload.workshop_name = updates.workshopName;
        if (updates.notes !== undefined) dbPayload.notes = updates.notes;

        const { data, error } = await client.from('maintenance_records').update(dbPayload).eq('tenant_id', tenantId).eq('id', id).select().single();
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseMaintenanceRepository] update fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.update(tenantId, id, updates);
  }

  private mapFromDb(row: any): MaintenanceRecord {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      vehicleId: row.vehicle_id,
      type: row.type,
      status: row.status,
      scheduledDate: row.scheduled_date,
      completedDate: row.completed_date,
      odometerAtServiceKm: row.odometer_at_service_km,
      costEur: Number(row.cost_eur),
      workshopName: row.workshop_name,
      notes: row.notes,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
