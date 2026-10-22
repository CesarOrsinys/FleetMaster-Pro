import { IFuelLogRepository } from '../../../core/ports/IFuelLogRepository.js';
import { FuelLog } from '../../../core/domain/FuelLog.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';
import { JsonFuelLogRepository } from './JsonFuelLogRepository.js';

export class SupabaseFuelLogRepository implements IFuelLogRepository {
  private fallbackJsonRepo = new JsonFuelLogRepository();

  private getClient() {
    return getSupabaseClient();
  }

  async findByTenant(tenantId: string): Promise<FuelLog[]> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('fuel_mileage_logs').select('*').eq('tenant_id', tenantId);
        if (!error && data && data.length > 0) {
          return data.map(this.mapFromDb);
        }
      }
    } catch (err) {
      console.warn('[SupabaseFuelLogRepository] findByTenant fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findByTenant(tenantId);
  }

  async findByVehicle(tenantId: string, vehicleId: string): Promise<FuelLog[]> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('fuel_mileage_logs').select('*').eq('tenant_id', tenantId).eq('vehicle_id', vehicleId);
        if (!error && data && data.length > 0) {
          return data.map(this.mapFromDb);
        }
      }
    } catch (err) {
      console.warn('[SupabaseFuelLogRepository] findByVehicle fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findByVehicle(tenantId, vehicleId);
  }

  async create(log: Omit<FuelLog, 'id' | 'createdAt'>): Promise<FuelLog> {
    try {
      const client = this.getClient();
      if (client) {
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
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseFuelLogRepository] create fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.create(log);
  }

  private mapFromDb(row: any): FuelLog {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      vehicleId: row.vehicle_id,
      driverId: row.driver_id,
      date: row.date,
      odometerKm: row.odometer_km,
      liters: Number(row.liters),
      costEur: Number(row.cost_eur),
      fuelStation: row.fuel_station,
      receiptUrl: row.receipt_url,
      notes: row.notes,
      fullTank: row.full_tank ?? true,
      createdAt: row.created_at
    };
  }
}
