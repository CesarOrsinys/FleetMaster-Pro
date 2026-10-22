import { IFuelLogRepository } from '../../../core/ports/IFuelLogRepository.js';
import { FuelLog } from '../../../core/domain/FuelLog.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';

export class SupabaseFuelLogRepository implements IFuelLogRepository {
  private getClient() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY.');
    }
    return client;
  }

  async findByTenant(tenantId: string): Promise<FuelLog[]> {
    const client = this.getClient();
    const { data, error } = await client.from('fuel_mileage_logs').select('*').eq('tenant_id', tenantId).order('date', { ascending: false });
    if (error) {
      console.error('[SupabaseFuelLogRepository] findByTenant error:', error.message);
      return [];
    }
    return (data || []).map(this.mapFromDb);
  }

  async findByVehicle(tenantId: string, vehicleId: string): Promise<FuelLog[]> {
    const client = this.getClient();
    const { data, error } = await client.from('fuel_mileage_logs').select('*').eq('tenant_id', tenantId).eq('vehicle_id', vehicleId).order('date', { ascending: false });
    if (error) {
      console.error('[SupabaseFuelLogRepository] findByVehicle error:', error.message);
      return [];
    }
    return (data || []).map(this.mapFromDb);
  }

  async create(log: Omit<FuelLog, 'id' | 'createdAt'>): Promise<FuelLog> {
    const client = this.getClient();
    const { data, error } = await client.from('fuel_mileage_logs').insert({
      tenant_id: log.tenantId,
      vehicle_id: log.vehicleId,
      driver_id: log.driverId,
      date: log.date,
      odometer_km: log.odometerKm,
      liters: log.liters,
      cost_eur: log.costEur,
      fuel_station: log.fuelStation,
      receipt_url: log.receiptUrl,
      notes: log.notes,
      full_tank: log.fullTank !== undefined && log.fullTank !== null ? log.fullTank : true
    }).select().single();

    if (error || !data) {
      throw new Error(`Failed to create fuel log: ${error?.message}`);
    }
    return this.mapFromDb(data);
  }

  private mapFromDb(row: any): FuelLog {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      vehicleId: row.vehicle_id,
      driverId: row.driver_id,
      date: row.date,
      odometerKm: Number(row.odometer_km || 0),
      liters: Number(row.liters || 0),
      costEur: Number(row.cost_eur || 0),
      fuelStation: row.fuel_station,
      receiptUrl: row.receipt_url,
      notes: row.notes,
      fullTank: row.full_tank ?? true,
      createdAt: row.created_at
    };
  }
}
