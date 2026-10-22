import { ITenantRepository } from '../../../core/ports/ITenantRepository.js';
import { IUserRepository } from '../../../core/ports/IUserRepository.js';
import { IVehicleRepository } from '../../../core/ports/IVehicleRepository.js';
import { IMaintenanceRepository } from '../../../core/ports/IMaintenanceRepository.js';
import { IFuelLogRepository } from '../../../core/ports/IFuelLogRepository.js';
import { ITrafficFineRepository } from '../../../core/ports/ITrafficFineRepository.js';

import { JsonTenantRepository } from '../repositories/JsonTenantRepository.js';
import { JsonUserRepository } from '../repositories/JsonUserRepository.js';
import { JsonVehicleRepository } from '../repositories/JsonVehicleRepository.js';
import { JsonMaintenanceRepository } from '../repositories/JsonMaintenanceRepository.js';
import { JsonFuelLogRepository } from '../repositories/JsonFuelLogRepository.js';
import { JsonTrafficFineRepository } from '../repositories/JsonTrafficFineRepository.js';

import { SupabaseTenantRepository } from '../repositories/SupabaseTenantRepository.js';
import { SupabaseUserRepository } from '../repositories/SupabaseUserRepository.js';
import { SupabaseVehicleRepository } from '../repositories/SupabaseVehicleRepository.js';
import { SupabaseMaintenanceRepository } from '../repositories/SupabaseMaintenanceRepository.js';
import { SupabaseFuelLogRepository } from '../repositories/SupabaseFuelLogRepository.js';
import { SupabaseTrafficFineRepository } from '../repositories/SupabaseTrafficFineRepository.js';

export class RepositoryContainer {
  private static tenantRepo: ITenantRepository | null = null;
  private static userRepo: IUserRepository | null = null;
  private static vehicleRepo: IVehicleRepository | null = null;
  private static maintenanceRepo: IMaintenanceRepository | null = null;
  private static fuelLogRepo: IFuelLogRepository | null = null;
  private static trafficFineRepo: ITrafficFineRepository | null = null;

  public static isMockMode(): boolean {
    return (process.env.USE_MOCK_DB || 'false').toLowerCase() === 'true';
  }

  public static getTenantRepository(): ITenantRepository {
    if (!this.tenantRepo) {
      this.tenantRepo = this.isMockMode() ? new JsonTenantRepository() : new SupabaseTenantRepository();
    }
    return this.tenantRepo;
  }

  public static getUserRepository(): IUserRepository {
    if (!this.userRepo) {
      this.userRepo = this.isMockMode() ? new JsonUserRepository() : new SupabaseUserRepository();
    }
    return this.userRepo;
  }

  public static getVehicleRepository(): IVehicleRepository {
    if (!this.vehicleRepo) {
      this.vehicleRepo = this.isMockMode() ? new JsonVehicleRepository() : new SupabaseVehicleRepository();
    }
    return this.vehicleRepo;
  }

  public static getMaintenanceRepository(): IMaintenanceRepository {
    if (!this.maintenanceRepo) {
      this.maintenanceRepo = this.isMockMode() ? new JsonMaintenanceRepository() : new SupabaseMaintenanceRepository();
    }
    return this.maintenanceRepo;
  }

  public static getFuelLogRepository(): IFuelLogRepository {
    if (!this.fuelLogRepo) {
      this.fuelLogRepo = this.isMockMode() ? new JsonFuelLogRepository() : new SupabaseFuelLogRepository();
    }
    return this.fuelLogRepo;
  }

  public static getTrafficFineRepository(): ITrafficFineRepository {
    if (!this.trafficFineRepo) {
      this.trafficFineRepo = this.isMockMode() ? new JsonTrafficFineRepository() : new SupabaseTrafficFineRepository();
    }
    return this.trafficFineRepo;
  }

  public static setOverrides(overrides: {
    tenantRepo?: ITenantRepository;
    userRepo?: IUserRepository;
    vehicleRepo?: IVehicleRepository;
    maintenanceRepo?: IMaintenanceRepository;
    fuelLogRepo?: IFuelLogRepository;
    trafficFineRepo?: ITrafficFineRepository;
  }): void {
    if (overrides.tenantRepo) this.tenantRepo = overrides.tenantRepo;
    if (overrides.userRepo) this.userRepo = overrides.userRepo;
    if (overrides.vehicleRepo) this.vehicleRepo = overrides.vehicleRepo;
    if (overrides.maintenanceRepo) this.maintenanceRepo = overrides.maintenanceRepo;
    if (overrides.fuelLogRepo) this.fuelLogRepo = overrides.fuelLogRepo;
    if (overrides.trafficFineRepo) this.trafficFineRepo = overrides.trafficFineRepo;
  }

  public static reset(): void {
    this.tenantRepo = null;
    this.userRepo = null;
    this.vehicleRepo = null;
    this.maintenanceRepo = null;
    this.fuelLogRepo = null;
    this.trafficFineRepo = null;
  }
}
