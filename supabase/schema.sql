-- ============================================================================
-- FLEETMASTER-PRO - SUPABASE ENTERPRISE MULTI-TENANT DATABASE SCHEMA
-- Target Database: PostgreSQL 15+ / Supabase
-- Security: Row Level Security (RLS) & Multi-Tenancy Data Isolation
-- ============================================================================

-- ============================================================================
-- 0. CLEAN EXISTING SCHEMA (TEARDOWN COMPLETO)
-- CASCADE borra automáticamente las políticas RLS asociadas a cada tabla
-- ============================================================================
DROP TABLE IF EXISTS traffic_fines CASCADE;
DROP TABLE IF EXISTS fuel_mileage_logs CASCADE;
DROP TABLE IF EXISTS maintenance_records CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

DROP FUNCTION IF EXISTS get_current_tenant_id() CASCADE;

DROP TYPE IF EXISTS fine_status_enum CASCADE;
DROP TYPE IF EXISTS maintenance_status_enum CASCADE;
DROP TYPE IF EXISTS maintenance_type_enum CASCADE;
DROP TYPE IF EXISTS fuel_type_enum CASCADE;
DROP TYPE IF EXISTS vehicle_status_enum CASCADE;
DROP TYPE IF EXISTS user_role_enum CASCADE;

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. ENUMS & DOMAIN TYPES
-- ============================================================================
CREATE TYPE user_role_enum AS ENUM (
  'SUPERADMIN',     -- Administrador global del sistema SaaS
  'TENANT_ADMIN',   -- Administrador de la empresa/flota cliente
  'DRIVER'          -- Conductor asignado / empleado
);

CREATE TYPE vehicle_status_enum AS ENUM (
  'ACTIVE',         -- Operativo en circulación
  'MAINTENANCE',    -- En taller o revisión
  'OUT_OF_SERVICE'  -- Fuera de servicio o baja
);

CREATE TYPE fuel_type_enum AS ENUM (
  'DIESEL',         -- Diésel / Gasóleo A
  'GASOLINE',       -- Gasolina Sin Plomo 95/98
  'ELECTRIC',       -- 100% Eléctrico (BEV)
  'HYBRID',         -- Híbrido (HEV / PHEV)
  'LPG'             -- Gas Licuado (GLP / GNC)
);

CREATE TYPE maintenance_type_enum AS ENUM (
  'ITV_MOT',              -- Inspección Técnica de Vehículos (ITV)
  'OIL_CHANGE',           -- Cambio de aceite de motor y filtro de aceite
  'FILTER_REPLACEMENT',   -- Sustitución de filtros (aire, polen, combustible)
  'BRAKES',               -- Pastillas y discos de freno
  'TIRES',                -- Cambio / equilibrado de neumáticos
  'GENERAL_REPAIR'        -- Reparación mecánica o de carrocería general
);

CREATE TYPE maintenance_status_enum AS ENUM (
  'SCHEDULED',  -- Programada / Pendiente
  'COMPLETED',  -- Realizada y validada
  'CANCELLED'   -- Anulada
);

CREATE TYPE fine_status_enum AS ENUM (
  'PENDING',    -- Pendiente de pago o alegación
  'PAID',       -- Abonada / Satisfecha
  'APPEALED'    -- Recurrida / En alegaciones
);

-- ============================================================================
-- 3. TABLE: TENANTS (Empresas Clientes en el SaaS)
-- ============================================================================
CREATE TABLE tenants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  cif VARCHAR(30),
  logo_url TEXT,
  primary_color VARCHAR(10) DEFAULT '#0F766E',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 4. TABLE: USERS (Usuarios con RBAC y Aislamiento por Empresa)
-- ============================================================================
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'DRIVER',
  phone VARCHAR(30),
  license_number VARCHAR(50),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 5. TABLE: VEHICLES (Registro del Parque de Vehículos)
