import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { TRANSLATIONS, SupportedLanguage, LanguageManager } from '../../src/ui/i18n/LanguageManager.js';
import { VehicleSchema } from '../../src/core/domain/Vehicle.js';
import { MaintenanceRecordSchema } from '../../src/core/domain/MaintenanceRecord.js';
import { FuelLogSchema } from '../../src/core/domain/FuelLog.js';
import { JsonVehicleRepository } from '../../src/adapters/infrastructure/repositories/JsonVehicleRepository.js';
import { RepositoryContainer } from '../../src/adapters/infrastructure/di/RepositoryContainer.js';
import { getSupabaseClient } from '../../src/adapters/infrastructure/services/SupabaseClient.js';
import { renderFlagHtml } from '../../src/core/flags.js';

describe('FleetMaster-Pro - Domain, Security & i18n Test Suite', () => {

  beforeEach(() => {
    RepositoryContainer.reset();
  });

  describe('1. Strict i18n & Zero Hardcoded Strings (Kickoff Section 2.3 & 3.2)', () => {
    it('Should verify 100% key parity across all 3 supported languages (va, es, en)', () => {
      const languages: SupportedLanguage[] = ['va', 'es', 'en'];
      const vaKeys = Object.keys(TRANSLATIONS['va']).sort();
      const esKeys = Object.keys(TRANSLATIONS['es']).sort();
      const enKeys = Object.keys(TRANSLATIONS['en']).sort();

      assert.strictEqual(vaKeys.length > 20, true, 'Translations must contain comprehensive localized strings');
      assert.deepStrictEqual(vaKeys, esKeys, 'Valencian (va) and Spanish (es) must have identical translation keys');
      assert.deepStrictEqual(vaKeys, enKeys, 'Valencian (va) and English (en) must have identical translation keys');

      for (const lang of languages) {
        for (const key of vaKeys) {
          const val = TRANSLATIONS[lang][key];
          assert.strictEqual(typeof val, 'string', `Translation for [${lang}.${key}] must be a string`);
          assert.strictEqual(val.trim().length > 0, true, `Translation for [${lang}.${key}] cannot be empty`);
        }
      }
      assert.strictEqual(vaKeys.includes('loginSubmitBtn'), true);
      assert.strictEqual(vaKeys.includes('inputUsernameLabel'), true);
      assert.strictEqual(vaKeys.includes('inputPasswordLabel'), true);
    });

    it('Should render real Senyera Coronada image asset for Valencià (va) replicating Dine-Done', () => {
      const valencianFlagHtml = renderFlagHtml('va');
      assert.strictEqual(valencianFlagHtml.includes('<img'), true, 'Valencian flag must render an <img> element');
      assert.strictEqual(valencianFlagHtml.includes('lang-flag-img'), true, 'Valencian flag must have lang-flag-img class');
      assert.strictEqual(valencianFlagHtml.includes('va.png') || valencianFlagHtml.includes('data:image/png;base64'), true, 'Valencian flag must reference va.png or base64 Senyera Coronada');
    });

    it('Should interpolate parameters dynamically and translate statuses, maintenance, and fuel across all languages', () => {
      // Test Valencià
      LanguageManager.setLanguage('va');
      const valAlert = LanguageManager.t('alert_itv_imminent', { date: '30/10/2026', days: '8' });
      assert.strictEqual(valAlert, 'Venciment ITV el 30/10/2026 (8 dies restants)');
      assert.strictEqual(LanguageManager.t('status_active'), 'Actiu');
      assert.strictEqual(LanguageManager.t('maint_type_oil_change'), "Canvi d'Oli i Filtres");
      assert.strictEqual(LanguageManager.t('fuel_diesel'), 'Dièsel');

      // Test Español
      LanguageManager.setLanguage('es');
      const esAlert = LanguageManager.t('alert_itv_imminent', { date: '30/10/2026', days: '8' });
      assert.strictEqual(esAlert, 'Vencimiento ITV el 30/10/2026 (8 días restantes)');
      assert.strictEqual(LanguageManager.t('status_active'), 'Activo');
      assert.strictEqual(LanguageManager.t('maint_type_oil_change'), 'Cambio de Aceite y Filtros');
      assert.strictEqual(LanguageManager.t('fuel_diesel'), 'Diésel');

      // Test English
      LanguageManager.setLanguage('en');
      const enAlert = LanguageManager.t('alert_itv_imminent', { date: '30/10/2026', days: '8' });
      assert.strictEqual(enAlert, 'MOT/ITV expiration on 30/10/2026 (8 days remaining)');
      assert.strictEqual(LanguageManager.t('status_active'), 'Active');
      assert.strictEqual(LanguageManager.t('maint_type_oil_change'), 'Oil & Filter Service');
      assert.strictEqual(LanguageManager.t('fuel_diesel'), 'Diesel');
    });

    it('Should automatically translate Valencian technical observations into Spanish and English', () => {
      const valText = "Requereix canviar pneumàtics davanters abans d'ITV. Rutes de repartiment València - Sagunt.";

      LanguageManager.setLanguage('va');
      assert.strictEqual(LanguageManager.translateObservation(valText), valText);

      LanguageManager.setLanguage('es');
      const esTrans = LanguageManager.translateObservation(valText);
      assert.strictEqual(esTrans, "Requiere cambiar neumáticos delanteros antes de ITV. Rutas de reparto Valencia - Sagunto.");

      LanguageManager.setLanguage('en');
      const enTrans = LanguageManager.translateObservation(valText);
      assert.strictEqual(enTrans, "Requires replacing front tyres before MOT/ITV. Delivery routes Valencia - Sagunto.");

      // Fallback for empty observations
      LanguageManager.setLanguage('es');
      assert.strictEqual(LanguageManager.translateObservation(null), "Sin observaciones adicionales registradas.");
    });
  });

  describe('2. Multi-Tenant Data Isolation (Kickoff Section 2.3)', () => {
    it('Should strictly isolate vehicle fleet data between distinct tenants', async () => {
      const vehicleRepo = new JsonVehicleRepository();

      const valenciaVehicles = await vehicleRepo.findByTenant('tenant_valencia');
      const medVehicles = await vehicleRepo.findByTenant('tenant_med');

      assert.strictEqual(valenciaVehicles.length > 0, true, 'Tenant Valencia should have active vehicles');
      assert.strictEqual(medVehicles.length > 0, true, 'Tenant Med should have active vehicles');

      // Zero-overlap verification
      const valenciaIds = new Set(valenciaVehicles.map(v => v.id));
      for (const v of medVehicles) {
        assert.strictEqual(valenciaIds.has(v.id), false, `Vehicle ${v.id} from Med must not be visible to Valencia`);
        assert.strictEqual(v.tenantId, 'tenant_med');
      }

      for (const v of valenciaVehicles) {
        assert.strictEqual(v.tenantId, 'tenant_valencia');
      }
    });

    it('Should prevent cross-tenant lookup by ID', async () => {
      const vehicleRepo = new JsonVehicleRepository();

      // Vehicle veh_101 belongs to tenant_valencia
      const vehicle = await vehicleRepo.findById('tenant_med', 'veh_101');
      assert.strictEqual(vehicle, null, 'Tenant Med must never be able to access Tenant Valencia vehicle');
    });
  });

  describe('3. Zod Payload Validation & Enterprise Rules', () => {
    it('Should validate correct vehicle schema and reject invalid dates', () => {
      const valid = {
        id: 'veh_test_1',
        tenantId: 'tenant_valencia',
        licensePlate: '1234-BBB',
        make: 'Seat',
        model: 'Leon',
        year: 2021,
        fuelType: 'DIESEL',
        currentOdometerKm: 45000,
        status: 'ACTIVE',
        itvExpirationDate: '2027-04-15',
        nextMaintenanceKm: 60000
      };

      assert.doesNotThrow(() => VehicleSchema.parse(valid));

      const invalidDate = { ...valid, itvExpirationDate: '15/04/2027' }; // Invalid format
      assert.throws(() => VehicleSchema.parse(invalidDate));
    });

    it('Should reject negative fuel liters or cost', () => {
      const invalidFuel = {
        id: 'fuel_test',
        tenantId: 'tenant_valencia',
        vehicleId: 'veh_101',
        date: '2026-10-15',
        odometerKm: 85000,
        liters: -10,
        costEur: 50
      };

      assert.throws(() => FuelLogSchema.parse(invalidFuel));
    });

    it('Should validate maintenance record types', () => {
      const validMaint = {
        id: 'maint_test',
        tenantId: 'tenant_valencia',
        vehicleId: 'veh_101',
        type: 'OIL_CHANGE',
        status: 'SCHEDULED',
        scheduledDate: '2026-11-20',
        costEur: 150
      };

      assert.doesNotThrow(() => MaintenanceRecordSchema.parse(validMaint));

      const invalidType = { ...validMaint, type: 'UNKNOWN_SERVICE' };
      assert.throws(() => MaintenanceRecordSchema.parse(invalidType));
    });
  });

  describe('4. Architecture Isolation & Dependency Injection', () => {
    it('Should guarantee zero network calls to Supabase when USE_MOCK_DB=true', () => {
      process.env.USE_MOCK_DB = 'true';
      const client = getSupabaseClient();
      assert.strictEqual(client, null, 'Supabase client must be null when USE_MOCK_DB is true');
      assert.strictEqual(RepositoryContainer.isMockMode(), true);
    });

    it('Should dynamically instantiate repositories via container', () => {
      process.env.USE_MOCK_DB = 'true';
      const repo = RepositoryContainer.getVehicleRepository();
      assert.ok(repo instanceof JsonVehicleRepository);
    });
  });

});
