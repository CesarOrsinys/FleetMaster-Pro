import { IVehicleRepository } from '../../../core/ports/IVehicleRepository.js';
import { Vehicle } from '../../../core/domain/Vehicle.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';

export class SupabaseVehicleRepository implements IVehicleRepository {
  private getClient() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY.');
    }
    return client;
  }

  async findByTenant(tenantId: string): Promise<Vehicle[]> {
    const client = this.getClient();
    const { data, error } = await client.from('vehicles').select('*').eq('tenant_id', tenantId).order('license_plate', { ascending: true });
    if (error) {
      console.error('[SupabaseVehicleRepository] findByTenant error:', error.message);
      return [];
    }
    return (data || []).map(this.mapFromDb);
  }

  async findById(tenantId: string, id: string): Promise<Vehicle | null> {
    const client = this.getClient();
    const { data, error } = await client.from('vehicles').select('*').eq('tenant_id', tenantId).eq('id', id).maybeSingle();
    if (error) {
      console.error('[SupabaseVehicleRepository] findById error:', error.message);
      return null;
    }
    return data ? this.mapFromDb(data) : null;
  }

  async findByPlate(tenantId: string, plate: string): Promise<Vehicle | null> {
    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    const client = this.getClient();
    const { data, error } = await client.from('vehicles').select('*').eq('tenant_id', tenantId).ilike('license_plate', cleanPlate).maybeSingle();
    if (error) {
      console.error('[SupabaseVehicleRepository] findByPlate error:', error.message);
      return null;
    }
    return data ? this.mapFromDb(data) : null;
  }

  async create(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const client = this.getClient();
    const { data, error } = await client.from('vehicles').insert({
      tenant_id: vehicle.tenantId,
      license_plate: vehicle.licensePlate.toUpperCase(),
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      fuel_type: vehicle.fuelType,
      current_odometer_km: vehicle.currentOdometerKm,
      status: vehicle.status,
      assigned_driver_id: vehicle.assignedDriverId || null,
      itv_expiration_date: vehicle.itvExpirationDate,
      next_maintenance_km: vehicle.nextMaintenanceKm,
      next_maintenance_date: vehicle.nextMaintenanceDate,
      notes: vehicle.notes
    }).select().single();

    if (error || !data) {
      throw new Error(`Failed to create vehicle: ${error?.message}`);
    }
    return this.mapFromDb(data);
  }

  async update(tenantId: string, id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const client = this.getClient();
    const dbPayload: any = {};
    if (updates.licensePlate !== undefined) dbPayload.license_plate = updates.licensePlate.toUpperCase();
    if (updates.make !== undefined) dbPayload.make = updates.make;
    if (updates.model !== undefined) dbPayload.model = updates.model;
    if (updates.year !== undefined) dbPayload.year = updates.year;
    if (updates.vin !== undefined) dbPayload.vin = updates.vin;
    if (updates.fuelType !== undefined) dbPayload.fuel_type = updates.fuelType;
    if (updates.currentOdometerKm !== undefined) dbPayload.current_odometer_km = updates.currentOdometerKm;
    if (updates.status !== undefined) dbPayload.status = updates.status;
    if (updates.assignedDriverId !== undefined) dbPayload.assigned_driver_id = updates.assignedDriverId || null;
    if (updates.itvExpirationDate !== undefined) dbPayload.itv_expiration_date = updates.itvExpirationDate;
    if (updates.nextMaintenanceKm !== undefined) dbPayload.next_maintenance_km = updates.nextMaintenanceKm;
    if (updates.nextMaintenanceDate !== undefined) dbPayload.next_maintenance_date = updates.nextMaintenanceDate;
    if (updates.notes !== undefined) dbPayload.notes = updates.notes;

    const { data, error } = await client.from('vehicles').update(dbPayload).eq('tenant_id', tenantId).eq('id', id).select().single();
    if (error || !data) {
      throw new Error(`Failed to update vehicle: ${error?.message}`);
    }
    return this.mapFromDb(data);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const client = this.getClient();
    const { error } = await client.from('vehicles').delete().eq('tenant_id', tenantId).eq('id', id);
    if (error) {
      console.error('[SupabaseVehicleRepository] delete error:', error.message);
      return false;
    }
    return true;
  }

  async updateOdometer(tenantId: string, id: string, newKm: number): Promise<void> {
    const client = this.getClient();
    const { error } = await client.from('vehicles').update({ current_odometer_km: newKm }).eq('tenant_id', tenantId).eq('id', id);
    if (error) {
      console.error('[SupabaseVehicleRepository] updateOdometer error:', error.message);
    }
  }

  async updateStatus(tenantId: string, id: string, status: Vehicle['status']): Promise<void> {
    const client = this.getClient();
    const { error } = await client.from('vehicles').update({ status }).eq('tenant_id', tenantId).eq('id', id);
    if (error) {
      console.error('[SupabaseVehicleRepository] updateStatus error:', error.message);
    }
  }

  private mapFromDb(row: any): Vehicle {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      licensePlate: row.license_plate,
      make: row.make,
      model: row.model,
      year: row.year,
      vin: row.vin,
      fuelType: row.fuel_type,
      currentOdometerKm: Number(row.current_odometer_km || 0),
      status: row.status,
      assignedDriverId: row.assigned_driver_id || undefined,
      itvExpirationDate: row.itv_expiration_date,
      nextMaintenanceKm: row.next_maintenance_km != null ? Number(row.next_maintenance_km) : 15000,
      nextMaintenanceDate: row.next_maintenance_date || undefined,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
