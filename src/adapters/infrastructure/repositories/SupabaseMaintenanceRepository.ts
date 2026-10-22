import { IMaintenanceRepository } from '../../../core/ports/IMaintenanceRepository.js';
import { MaintenanceRecord } from '../../../core/domain/MaintenanceRecord.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';

export class SupabaseMaintenanceRepository implements IMaintenanceRepository {
  private getClient() {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client unavailable. Check USE_MOCK_DB and credentials.');
    return client;
  }

  async findByTenant(tenantId: string): Promise<MaintenanceRecord[]> {
    const { data, error } = await this.getClient().from('maintenance_records').select('*').eq('tenant_id', tenantId);
    if (error) throw error;
    return (data || []).map(this.mapFromDb);
  }

  async findByVehicle(tenantId: string, vehicleId: string): Promise<MaintenanceRecord[]> {
    const { data, error } = await this.getClient().from('maintenance_records').select('*').eq('tenant_id', tenantId).eq('vehicle_id', vehicleId);
    if (error) throw error;
    return (data || []).map(this.mapFromDb);
  }

  async findById(tenantId: string, id: string): Promise<MaintenanceRecord | null> {
    const { data, error } = await this.getClient().from('maintenance_records').select('*').eq('tenant_id', tenantId).eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? this.mapFromDb(data) : null;
  }

  async create(record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRecord> {
    const { data, error } = await this.getClient().from('maintenance_records').insert({
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
    if (error) throw error;
    return this.mapFromDb(data);
  }

  async update(tenantId: string, id: string, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const dbPayload: any = {};
    if (updates.type !== undefined) dbPayload.type = updates.type;
    if (updates.status !== undefined) dbPayload.status = updates.status;
    if (updates.scheduledDate !== undefined) dbPayload.scheduled_date = updates.scheduledDate;
    if (updates.completedDate !== undefined) dbPayload.completed_date = updates.completedDate;
    if (updates.odometerAtServiceKm !== undefined) dbPayload.odometer_at_service_km = updates.odometerAtServiceKm;
    if (updates.costEur !== undefined) dbPayload.cost_eur = updates.costEur;
    if (updates.workshopName !== undefined) dbPayload.workshop_name = updates.workshopName;
    if (updates.notes !== undefined) dbPayload.notes = updates.notes;
    dbPayload.updated_at = new Date().toISOString();

    const { data, error } = await this.getClient().from('maintenance_records').update(dbPayload).eq('tenant_id', tenantId).eq('id', id).select().single();
    if (error) throw error;
    return this.mapFromDb(data);
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
      costEur: Number(row.cost_eur ?? 0),
      workshopName: row.workshop_name,
      notes: row.notes,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
