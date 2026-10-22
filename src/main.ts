import { LanguageManager } from './ui/i18n/LanguageManager.js';
import { Vehicle } from './core/domain/Vehicle.js';
import { MaintenanceRecord } from './core/domain/MaintenanceRecord.js';
import { FuelLog } from './core/domain/FuelLog.js';

interface UserSession {
  id: string;
  username: string;
  fullName: string;
  role: 'SUPERADMIN' | 'TENANT_ADMIN' | 'DRIVER';
  tenantId: string | null;
}

class AppController {
  private currentTenant: string = 'tenant_valencia';
  private authToken: string | null = null;
  private currentUser: UserSession | null = null;

  public init(): void {
    // 1. Initialize Strict i18n and Custom Language Selector (with Dine-Done Senyera Coronada flag)
    LanguageManager.init();

    // 2. Setup All UI Event Handlers (Login form, demo pills, tabs, logout, tenant switch)
    this.setupEventListeners();

    // 3. Evaluate Authentication Status
    this.checkAuthenticationState();
  }

  private checkAuthenticationState(): void {
    const savedToken = localStorage.getItem('fleetmaster_token');
    const savedUserJson = localStorage.getItem('fleetmaster_user');

    if (savedToken && savedUserJson) {
      try {
        const user: UserSession = JSON.parse(savedUserJson);
        this.authToken = savedToken;
        this.currentUser = user;
        if (user.tenantId) {
          this.currentTenant = user.tenantId;
        }

        // Show Application Shell and Hide Login
        this.showApplicationShell();

        // ONLY AFTER LOGIN: Execute pertinent backend calls
        this.loadData();
        return;
      } catch (e) {
        console.warn('Invalid saved session. Resetting.', e);
        this.clearSession();
      }
    }

    // Unauthenticated: Strictly show login screen, ZERO backend calls for data
    this.showLoginView();
  }

  private showLoginView(): void {
    const loginView = document.getElementById('view-login');
    const appShell = document.getElementById('app-shell');

    if (loginView) loginView.style.display = 'flex';
    if (appShell) appShell.style.display = 'none';

    // Clear any table data
    const vehiclesTbody = document.getElementById('vehicles-table-body');
    if (vehiclesTbody) vehiclesTbody.innerHTML = '';
    const maintTbody = document.getElementById('maintenance-table-body');
    if (maintTbody) maintTbody.innerHTML = '';
    const fuelTbody = document.getElementById('fuel-table-body');
    if (fuelTbody) fuelTbody.innerHTML = '';
  }

  private showApplicationShell(): void {
    const loginView = document.getElementById('view-login');
    const appShell = document.getElementById('app-shell');

    if (loginView) loginView.style.display = 'none';
    if (appShell) appShell.style.display = 'flex';

    this.updateHeaderUserInfo();
    this.syncTenantSelect();
  }

  private updateHeaderUserInfo(): void {
    if (!this.currentUser) return;

    const avatarEl = document.getElementById('header-user-avatar');
    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');

    if (avatarEl) {
      const initials = this.currentUser.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      avatarEl.textContent = initials || 'US';
    }

    if (nameEl) {
      nameEl.textContent = this.currentUser.fullName;
    }

    if (roleEl) {
      const roleKey = this.currentUser.role === 'SUPERADMIN'
        ? 'profileRoleSuperAdmin'
        : this.currentUser.role === 'TENANT_ADMIN'
        ? 'profileRoleTenantAdmin'
        : 'profileRoleDriver';
      roleEl.textContent = LanguageManager.t(roleKey);
    }
  }

  private syncTenantSelect(): void {
    const tenantSelect = document.getElementById('tenant-select') as HTMLSelectElement;
    if (tenantSelect) {
      tenantSelect.value = this.currentTenant;
      // If user is a tenant admin or driver, restrict switching or sync to their tenant
      if (this.currentUser && this.currentUser.role !== 'SUPERADMIN' && this.currentUser.tenantId) {
        tenantSelect.value = this.currentUser.tenantId;
        this.currentTenant = this.currentUser.tenantId;
      }
    }
  }

