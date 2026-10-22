import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RepositoryContainer } from '../src/adapters/infrastructure/di/RepositoryContainer.js';
import { VehicleSchema } from '../src/core/domain/Vehicle.js';
import { MaintenanceRecordSchema } from '../src/core/domain/MaintenanceRecord.js';
import { FuelLogSchema } from '../src/core/domain/FuelLog.js';

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

// Server-side keepalive endpoint for Supabase (temporarily disabled)
app.get('/api/keepalive', async (_req: Request, res: Response) => {
  if (process.env.ENABLE_KEEPALIVE !== 'true') {
    return res.json({ ok: true, status: 'disabled', message: 'Keepalive is temporarily disabled.' });
  }
  const result = await executeKeepalivePing();
  res.status(result.ok ? 200 : 500).json(result);
});


// Authentication endpoint
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
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

    await userRepo.updateLastLogin(user.id);

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
