import fs from 'fs';
import path from 'path';
import { IUserRepository } from '../../../core/ports/IUserRepository.js';
import { User, SafeUser, UserSchema } from '../../../core/domain/User.js';

export class JsonUserRepository implements IUserRepository {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'mock_data', 'users.json');
  }

  private readData(): User[] {
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private writeData(data: User[]): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
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