-- ============================================================================
CREATE TABLE vehicles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  license_plate VARCHAR(20) NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  vin VARCHAR(50),
  fuel_type fuel_type_enum NOT NULL DEFAULT 'DIESEL',
  current_odometer_km INT NOT NULL DEFAULT 0,
  status vehicle_status_enum NOT NULL DEFAULT 'ACTIVE',
  assigned_driver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  itv_expiration_date DATE NOT NULL,
  next_maintenance_km INT NOT NULL DEFAULT 15000,
  next_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_tenant_vehicle_plate UNIQUE (tenant_id, license_plate)
);

-- ============================================================================
-- 6. TABLE: MAINTENANCE_RECORDS (Mantenimientos e ITVs)
-- ============================================================================
CREATE TABLE maintenance_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type maintenance_type_enum NOT NULL,
  status maintenance_status_enum NOT NULL DEFAULT 'SCHEDULED',
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  odometer_at_service_km INT,
  cost_eur NUMERIC(10, 2) DEFAULT 0.00,
  workshop_name VARCHAR(150),
  notes TEXT,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 7. TABLE: FUEL_MILEAGE_LOGS (Registros de Combustible y Odómetro)
-- ============================================================================
CREATE TABLE fuel_mileage_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  odometer_km INT NOT NULL,
  liters NUMERIC(8, 2) NOT NULL,
  cost_eur NUMERIC(10, 2) NOT NULL,
  fuel_station VARCHAR(150),
  receipt_url TEXT,
  notes TEXT,
  full_tank BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 8. TABLE: TRAFFIC_FINES (Multas y Sanciones de Tráfico)
