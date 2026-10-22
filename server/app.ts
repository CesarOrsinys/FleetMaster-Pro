import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RepositoryContainer } from '../src/adapters/infrastructure/di/RepositoryContainer.js';
import { PassportCrypto } from '../src/core/security/PassportCrypto.js';
import { VehicleSchema } from '../src/core/domain/Vehicle.js';
import { MaintenanceRecordSchema } from '../src/core/domain/MaintenanceRecord.js';
import { FuelLogSchema } from '../src/core/domain/FuelLog.js';
import { TrafficFineSchema } from '../src/core/domain/TrafficFine.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Security headers middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'fleetmaster_pro_super_secure_jwt_secret_2026_xyz';

import { executeKeepalivePing } from './services/keepalive.service.js';

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    project: 'FleetMaster-Pro',
    mockDb: RepositoryContainer.isMockMode(),
    timestamp: new Date().toISOString()
  });
});

// Server-side keepalive endpoint for Supabase
app.get('/api/keepalive', async (_req: Request, res: Response) => {
  if (process.env.ENABLE_KEEPALIVE !== 'true') {
    return res.json({ ok: true, status: 'disabled', message: 'Keepalive is temporarily disabled.' });
  }
  const result = await executeKeepalivePing();
  res.status(result.ok ? 200 : 500).json(result);
});


// Authentication endpoint with Passport Encryption & Resilient Serverless Execution
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    let { username, password, passport } = req.body;

    // 1. Decrypt Passport if provided (protecting credentials from network inspection)
    if (passport) {
      const decrypted = await PassportCrypto.decryptAuthPassport(passport);
      if (!decrypted) {
        return res.status(401).json({ error: 'Pasaporte de autenticación inválido o caducado', code: 'loginErrorInvalid' });
      }
      username = decrypted.username;
      password = decrypted.password;
    }

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required', code: 'error_required_fields' });
    }

    const userRepo = RepositoryContainer.getUserRepository();
    const user = await userRepo.findByUsername(username);

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'loginErrorInvalid' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'loginErrorInvalid' });
    }

    // Safely attempt last login update (does not crash on read-only serverless filesystems)
    try {
      await userRepo.updateLastLogin(user.id);
    } catch (updateErr) {
      console.warn('[Auth] Non-fatal: could not persist last_login timestamp:', (updateErr as Error).message);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    const { passwordHash, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err: any) {
    console.error('[Auth Error 500 caught]:', err);
    return res.status(500).json({ error: err.message || 'Internal server error', code: 'error_internal' });
  }
});

// Tenants list
app.get('/api/tenants', async (_req: Request, res: Response) => {
  try {
    const tenantRepo = RepositoryContainer.getTenantRepository();
    const tenants = await tenantRepo.findAll();
    res.json(tenants);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Tenant vehicles
app.get('/api/vehicles', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant_valencia';
    const vehicleRepo = RepositoryContainer.getVehicleRepository();
    const vehicles = await vehicleRepo.findByTenant(tenantId);
    res.json(vehicles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create vehicle
app.post('/api/vehicles', async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId || 'tenant_valencia';
    const parsed = VehicleSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse({
      ...req.body,
      tenantId
    });
    const vehicleRepo = RepositoryContainer.getVehicleRepository();
    const created = await vehicleRepo.create(parsed);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Maintenance records
app.get('/api/maintenance', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant_valencia';
    const maintRepo = RepositoryContainer.getMaintenanceRepository();
    const records = await maintRepo.findByTenant(tenantId);
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create maintenance record
app.post('/api/maintenance', async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId || 'tenant_valencia';
    const parsed = MaintenanceRecordSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse({
      ...req.body,
      tenantId
    });
    const maintRepo = RepositoryContainer.getMaintenanceRepository();
    const created = await maintRepo.create(parsed);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Fuel logs
app.get('/api/fuel-logs', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant_valencia';
    const fuelRepo = RepositoryContainer.getFuelLogRepository();
    const logs = await fuelRepo.findByTenant(tenantId);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create fuel log
app.post('/api/fuel-logs', async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId || 'tenant_valencia';
    const parsed = FuelLogSchema.omit({ id: true, createdAt: true }).parse({
      ...req.body,
      tenantId
    });
    const fuelRepo = RepositoryContainer.getFuelLogRepository();
    const created = await fuelRepo.create(parsed);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// DRIVERS API
// ==========================================
app.get('/api/drivers', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant_valencia';
    const userRepo = RepositoryContainer.getUserRepository();
    const allUsers = await userRepo.findByTenant(tenantId);
    const drivers = allUsers.filter(u => u.role === 'DRIVER');
    res.json(drivers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drivers', async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId || 'tenant_valencia';
    const { fullName, username, email, phone, licenseNumber, assignedVehicleId } = req.body;

    if (!fullName || !username || !email) {
      return res.status(400).json({ error: 'Full name, username, and email are required' });
    }

    const defaultPassword = 'Driver2026!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const userRepo = RepositoryContainer.getUserRepository();
    const created = await userRepo.create({
      tenantId,
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      passwordHash,
      fullName: fullName.trim(),
      role: 'DRIVER',
      phone: phone?.trim() || null,
      licenseNumber: licenseNumber?.trim() || null,
      active: true,
      lastLoginAt: null
    });

    // If an assigned vehicle was chosen, update the vehicle
    if (assignedVehicleId) {
      const vehicleRepo = RepositoryContainer.getVehicleRepository();
      await vehicleRepo.update(tenantId, assignedVehicleId, { assignedDriverId: created.id });
    }

    const { passwordHash: _, ...safeUser } = created;
    res.status(201).json(safeUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Assign driver to vehicle
app.put('/api/vehicles/:id/driver', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, driverId } = req.body;
    const activeTenant = tenantId || 'tenant_valencia';

    const vehicleRepo = RepositoryContainer.getVehicleRepository();
    const updated = await vehicleRepo.update(activeTenant, id, { assignedDriverId: driverId || null });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// TRAFFIC FINES API
// ==========================================
app.get('/api/fines', async (req: Request, res: Response) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant_valencia';
    const finesRepo = RepositoryContainer.getTrafficFineRepository();
    const fines = await finesRepo.findByTenant(tenantId);
    res.json(fines);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/fines', async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId || 'tenant_valencia';
    const parsed = TrafficFineSchema.omit({ id: true, createdAt: true }).parse({
      ...req.body,
      tenantId
    });
    const finesRepo = RepositoryContainer.getTrafficFineRepository();
    const created = await finesRepo.create(parsed);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/fines/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, status } = req.body;
    const activeTenant = tenantId || 'tenant_valencia';
    const finesRepo = RepositoryContainer.getTrafficFineRepository();
    const updated = await finesRepo.updateStatus(activeTenant, id, status);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