  private setupEventListeners(): void {
    // 1. Login Form Submission
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });

    // 2. Demo Credentials Quick Fill Buttons
    this.setupDemoCredentials();

    // 3. Logout Handler
    const logoutBtn = document.getElementById('btn-logout');
    logoutBtn?.addEventListener('click', () => {
      this.clearSession();
      this.showLoginView();
    });

    // 4. Tenant Switcher (in app shell)
    const tenantSelect = document.getElementById('tenant-select') as HTMLSelectElement;
    tenantSelect?.addEventListener('change', () => {
      this.currentTenant = tenantSelect.value;
      localStorage.setItem('fleetmaster_tenant', this.currentTenant);
      this.loadData();
    });

    // 5. Tab Navigation
    document.querySelectorAll<HTMLButtonElement>('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        if (!tabName) return;

        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const content = document.getElementById(`view-${tabName}`);
        content?.classList.add('active');
      });
    });

    // 6. Re-render text on Language Changed Event
    document.addEventListener('app:language-changed', () => {
      this.updateHeaderUserInfo();
      this.renderAlerts();
    });
  }

  private setupDemoCredentials(): void {
    const setCreds = (username: string, pass: string, tenant: string) => {
      const usernameInput = document.getElementById('login-username') as HTMLInputElement;
      const passInput = document.getElementById('login-password') as HTMLInputElement;
      const tenantInput = document.getElementById('login-tenant') as HTMLSelectElement;

      if (usernameInput) usernameInput.value = username;
      if (passInput) passInput.value = pass;
      if (tenantInput) tenantInput.value = tenant;

      const errorBanner = document.getElementById('login-error');
      if (errorBanner) errorBanner.style.display = 'none';
    };

    document.getElementById('pill-admin-val')?.addEventListener('click', () => {
      setCreds('admin_valencia', 'Admin2026!', 'tenant_valencia');
    });

    document.getElementById('pill-admin-med')?.addEventListener('click', () => {
      setCreds('admin_med', 'Admin2026!', 'tenant_med');
    });

    document.getElementById('pill-driver-joan')?.addEventListener('click', () => {
      setCreds('conductor_joan', 'Driver2026!', 'tenant_valencia');
    });

    document.getElementById('pill-superadmin')?.addEventListener('click', () => {
      setCreds('superadmin', 'Admin2026!', 'tenant_valencia');
    });
  }

  private async handleLogin(): Promise<void> {
    const usernameInput = document.getElementById('login-username') as HTMLInputElement;
    const passInput = document.getElementById('login-password') as HTMLInputElement;
    const tenantSelect = document.getElementById('login-tenant') as HTMLSelectElement;
    const submitBtn = document.getElementById('login-submit-btn') as HTMLButtonElement;
    const errorBanner = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');

    const username = usernameInput?.value.trim() || '';
    const password = passInput?.value || '';
    const selectedTenant = tenantSelect?.value || 'tenant_valencia';

    if (errorBanner) errorBanner.style.display = 'none';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>⏳</span> <span>${LanguageManager.t('loginLoggingIn')}</span>`;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      this.authToken = data.token;
      this.currentUser = data.user;
      this.currentTenant = this.currentUser?.tenantId || selectedTenant;

      // Persist session
      localStorage.setItem('fleetmaster_token', this.authToken!);
      localStorage.setItem('fleetmaster_user', JSON.stringify(this.currentUser));
      localStorage.setItem('fleetmaster_tenant', this.currentTenant);

      // Transition to application shell
      this.showApplicationShell();

      // ONLY NOW: Fetch data for the active tenant
      await this.loadData();
    } catch (err) {
      if (errorBanner) {
        errorBanner.style.display = 'flex';
        if (errorText) {
          errorText.textContent = LanguageManager.t('loginErrorInvalid');
        }
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>🔒</span> <span>${LanguageManager.t('loginSubmitBtn')}</span>`;
      }
    }
  }

  private clearSession(): void {
    this.authToken = null;
    this.currentUser = null;
    localStorage.removeItem('fleetmaster_token');
    localStorage.removeItem('fleetmaster_user');
  }

  // Loaded ONLY after authentication
  private async loadData(): Promise<void> {
    if (!this.authToken) {
      console.warn('loadData skipped: user is not authenticated.');
      return;
    }

    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${this.authToken}`
      };

      const [vehiclesRes, maintRes, fuelRes] = await Promise.all([
        fetch(`/api/vehicles?tenantId=${this.currentTenant}`, { headers }).catch(() => null),
        fetch(`/api/maintenance?tenantId=${this.currentTenant}`, { headers }).catch(() => null),
        fetch(`/api/fuel-logs?tenantId=${this.currentTenant}`, { headers }).catch(() => null)
      ]);

      const vehicles: Vehicle[] = vehiclesRes && vehiclesRes.ok ? await vehiclesRes.json() : [];
      const maintenance: MaintenanceRecord[] = maintRes && maintRes.ok ? await maintRes.json() : [];
      const fuelLogs: FuelLog[] = fuelRes && fuelRes.ok ? await fuelRes.json() : [];

      this.renderVehicles(vehicles);
      this.renderMaintenance(maintenance, vehicles);
      this.renderFuelLogs(fuelLogs);
      this.updateKpis(vehicles, maintenance, fuelLogs);
    } catch (err) {
      console.warn('Fallback loading data locally', err);
    }
  }

  private renderVehicles(vehicles: Vehicle[]): void {
    const tbody = document.getElementById('vehicles-table-body');
    if (!tbody) return;

    if (vehicles.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</td></tr>`;
      return;
    }

    tbody.innerHTML = vehicles.map(v => {
      const statusClass = v.status === 'ACTIVE' ? 'active' : v.status === 'MAINTENANCE' ? 'maintenance' : 'out';
      const statusLabel = v.status === 'ACTIVE'
        ? LanguageManager.t('statusActive')
        : v.status === 'MAINTENANCE'
        ? LanguageManager.t('statusMaintenance')
        : LanguageManager.t('statusOutOfService');

      return `
        <tr>
          <td><span class="plate-badge">${v.licensePlate}</span></td>
          <td><strong>${v.make}</strong> ${v.model} (${v.year})</td>
          <td>${v.fuelType}</td>
          <td><strong>${v.currentOdometerKm.toLocaleString()}</strong> km</td>
          <td>${v.itvExpirationDate}</td>
          <td>${v.nextMaintenanceKm.toLocaleString()} km</td>
          <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        </tr>
      `;
    }).join('');
  }

  private renderMaintenance(maintenance: MaintenanceRecord[], vehicles: Vehicle[]): void {
    const tbody = document.getElementById('maintenance-table-body');
    if (!tbody) return;

    if (maintenance.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</td></tr>`;
      return;
    }

    const vehicleMap = new Map(vehicles.map(v => [v.id, v.licensePlate]));

    tbody.innerHTML = maintenance.map(m => {
      const plate = vehicleMap.get(m.vehicleId) || m.vehicleId;
      const statusLabel = m.status === 'COMPLETED'
        ? LanguageManager.t('maintStatusCompleted')
        : m.status === 'SCHEDULED'
        ? LanguageManager.t('maintStatusScheduled')
        : LanguageManager.t('maintStatusCancelled');
      const statusClass = m.status === 'COMPLETED' ? 'active' : 'maintenance';

      return `
        <tr>
          <td><span class="plate-badge">${plate}</span></td>
          <td><strong>${m.type}</strong></td>
          <td>${m.scheduledDate}</td>
          <td>${m.workshopName || '-'}</td>
          <td><strong>${m.costEur.toFixed(2)} €</strong></td>
          <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        </tr>
      `;
    }).join('');
  }

  private renderFuelLogs(logs: FuelLog[]): void {
    const tbody = document.getElementById('fuel-table-body');
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(f => `
      <tr>
        <td>${f.date}</td>
        <td><span class="plate-badge">4589-LDR</span></td>
        <td><strong>${f.odometerKm.toLocaleString()}</strong> km</td>
        <td>${f.liters.toFixed(2)} L</td>
        <td><strong>${f.costEur.toFixed(2)} €</strong></td>
        <td>${f.fuelStation || '-'}</td>
      </tr>
    `).join('');
  }

  private updateKpis(vehicles: Vehicle[], maintenance: MaintenanceRecord[], fuelLogs: FuelLog[]): void {
    const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
    const itvAlerts = vehicles.filter(v => {
      const exp = new Date(v.itvExpirationDate);
      const now = new Date();
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }).length;
    const pendingMaint = maintenance.filter(m => m.status === 'SCHEDULED').length;
    const totalFuel = fuelLogs.reduce((acc, curr) => acc + curr.costEur, 0);

    const kpiActive = document.getElementById('kpi-active-vehicles');
    if (kpiActive) kpiActive.textContent = String(activeVehicles);

    const kpiItv = document.getElementById('kpi-itv-alerts');
    if (kpiItv) kpiItv.textContent = String(itvAlerts);

    const kpiMaint = document.getElementById('kpi-maintenance-alerts');
    if (kpiMaint) kpiMaint.textContent = String(pendingMaint);

    const kpiFuel = document.getElementById('kpi-fuel-expense');
    if (kpiFuel) kpiFuel.textContent = `${totalFuel.toFixed(2)} €`;

    this.renderAlerts();
  }

  private renderAlerts(): void {
    const alertsContainer = document.getElementById('alerts-list');
    if (!alertsContainer) return;

    alertsContainer.innerHTML = `
      <div class="alert-item">
        <div class="alert-left">
          <span class="alert-icon">⚠️</span>
          <div>
            <strong>1945-KBC (Peugeot Partner)</strong>
            <p style="font-size: 0.8rem; color: #991B1B;">Venciment ITV el 30/10/2026 (&lt; 10 dies restants)</p>
          </div>
        </div>
        <span class="status-badge out">URGENT</span>
      </div>
      <div class="alert-item">
        <div class="alert-left">
          <span class="alert-icon">🔧</span>
          <div>
            <strong>1945-KBC (Peugeot Partner)</strong>
            <p style="font-size: 0.8rem; color: #92400E;">Canvi de pastilles de fre programat per al 25/10/2026</p>
          </div>
        </div>
        <span class="status-badge maintenance">PROGRAMAT</span>
      </div>
      <div class="alert-item">
        <div class="alert-left">
          <span class="alert-icon">📅</span>
          <div>
            <strong>4589-LDR (Renault Trafic)</strong>
            <p style="font-size: 0.8rem; color: #64748B;">Pròxima revisió d'oli als 90.000 km (actual: 84.500 km)</p>
          </div>
        </div>
        <span class="status-badge active">EN CURS</span>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