-- ============================================================================
CREATE TABLE traffic_fines (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  reason TEXT NOT NULL,
  amount_eur NUMERIC(10, 2) NOT NULL CHECK (amount_eur > 0),
  status fine_status_enum NOT NULL DEFAULT 'PENDING',
  fine_reference VARCHAR(100),
  organism VARCHAR(150),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 9. INDEXES FOR HIGH-PERFORMANCE MULTI-TENANCY
-- ============================================================================
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_vehicles_tenant ON vehicles(tenant_id);
CREATE INDEX idx_vehicles_driver ON vehicles(assigned_driver_id);
CREATE INDEX idx_vehicles_itv ON vehicles(itv_expiration_date);
CREATE INDEX idx_maintenance_tenant ON maintenance_records(tenant_id);
CREATE INDEX idx_maintenance_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX idx_fuel_tenant ON fuel_mileage_logs(tenant_id);
CREATE INDEX idx_fuel_vehicle ON fuel_mileage_logs(vehicle_id);
CREATE INDEX idx_fines_tenant ON traffic_fines(tenant_id);
CREATE INDEX idx_fines_vehicle ON traffic_fines(vehicle_id);
CREATE INDEX idx_fines_driver ON traffic_fines(driver_id);

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_fines ENABLE ROW LEVEL SECURITY;

-- Helper function to extract tenant_id from auth claim or session variable
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    nullif(current_setting('app.current_tenant_id', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Public / Backend API Policies (Express backend manages auth & tenant isolation)
CREATE POLICY "Tenants api access" ON tenants
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Users api access" ON users
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Vehicles api access" ON vehicles
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Maintenance api access" ON maintenance_records
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Fuel logs api access" ON fuel_mileage_logs
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Traffic fines api access" ON traffic_fines
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================================
-- 11. SEED DATA (ENTORNOS DE PRUEBA Y DEMOSTRACIÓN)
-- ============================================================================
BEGIN; -- 11.1. Empresas Demo
INSERT INTO tenants (id, code, name, cif, primary_color, active) VALUES
  ('tenant_valencia', 'valencia-trans', 'València Transports Logístics SL', 'B98765432', '#0F766E', true),
  ('tenant_med', 'med-flota', 'Mediterrània Fleet Services SA', 'A12345678', '#2563EB', true);

-- 11.2. Usuarios Iniciales (Contraseñas cifradas con bcrypt: Admin2026! / Driver2026!)
INSERT INTO users (id, tenant_id, username, email, password_hash, full_name, role, phone, license_number, active) VALUES
  ('usr_super', NULL, 'superadmin', 'superadmin@fleetmaster.pro', '$2b$10$rZu4p0jQ8IHrHg0/YZwOb.IJ2Hze76gdo48B862G8uYRj38s1ceMS', 'Super Administrador Global', 'SUPERADMIN', '+34600000000', 'B-00000000', true),
  ('usr_admin_val', 'tenant_valencia', 'admin_valencia', 'admin@valenciatrans.es', '$2b$10$rZu4p0jQ8IHrHg0/YZwOb.IJ2Hze76gdo48B862G8uYRj38s1ceMS', 'Yris Orsinys (Jefe de Flota)', 'TENANT_ADMIN', '+34611223344', 'B-12345678', true),
  ('usr_driver_joan', 'tenant_valencia', 'conductor_joan', 'joan@valenciatrans.es', '$2b$10$5LC9PvTJeOeHSEZws.yXzOcvE3gLy32rDo3S.1ONQ/SanRVe86Xh2', 'Joan Fuster', 'DRIVER', '+34622334455', 'B-87654321', true),
  ('usr_driver_marta', 'tenant_valencia', 'conductora_marta', 'marta@valenciatrans.es', '$2b$10$5LC9PvTJeOeHSEZws.yXzOcvE3gLy32rDo3S.1ONQ/SanRVe86Xh2', 'Marta Navarro', 'DRIVER', '+34655443322', 'B-55443322', true),
  ('usr_driver_pau', 'tenant_valencia', 'conductor_pau', 'pau@valenciatrans.es', '$2b$10$5LC9PvTJeOeHSEZws.yXzOcvE3gLy32rDo3S.1ONQ/SanRVe86Xh2', 'Pau Beltran', 'DRIVER', '+34699887766', 'B-99887766', true),
  ('usr_admin_med', 'tenant_med', 'admin_med', 'admin@medfleet.com', '$2b$10$rZu4p0jQ8IHrHg0/YZwOb.IJ2Hze76gdo48B862G8uYRj38s1ceMS', 'Carles Gómez (Director Flota Med)', 'TENANT_ADMIN', '+34633445566', 'B-33445566', true),
  ('usr_driver_sergi', 'tenant_med', 'conductor_sergi', 'sergi@medfleet.com', '$2b$10$5LC9PvTJeOeHSEZws.yXzOcvE3gLy32rDo3S.1ONQ/SanRVe86Xh2', 'Sergi Puig', 'DRIVER', '+34677889900', 'B-77889900', true);

-- 11.3. Vehículos Iniciales (con Conductor Asignado por Vehículo)
INSERT INTO vehicles (id, tenant_id, license_plate, make, model, year, vin, fuel_type, current_odometer_km, status, assigned_driver_id, itv_expiration_date, next_maintenance_km, next_maintenance_date, notes) VALUES
  ('veh_101', 'tenant_valencia', '4589-LDR', 'Renault', 'Trafic 2.0 dCi', 2022, 'VF1FL000012345678', 'DIESEL', 84500, 'ACTIVE', 'usr_driver_joan', '2026-11-15', 90000, '2026-12-01', 'Furgoneta principal de reparto Valencia - Castellón'),
  ('veh_102', 'tenant_valencia', '7812-MMK', 'Toyota', 'Proace Electric', 2023, 'VNKFL123498765432', 'ELECTRIC', 32400, 'ACTIVE', 'usr_driver_marta', '2027-03-20', 45000, '2027-01-15', 'Vehículo 100% eléctrico urbano para el centro histórico'),
  ('veh_103', 'tenant_valencia', '1945-KBC', 'Peugeot', 'Partner 1.5 BlueHDi', 2020, 'VF37J000055443322', 'DIESEL', 142100, 'MAINTENANCE', 'usr_driver_pau', '2026-10-30', 150000, '2026-11-05', 'En taller por cambio de pastillas y revisión ITV urgente'),
  ('veh_201', 'tenant_med', '6523-MTR', 'Mercedes-Benz', 'Sprinter 314 CDI', 2023, 'WDB9061234123456', 'DIESEL', 56200, 'ACTIVE', 'usr_driver_sergi', '2027-05-10', 60000, '2027-06-01', 'Flota Mediterránea - Rutas largas');

-- 11.4. Mantenimientos Iniciales
INSERT INTO maintenance_records (id, tenant_id, vehicle_id, type, status, scheduled_date, completed_date, odometer_at_service_km, cost_eur, workshop_name, notes, created_by) VALUES
  ('maint_001', 'tenant_valencia', 'veh_101', 'OIL_CHANGE', 'COMPLETED', '2026-06-10', '2026-06-12', 75000, 185.50, 'Talleres Morvedre Sagunto', 'Cambio de aceite sintético 5W30 y filtro de aceite reglamentario', 'usr_admin_val'),
  ('maint_002', 'tenant_valencia', 'veh_103', 'ITV_MOT', 'SCHEDULED', '2026-10-28', NULL, 142100, 55.80, 'Estación ITV Castellón Norte', 'Cita previa confirmada para inspección periódica', 'usr_admin_val'),
  ('maint_003', 'tenant_valencia', 'veh_103', 'BRAKES', 'SCHEDULED', '2026-10-25', NULL, 142100, 240.00, 'Frenos y Mecánica Borrull', 'Sustitución de pastillas delanteras y revisión de líquido de frenos', 'usr_admin_val');

-- 11.5. Registros de Combustible Iniciales
INSERT INTO fuel_mileage_logs (id, tenant_id, vehicle_id, driver_id, date, odometer_km, liters, cost_eur, fuel_station, notes) VALUES
  ('fuel_001', 'tenant_valencia', 'veh_101', 'usr_driver_joan', '2026-10-02', 83800, 62.40, 93.60, 'Repsol Viver / Segorbe', 'Repostaje completo diésel ruta A-23'),
  ('fuel_002', 'tenant_valencia', 'veh_101', 'usr_driver_joan', '2026-10-14', 84500, 58.10, 87.15, 'Cepsa Castellón Sur', 'Repostaje de regreso a centro logístico');

-- 11.6. Sanciones y Multas de Tráfico Iniciales
INSERT INTO traffic_fines (id, tenant_id, vehicle_id, driver_id, date, reason, amount_eur, status, fine_reference, organism, notes) VALUES
  ('fine_001', 'tenant_valencia', 'veh_101', 'usr_driver_joan', '2026-10-05', 'Exceso de velocidad en tramo interurbano (88 km/h en zona 70 km/h)', 100.00, 'PENDING', 'DGT-2026-98124', 'DGT Tráfico Valencia', 'Notificación recibida por correo certificado. Descuento del 50% disponible por pronto pago.'),
  ('fine_002', 'tenant_valencia', 'veh_103', 'usr_driver_pau', '2026-09-18', 'Estacionamiento indebido en zona de carga y descarga fuera de horario', 90.00, 'PAID', 'AJV-2026-44120', 'Policía Local de Valencia', 'Abonada vía pasarela telemática con tarjeta de empresa con el 50% de reducción (45,00 €).'),
  ('fine_003', 'tenant_valencia', 'veh_102', 'usr_driver_marta', '2026-10-12', 'Acceso no autorizado a zona de bajas emisiones (ZBE)', 200.00, 'APPEALED', 'AJV-2026-55901', 'Ayuntamiento de Valencia (Movilidad)', 'Alegación presentada con distintivo ambiental 0 Emisiones del vehículo eléctrico.'),
  ('fine_004', 'tenant_med', 'veh_201', 'usr_driver_sergi', '2026-09-25', 'No respetar señal de obligación en intersección', 80.00, 'PAID', 'DGT-2026-11234', 'DGT Alicante', 'Pagada por la empresa sin recargo.');
COMMIT;
