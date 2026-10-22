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

  // Cached in-memory data for instant re-translation on language change
  private cachedVehicles: Vehicle[] = [];
  private cachedMaintenance: MaintenanceRecord[] = [];
  private cachedFuelLogs: FuelLog[] = [];

  public init(): void {
    // 1. Initialize Strict i18n and Custom Language Selector
    LanguageManager.init();

    // 2. Setup All UI Event Handlers (Login, demo buttons, modals, tabs, tenant)
    this.setupEventListeners();
    this.setupModals();

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

        // Show Application Shell and Hide Login View
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

    this.cachedVehicles = [];
    this.cachedMaintenance = [];
    this.cachedFuelLogs = [];

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
      this.showToast(LanguageManager.t('btnLogout'), 'success');
    });

    // 4. Tenant Switcher
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

    // 6. Comprehensive Re-render on Language Changed Event
    document.addEventListener('app:language-changed', () => {
      this.updateHeaderUserInfo();
      this.syncTenantSelect();

      // Immediately re-render all tables, alerts, and KPIs with the active language
      this.renderVehicles(this.cachedVehicles);
      this.renderMaintenance(this.cachedMaintenance, this.cachedVehicles);
      this.renderFuelLogs(this.cachedFuelLogs);
      this.updateKpis(this.cachedVehicles, this.cachedMaintenance, this.cachedFuelLogs);
      this.renderAlerts();
      this.populateModalVehicleDropdowns();
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

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.token) {
        const errorCode = data?.code || 'loginErrorInvalid';
        throw new Error(LanguageManager.t(errorCode));
      }

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
      const userName = this.currentUser?.fullName || '';
      this.showToast(`${LanguageManager.t('welcomeBack')}${userName ? ', ' + userName : ''}`, 'success');
    } catch (err: any) {
      if (errorBanner) {
        errorBanner.style.display = 'flex';
        if (errorText) {
          errorText.textContent = err.message || LanguageManager.t('loginErrorInvalid');
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

      this.cachedVehicles = vehiclesRes && vehiclesRes.ok ? await vehiclesRes.json() : [];
      this.cachedMaintenance = maintRes && maintRes.ok ? await maintRes.json() : [];
      this.cachedFuelLogs = fuelRes && fuelRes.ok ? await fuelRes.json() : [];

      this.renderVehicles(this.cachedVehicles);
      this.renderMaintenance(this.cachedMaintenance, this.cachedVehicles);
      this.renderFuelLogs(this.cachedFuelLogs);
      this.updateKpis(this.cachedVehicles, this.cachedMaintenance, this.cachedFuelLogs);
      this.renderAlerts();
      this.populateModalVehicleDropdowns();
    } catch (err) {
      console.warn('Fallback loading data locally', err);
      this.showToast(LanguageManager.t('error_network'), 'error');
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
      
      // Translated Status & Fuel Type
      const statusLabel = LanguageManager.t('status_' + v.status.toLowerCase());
      const fuelLabel = LanguageManager.t('fuel_' + v.fuelType.toLowerCase());

      return `
        <tr>
          <td><span class="plate-badge">${v.licensePlate}</span></td>
          <td><strong>${v.make}</strong> ${v.model} (${v.year})</td>
          <td>${fuelLabel}</td>
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
      
      // Translated Maintenance Type & Status
      const typeLabel = LanguageManager.t('maint_type_' + m.type.toLowerCase());
      const statusLabel = LanguageManager.t('maint_status_' + m.status.toLowerCase());
      const statusClass = m.status === 'COMPLETED' ? 'active' : m.status === 'SCHEDULED' ? 'maintenance' : 'out';

      return `
        <tr>
          <td><span class="plate-badge">${plate}</span></td>
          <td><strong>${typeLabel}</strong></td>
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

    const vehicleMap = new Map(this.cachedVehicles.map(v => [v.id, v.licensePlate]));

    tbody.innerHTML = logs.map(f => {
      const plate = vehicleMap.get(f.vehicleId) || '4589-LDR';
      return `
        <tr>
          <td>${f.date}</td>
          <td><span class="plate-badge">${plate}</span></td>
          <td><strong>${f.odometerKm.toLocaleString()}</strong> km</td>
          <td>${f.liters.toFixed(2)} L</td>
          <td><strong>${f.costEur.toFixed(2)} €</strong></td>
          <td>${f.fuelStation || '-'}</td>
        </tr>
      `;
    }).join('');
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
  }

  private renderAlerts(): void {
    const alertsContainer = document.getElementById('alerts-list');
    if (!alertsContainer) return;

    const urgentBadge = LanguageManager.t('badge_urgent');
    const scheduledBadge = LanguageManager.t('badge_scheduled');
    const inProgressBadge = LanguageManager.t('badge_in_progress');

    // 100% Translated alerts using localized string templates
    const itvAlertText = LanguageManager.t('alert_itv_imminent', {
      date: '30/10/2026',
      days: '< 10'
    });

    const brakeTypeLabel = LanguageManager.t('maint_type_brakes');
    const maintAlertText = LanguageManager.t('alert_maint_scheduled', {
      type: brakeTypeLabel,
      date: '25/10/2026'
    });

    const oilAlertText = LanguageManager.t('alert_oil_odometer', {
      targetKm: '90.000',
      curKm: '84.500'
    });

    alertsContainer.innerHTML = `
      <div class="alert-item">
        <div class="alert-left">
          <span class="alert-icon">⚠️</span>
          <div>
            <strong>1945-KBC (Peugeot Partner)</strong>
            <p style="font-size: 0.8rem; color: #991B1B;">${itvAlertText}</p>
          </div>
        </div>
        <span class="status-badge out">${urgentBadge}</span>
      </div>
      <div class="alert-item">
        <div class="alert-left">
          <span class="alert-icon">🔧</span>
          <div>
            <strong>1945-KBC (Peugeot Partner)</strong>
            <p style="font-size: 0.8rem; color: #92400E;">${maintAlertText}</p>
          </div>
        </div>
        <span class="status-badge maintenance">${scheduledBadge}</span>
      </div>
      <div class="alert-item">
        <div class="alert-left">
          <span class="alert-icon">📅</span>
          <div>
            <strong>4589-LDR (Renault Trafic)</strong>
            <p style="font-size: 0.8rem; color: #64748B;">${oilAlertText}</p>
          </div>
        </div>
        <span class="status-badge active">${inProgressBadge}</span>
      </div>
    `;
  }

  private setupModals(): void {
    // Open modal buttons
    document.getElementById('btn-add-vehicle')?.addEventListener('click', () => {
      this.openModal('modal-vehicle');
    });

    document.getElementById('btn-add-maintenance')?.addEventListener('click', () => {
      this.populateModalVehicleDropdowns();
      this.openModal('modal-maintenance');
    });

    document.getElementById('btn-add-fuel')?.addEventListener('click', () => {
      this.populateModalVehicleDropdowns();
      this.openModal('modal-fuel');
    });

    // Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
      });
    });

    // Backdrop click close
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    });

    // Forms submission with localized feedback
    this.setupModalForms();
  }

  private openModal(id: string): void {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
  }

  private populateModalVehicleDropdowns(): void {
    const maintVehSelect = document.getElementById('maint-veh') as HTMLSelectElement;
    const fuelVehSelect = document.getElementById('fuel-veh') as HTMLSelectElement;

    const optionsHtml = this.cachedVehicles.map(v => 
      `<option value="${v.id}">${v.licensePlate} - ${v.make} ${v.model}</option>`
    ).join('');

    if (maintVehSelect) maintVehSelect.innerHTML = optionsHtml;
    if (fuelVehSelect) fuelVehSelect.innerHTML = optionsHtml;
  }

  private setupModalForms(): void {
    // 1. New Vehicle Form
    const vehicleForm = document.getElementById('form-new-vehicle') as HTMLFormElement;
    vehicleForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const payload = {
          tenantId: this.currentTenant,
          licensePlate: (document.getElementById('veh-plate') as HTMLInputElement).value.trim(),
          vin: (document.getElementById('veh-vin') as HTMLInputElement).value.trim(),
          make: (document.getElementById('veh-make') as HTMLInputElement).value.trim(),
          model: (document.getElementById('veh-model') as HTMLInputElement).value.trim(),
          year: Number((document.getElementById('veh-year') as HTMLInputElement).value),
          fuelType: (document.getElementById('veh-fuel') as HTMLSelectElement).value,
          currentOdometerKm: Number((document.getElementById('veh-odometer') as HTMLInputElement).value),
          nextMaintenanceKm: Number((document.getElementById('veh-next-km') as HTMLInputElement).value),
          itvExpirationDate: (document.getElementById('veh-itv') as HTMLInputElement).value,
          status: (document.getElementById('veh-status') as HTMLSelectElement).value,
          notes: (document.getElementById('veh-notes') as HTMLTextAreaElement).value
        };

        const res = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(LanguageManager.t('error_internal'));

        vehicleForm.reset();
        document.getElementById('modal-vehicle')?.classList.remove('open');
        this.showToast(LanguageManager.t('successVehicleCreated'), 'success');
        await this.loadData();
      } catch (err: any) {
        this.showToast(err.message || LanguageManager.t('error_internal'), 'error');
      }
    });

    // 2. New Maintenance Form
    const maintForm = document.getElementById('form-new-maintenance') as HTMLFormElement;
    maintForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const payload = {
          tenantId: this.currentTenant,
          vehicleId: (document.getElementById('maint-veh') as HTMLSelectElement).value,
          type: (document.getElementById('maint-type') as HTMLSelectElement).value,
          scheduledDate: (document.getElementById('maint-date') as HTMLInputElement).value,
          workshopName: (document.getElementById('maint-workshop') as HTMLInputElement).value.trim(),
          costEur: Number((document.getElementById('maint-cost') as HTMLInputElement).value),
          status: (document.getElementById('maint-status') as HTMLSelectElement).value
        };

        const res = await fetch('/api/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(LanguageManager.t('error_internal'));

        maintForm.reset();
        document.getElementById('modal-maintenance')?.classList.remove('open');
        this.showToast(LanguageManager.t('successMaintenanceCreated'), 'success');
        await this.loadData();
      } catch (err: any) {
        this.showToast(err.message || LanguageManager.t('error_internal'), 'error');
      }
    });

    // 3. New Fuel Form
    const fuelForm = document.getElementById('form-new-fuel') as HTMLFormElement;
    fuelForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const payload = {
          tenantId: this.currentTenant,
          vehicleId: (document.getElementById('fuel-veh') as HTMLSelectElement).value,
          driverId: this.currentUser?.id || 'usr_driver_joan',
          date: (document.getElementById('fuel-date') as HTMLInputElement).value,
          odometerKm: Number((document.getElementById('fuel-odometer') as HTMLInputElement).value),
          liters: Number((document.getElementById('fuel-liters') as HTMLInputElement).value),
          costEur: Number((document.getElementById('fuel-price') as HTMLInputElement).value),
          fuelStation: (document.getElementById('fuel-station') as HTMLInputElement).value.trim()
        };

        const res = await fetch('/api/fuel-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(LanguageManager.t('error_internal'));

        fuelForm.reset();
        document.getElementById('modal-fuel')?.classList.remove('open');
        this.showToast(LanguageManager.t('successFuelLogged'), 'success');
        await this.loadData();
      } catch (err: any) {
        this.showToast(err.message || LanguageManager.t('error_internal'), 'error');
      }
    });
  }

  private showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const toast = document.getElementById('app-toast');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast || !toastMsg) return;

    toast.className = `toast-notification ${type}`;
    if (toastIcon) {
      toastIcon.textContent = type === 'success' ? '✓' : '⚠️';
    }
    toastMsg.textContent = message;
    toast.style.display = 'flex';

    setTimeout(() => {
      toast.style.display = 'none';
    }, 3500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
