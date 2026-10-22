import fs from 'fs';
import path from 'path';
import { IUserRepository } from '../../../core/ports/IUserRepository.js';
import { User, SafeUser, UserSchema } from '../../../core/domain/User.js';

const DEFAULT_USERS: User[] = [
  {
    id: "usr_super",
    tenantId: null,
    username: "superadmin",
    email: "superadmin@fleetmaster.pro",
    passwordHash: "$2b$10$rZu4p0jQ8IHrHg0/YZwOb.IJ2Hze76gdo48B862G8uYRj38s1ceMS",
    fullName: "Super Administrador Global",
    role: "SUPERADMIN",
    phone: "+34600000000",
    licenseNumber: "B-00000000",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "usr_admin_val",
    tenantId: "tenant_valencia",
    username: "admin_valencia",
    email: "admin@valenciatrans.es",
    passwordHash: "$2b$10$rZu4p0jQ8IHrHg0/YZwOb.IJ2Hze76gdo48B862G8uYRj38s1ceMS",
    fullName: "Yris Orsinys (Cap de Flota)",
    role: "TENANT_ADMIN",
    phone: "+34611223344",
    licenseNumber: "B-12345678",
    active: true,
    createdAt: "2026-01-10T08:30:00.000Z",
    updatedAt: "2026-10-22T13:02:41.131Z",
    lastLoginAt: "2026-10-22T13:02:41.131Z"
  },
  {
    id: "usr_driver_joan",
    tenantId: "tenant_valencia",
    username: "conductor_joan",
    email: "joan@valenciatrans.es",
    passwordHash: "$2b$10$5LC9PvTJeOeHSEZws.yXzOcvE3gLy32rDo3S.1ONQ/SanRVe86Xh2",
    fullName: "Joan Fuster",
    role: "DRIVER",
    phone: "+34622334455",
    licenseNumber: "B-87654321",
    active: true,
    createdAt: "2026-01-12T10:00:00.000Z",
    updatedAt: "2026-01-12T10:00:00.000Z"
  },
  {
    id: "usr_driver_marta",
    tenantId: "tenant_valencia",
    username: "conductora_marta",
    email: "marta@valenciatrans.es",
    passwordHash: "$2b$10$5LC9PvTJeOeHSEZws.yXzOcvE3gLy32rDo3S.1ONQ/SanRVe86Xh2",
    fullName: "Marta Navarro",
    role: "DRIVER",
    phone: "+34655443322",
    licenseNumber: "B-55443322",
    active: true,
    createdAt: "2026-02-01T09:00:00.000Z",
    updatedAt: "2026-02-01T09:00:00.000Z"
  },
  {
    id: "usr_driver_pau",
    tenantId: "tenant_valencia",
    username: "conductor_pau",
    email: "pau@valenciatrans.es",
    passwordHash: "$2b$10$5LC9PvTJeOeHSEZws.yXzOcvE3gLy32rDo3S.1ONQ/SanRVe86Xh2",
    fullName: "Pau Beltran",
    role: "DRIVER",
    phone: "+34699887766",
    licenseNumber: "B-99887766",
    active: true,
    createdAt: "2026-03-05T11:00:00.000Z",
    updatedAt: "2026-03-05T11:00:00.000Z"
  },
  {
    id: "usr_admin_med",
    tenantId: "tenant_med",
    username: "admin_med",
    email: "admin@medfleet.com",
    passwordHash: "$2b$10$rZu4p0jQ8IHrHg0/YZwOb.IJ2Hze76gdo48B862G8uYRj38s1ceMS",
    fullName: "Carles Gómez (Director Flota Med)",
    role: "TENANT_ADMIN",
    phone: "+34633445566",
    licenseNumber: "B-33445566",
    active: true,
    createdAt: "2026-02-15T11:00:00.000Z",
    updatedAt: "2026-02-15T11:00:00.000Z"
  },
  {
    id: "usr_driver_sergi",
    tenantId: "tenant_med",
    username: "conductor_sergi",
    email: "sergi@medfleet.com",
    passwordHash: "$2b$10$5LC9PvTJeOeHSEZws.yXzOcvE3gLy32rDo3S.1ONQ/SanRVe86Xh2",
    fullName: "Sergi Puig",
    role: "DRIVER",
    phone: "+34677889900",
    licenseNumber: "B-77889900",
    active: true,
    createdAt: "2026-02-20T10:00:00.000Z",
    updatedAt: "2026-02-20T10:00:00.000Z"
  }
];

function resolveMockUsersPath(customPath?: string): string {
  if (customPath) return customPath;
  const candidates = [
    path.join(process.cwd(), 'mock_data', 'users.json'),
    path.join(process.cwd(), '..', 'mock_data', 'users.json'),
    path.resolve(process.cwd(), 'mock_data', 'users.json'),
    path.resolve(process.cwd(), 'Projects', 'FleetMaster-Pro', 'mock_data', 'users.json')
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch {
      // Continue search
    }
  }
  return candidates[0];
}

export class JsonUserRepository implements IUserRepository {
  private filePath: string;
  private inMemoryUsers: User[] | null = null;

  constructor(filePath?: string) {
    this.filePath = resolveMockUsersPath(filePath);
  }

  private readData(): User[] {
    if (this.inMemoryUsers && this.inMemoryUsers.length > 0) {
      return this.inMemoryUsers;
    }

    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.inMemoryUsers = parsed;
          return this.inMemoryUsers;
        }
      }
    } catch (err) {
      console.warn('[JsonUserRepository] Failed to read users from disk, using fallback:', (err as Error).message);
    }

    this.inMemoryUsers = [...DEFAULT_USERS];
    return this.inMemoryUsers;
  }

  private writeData(data: User[]): void {
    this.inMemoryUsers = data;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      // Gracefully handle read-only filesystems (e.g., Vercel Serverless Lambda)
      console.warn('[JsonUserRepository] Filesystem read-only, updated in-memory state:', (e as Error).message);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    const list = this.readData();
    return list.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const list = this.readData();
    return list.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findById(id: string): Promise<User | null> {
    const list = this.readData();
    return list.find(u => u.id === id) || null;
  }

  async findByTenant(tenantId: string): Promise<SafeUser[]> {
    const list = this.readData();
    return list
      .filter(u => u.tenantId === tenantId)
      .map(({ passwordHash, ...safe }) => safe as SafeUser);
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const list = this.readData();
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    UserSchema.parse(newUser);
    list.push(newUser);
    this.writeData(list);
    return newUser;
  }

  async updateLastLogin(id: string): Promise<void> {
    const list = this.readData();
    const idx = list.findIndex(u => u.id === id);
    if (idx !== -1) {
      list[idx].lastLoginAt = new Date().toISOString();
      list[idx].updatedAt = new Date().toISOString();
      this.writeData(list);
    }
  }
}
