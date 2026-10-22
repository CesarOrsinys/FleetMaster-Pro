import { LanguageManager } from './ui/i18n/LanguageManager.js';
import { LoadingService } from './ui/services/LoadingService.js';
import { PassportCrypto } from './core/security/PassportCrypto.js';
import { Vehicle } from './core/domain/Vehicle.js';
import { MaintenanceRecord } from './core/domain/MaintenanceRecord.js';
import { FuelLog } from './core/domain/FuelLog.js';
import { TrafficFine } from './core/domain/TrafficFine.js';
import { SafeUser } from './core/domain/User.js';

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
  private cachedDrivers: SafeUser[] = [];
  private cachedFines: TrafficFine[] = [];

  public init(): void {
    // 0. Initialize Global HTTP Service Loader (Car Spinner)
    LoadingService.init();

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
    this.cachedDrivers = [];
    this.cachedFines = [];

    // Clear any table and feed data
    const vehiclesTbody = document.getElementById('vehicles-table-body');
    if (vehiclesTbody) vehiclesTbody.innerHTML = '';
    const itvTbody = document.getElementById('itv-table-body');
    if (itvTbody) itvTbody.innerHTML = '';
    const maintTbody = document.getElementById('maintenance-table-body');
    if (maintTbody) maintTbody.innerHTML = '';
    const fuelTbody = document.getElementById('fuel-table-body');
    if (fuelTbody) fuelTbody.innerHTML = '';
    const driversTbody = document.getElementById('drivers-table-body');
    if (driversTbody) driversTbody.innerHTML = '';
    const finesTbody = document.getElementById('fines-table-body');
    if (finesTbody) finesTbody.innerHTML = '';

    ['vehicles', 'itv', 'maintenance', 'fuel', 'drivers', 'fines'].forEach(key => {
      const feed = document.getElementById(`${key}-cards-feed`);
      if (feed) feed.innerHTML = '';
    });
  }

  private showApplicationShell(): void {
    const loginView = document.getElementById('view-login');
    const appShell = document.getElementById('app-shell');

    if (loginView) loginView.style.display = 'none';
    if (appShell) appShell.style.display = 'flex';

    this.updateHeaderUserInfo();
    this.syncTenantSelect();
    this.renderDriverPortalBanner();
  }

  private updateHeaderUserInfo(): void {
    if (!this.currentUser) return;

    const avatarEl = document.getElementById('header-user-avatar');
    const dropdownAvatarEl = document.getElementById('dropdown-user-avatar');
    const nameEl = document.getElementById('header-user-name');
    const dropdownNameEl = document.getElementById('dropdown-user-name');
    const roleEl = document.getElementById('header-user-role');

    const initials = this.currentUser.fullName
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    if (avatarEl) avatarEl.textContent = initials || 'US';
    if (dropdownAvatarEl) dropdownAvatarEl.textContent = initials || 'US';
    if (nameEl) nameEl.textContent = this.currentUser.fullName;
    if (dropdownNameEl) dropdownNameEl.textContent = this.currentUser.fullName;

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

    // 3. User Avatar Menu Dropdown Toggle (Staff-Incidents-Manager Architecture)
    const userMenuWrapper = document.getElementById('user-menu-wrapper');
    const btnUserAvatar = document.getElementById('btn-user-avatar');

    btnUserAvatar?.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenuWrapper?.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (userMenuWrapper && !userMenuWrapper.contains(e.target as Node)) {
        userMenuWrapper.classList.remove('open');
      }
    });

    // 4. Logout Handler
    const logoutBtn = document.getElementById('btn-logout');
    logoutBtn?.addEventListener('click', () => {
      userMenuWrapper?.classList.remove('open');
      this.clearSession();
      this.showLoginView();
      this.showToast(LanguageManager.t('btnLogout'), 'success');
    });

    // 5. Tenant Switcher
    const tenantSelect = document.getElementById('tenant-select') as HTMLSelectElement;
    tenantSelect?.addEventListener('change', () => {
      this.currentTenant = tenantSelect.value;
      localStorage.setItem('fleetmaster_tenant', this.currentTenant);
      this.loadData();
    });

    // 5.1. Refresh Data Button (Manual service reload)
    const refreshBtn = document.getElementById('btn-refresh-data');
    refreshBtn?.addEventListener('click', async () => {
      if (refreshBtn.classList.contains('refreshing')) return;
      refreshBtn.classList.add('refreshing');
      try {
        await this.loadData();
        this.showToast(LanguageManager.t('successDataRefreshed'), 'success');
      } catch (err: any) {
        this.showToast(err?.message || LanguageManager.t('error_internal'), 'error');
      } finally {
        setTimeout(() => {
          refreshBtn.classList.remove('refreshing');
        }, 600);
      }
    });

    // 6. Tab Navigation
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

    // 7. Mobile View Mode Switchers (Cards vs Table)
    this.setupViewModeSwitchers();

    // 8. Comprehensive Re-render on Language Changed Event
    document.addEventListener('app:language-changed', () => {
      this.updateHeaderUserInfo();
      this.syncTenantSelect();

      // Immediately re-render all tables, alerts, and KPIs with the active language
      this.renderVehicles(this.cachedVehicles);
      this.renderDrivers(this.cachedDrivers, this.cachedVehicles);
      this.renderFines(this.cachedFines, this.cachedVehicles, this.cachedDrivers);
      this.renderDriverPortalBanner();
      this.renderItvControl(this.cachedVehicles);
      this.renderMaintenance(this.cachedMaintenance, this.cachedVehicles);
      this.renderFuelLogs(this.cachedFuelLogs);
      this.updateKpis(this.cachedVehicles, this.cachedMaintenance, this.cachedFuelLogs);
      this.renderAlerts();
      this.populateModalVehicleDropdowns();
      this.populateModalDriverDropdowns();
    });
  }

  private setupViewModeSwitchers(): void {
    document.querySelectorAll<HTMLElement>('.view-mode-switcher').forEach(switcher => {
      const target = switcher.getAttribute('data-target');
      if (!target) return;

      const buttons = switcher.querySelectorAll<HTMLButtonElement>('.view-mode-btn');
      const cardsFeed = document.getElementById(`${target}-cards-feed`);
      const tableContainer = document.getElementById(`${target}-table-container`);

      const applyMode = (mode: string) => {
        buttons.forEach(b => {
          if (b.getAttribute('data-mode') === mode) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });

        if (mode === 'cards') {
          if (cardsFeed) cardsFeed.style.display = 'grid';
          if (tableContainer) tableContainer.style.display = 'none';
        } else {
          if (cardsFeed) cardsFeed.style.display = 'none';
          if (tableContainer) tableContainer.style.display = 'block';
        }
      };

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-mode');
          if (mode) applyMode(mode);
        });
      });

      // Default to CARDS view as requested
      applyMode('cards');
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
      // 1. Generate encrypted Auth Passport (AES-256-GCM envelope)
      // Cleartext username and password are NEVER transmitted in the request payload
      const passport = await PassportCrypto.createAuthPassport({ username, password });

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passport })
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

      const [vehiclesRes, maintRes, fuelRes, driversRes, finesRes] = await Promise.all([
        fetch(`/api/vehicles?tenantId=${this.currentTenant}`, { headers }).catch(() => null),
        fetch(`/api/maintenance?tenantId=${this.currentTenant}`, { headers }).catch(() => null),
        fetch(`/api/fuel-logs?tenantId=${this.currentTenant}`, { headers }).catch(() => null),
        fetch(`/api/drivers?tenantId=${this.currentTenant}`, { headers }).catch(() => null),
        fetch(`/api/fines?tenantId=${this.currentTenant}`, { headers }).catch(() => null)
      ]);

      this.cachedVehicles = vehiclesRes && vehiclesRes.ok ? await vehiclesRes.json() : [];
      this.cachedMaintenance = maintRes && maintRes.ok ? await maintRes.json() : [];
      this.cachedFuelLogs = fuelRes && fuelRes.ok ? await fuelRes.json() : [];
      this.cachedDrivers = driversRes && driversRes.ok ? await driversRes.json() : [];
      this.cachedFines = finesRes && finesRes.ok ? await finesRes.json() : [];

      this.renderVehicles(this.cachedVehicles);
      this.renderDrivers(this.cachedDrivers, this.cachedVehicles);
      this.renderFines(this.cachedFines, this.cachedVehicles, this.cachedDrivers);
      this.renderDriverPortalBanner();
      this.renderItvControl(this.cachedVehicles);
      this.renderMaintenance(this.cachedMaintenance, this.cachedVehicles);
      this.renderFuelLogs(this.cachedFuelLogs);
      this.updateKpis(this.cachedVehicles, this.cachedMaintenance, this.cachedFuelLogs);
      this.renderAlerts();
      this.populateModalVehicleDropdowns();
      this.populateModalDriverDropdowns();
    } catch (err) {
      console.warn('Fallback loading data locally', err);
      this.showToast(LanguageManager.t('error_network'), 'error');
    }
  }

  private renderVehicles(vehicles: Vehicle[]): void {
    const tbody = document.getElementById('vehicles-table-body');
    const cardsFeed = document.getElementById('vehicles-cards-feed');

    if (tbody) {
      if (vehicles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</td></tr>`;
      } else {
        tbody.innerHTML = vehicles.map(v => {
          const statusClass = v.status === 'ACTIVE' ? 'active' : v.status === 'MAINTENANCE' ? 'maintenance' : 'out';
          const statusLabel = LanguageManager.t('status_' + v.status.toLowerCase());
          const fuelLabel = LanguageManager.t('fuel_' + v.fuelType.toLowerCase());
          const assignedDriver = this.cachedDrivers.find(d => d.id === v.assignedDriverId);
          const driverHtml = assignedDriver 
            ? `<span>👤 <strong>${assignedDriver.fullName}</strong></span>` 
            : `<span style="color:#94A3B8; font-style:italic;">${LanguageManager.t('driverUnassigned')}</span>`;

          return `
            <tr>
              <td><span class="plate-badge">${v.licensePlate}</span></td>
              <td><strong>${v.make}</strong> ${v.model} (${v.year})</td>
              <td>${driverHtml}</td>
              <td>${fuelLabel}</td>
              <td><strong>${v.currentOdometerKm.toLocaleString()}</strong> km</td>
              <td>${v.itvExpirationDate}</td>
              <td>${v.nextMaintenanceKm.toLocaleString()} km</td>
              <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
            </tr>
          `;
        }).join('');
      }
    }

    if (cardsFeed) {
      if (vehicles.length === 0) {
        cardsFeed.innerHTML = `<div style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</div>`;
      } else {
        cardsFeed.innerHTML = vehicles.map(v => {
          const statusClass = v.status === 'ACTIVE' ? 'active' : v.status === 'MAINTENANCE' ? 'maintenance' : 'out';
          const statusLabel = LanguageManager.t('status_' + v.status.toLowerCase());
          const fuelLabel = LanguageManager.t('fuel_' + v.fuelType.toLowerCase());
          const assignedDriver = this.cachedDrivers.find(d => d.id === v.assignedDriverId);
          const driverHtml = assignedDriver 
            ? `<span>👤 <strong>${assignedDriver.fullName}</strong></span>` 
            : `<span style="color:#94A3B8; font-style:italic;">${LanguageManager.t('driverUnassigned')}</span>`;

          return `
            <div class="detail-card" data-vehicle-id="${v.id}">
              <div class="detail-card-header">
                <span class="plate-badge">${v.licensePlate}</span>
                <span class="status-badge ${statusClass}">${statusLabel}</span>
              </div>
              <div class="detail-card-title">${v.make} ${v.model} (${v.year})</div>
              <div class="detail-card-grid">
                <div class="detail-card-item full-width">
                  <span class="detail-label">${LanguageManager.t('colAssignedDriver')}</span>
                  <span class="detail-value" style="display:flex; align-items:center; gap:6px;">
                    ${driverHtml}
                  </span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colFuelType')}</span>
                  <span class="detail-value">${fuelLabel}</span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colOdometer')}</span>
                  <span class="detail-value">${v.currentOdometerKm.toLocaleString()} km</span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colItvDate')}</span>
                  <span class="detail-value">${v.itvExpirationDate}</span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colNextService')}</span>
                  <span class="detail-value">${v.nextMaintenanceKm.toLocaleString()} km</span>
                </div>
                ${v.notes ? `
                <div class="detail-card-item full-width">
                  <span class="detail-label">${LanguageManager.t('colObservations')}</span>
                  <span class="detail-value" style="color: #475569; font-weight:500;">
                    ${LanguageManager.translateObservation(v.notes)}
                  </span>
                </div>
                ` : ''}
              </div>
              <div class="detail-card-footer">
                <span>👁️ ${LanguageManager.t('viewDetailsBtn')}</span>
                <span>👉</span>
              </div>
            </div>
          `;
        }).join('');

        // Wire mobile cards clicks
        cardsFeed.querySelectorAll<HTMLElement>('.detail-card').forEach(card => {
          card.addEventListener('click', () => {
            const vehId = card.getAttribute('data-vehicle-id');
            const vehicle = this.cachedVehicles.find(v => v.id === vehId);
            if (vehicle) this.openItvDetails(vehicle);
          });
        });
      }
    }
  }

  // 2B. GESTIÓ DE CONDUCTORS (DRIVERS FEED & TABLE)
  private renderDrivers(drivers: SafeUser[], vehicles: Vehicle[]): void {
    const tbody = document.getElementById('drivers-table-body');
    const cardsFeed = document.getElementById('drivers-cards-feed');
    const kpiTotal = document.getElementById('kpi-total-drivers');
    const kpiAssigned = document.getElementById('kpi-assigned-drivers');
    const kpiUnassigned = document.getElementById('kpi-unassigned-drivers');

    const assignedDriversCount = drivers.filter(d => 
      vehicles.some(v => v.assignedDriverId === d.id)
    ).length;
    const unassignedCount = drivers.length - assignedDriversCount;

    if (kpiTotal) kpiTotal.textContent = String(drivers.length);
    if (kpiAssigned) kpiAssigned.textContent = String(assignedDriversCount);
    if (kpiUnassigned) kpiUnassigned.textContent = String(Math.max(0, unassignedCount));

    // 1. Table View
    if (tbody) {
      if (drivers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</td></tr>`;
      } else {
        tbody.innerHTML = drivers.map(d => {
          const assignedVeh = vehicles.find(v => v.assignedDriverId === d.id);
          const assignedVehHtml = assignedVeh 
            ? `<span><span class="plate-badge">${assignedVeh.licensePlate}</span> <strong>${assignedVeh.make}</strong> ${assignedVeh.model}</span>`
            : `<span style="color:#94A3B8; font-style:italic;">${LanguageManager.t('driverUnassigned')}</span>`;
          
          const initials = d.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
          const statusClass = d.active ? 'active' : 'out';
          const statusLabel = d.active ? LanguageManager.t('status_active') : LanguageManager.t('status_out_of_service');

          return `
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="driver-avatar-circle">${initials}</span>
                  <div>
                    <strong>${d.fullName}</strong>
                    <div style="font-size:0.75rem; color:#64748B;">@${d.username}</div>
                  </div>
                </div>
              </td>
              <td><strong>${d.licenseNumber || '-'}</strong></td>
              <td>${d.phone || '-'}</td>
              <td><a href="mailto:${d.email}" style="color:var(--primary); text-decoration:none;">${d.email}</a></td>
              <td>${assignedVehHtml}</td>
              <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
            </tr>
          `;
        }).join('');
      }
    }

    // 2. Cards Feed (Default View)
    if (cardsFeed) {
      if (drivers.length === 0) {
        cardsFeed.innerHTML = `<div style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</div>`;
      } else {
        cardsFeed.innerHTML = drivers.map(d => {
          const assignedVeh = vehicles.find(v => v.assignedDriverId === d.id);
          const initials = d.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
          const statusClass = d.active ? 'active' : 'out';
          const statusLabel = d.active ? LanguageManager.t('status_active') : LanguageManager.t('status_out_of_service');

          return `
            <div class="detail-card">
              <div class="detail-card-header">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="driver-avatar-circle">${initials}</span>
                  <div>
                    <div class="detail-card-title" style="margin-bottom:0;">${d.fullName}</div>
                    <span style="font-size:0.72rem; color:#64748B;">@${d.username}</span>
                  </div>
                </div>
                <span class="status-badge ${statusClass}">${statusLabel}</span>
              </div>
              <div class="detail-card-grid">
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colLicenseNumber')}</span>
                  <span class="detail-value">${d.licenseNumber || '-'}</span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colPhone')}</span>
                  <span class="detail-value">${d.phone || '-'}</span>
                </div>
                <div class="detail-card-item full-width">
                  <span class="detail-label">${LanguageManager.t('colEmail')}</span>
                  <span class="detail-value">${d.email}</span>
                </div>
                <div class="detail-card-item full-width">
                  <span class="detail-label">${LanguageManager.t('colAssignedVehicle')}</span>
                  <div style="margin-top:2px;">
                    ${assignedVeh 
                      ? `<span class="plate-badge">${assignedVeh.licensePlate}</span> <strong>${assignedVeh.make}</strong> ${assignedVeh.model}`
                      : `<span style="color:#94A3B8; font-style:italic;">${LanguageManager.t('driverUnassigned')}</span>`}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  // 5. GESTIÓ DE MULTES (FINES CARDS & TABLE)
  private renderFines(fines: TrafficFine[], vehicles: Vehicle[], drivers: SafeUser[]): void {
    const tbody = document.getElementById('fines-table-body');
    const cardsFeed = document.getElementById('fines-cards-feed');
    const kpiTotal = document.getElementById('kpi-total-fines');
    const kpiPending = document.getElementById('kpi-pending-fines');
    const kpiAmount = document.getElementById('kpi-total-fines-amount');

    const pendingCount = fines.filter(f => f.status === 'PENDING').length;
    const totalAmount = fines.reduce((sum, f) => sum + f.amountEur, 0);

    if (kpiTotal) kpiTotal.textContent = String(fines.length);
    if (kpiPending) kpiPending.textContent = String(pendingCount);
    if (kpiAmount) kpiAmount.textContent = `${totalAmount.toFixed(2)} €`;

    // 1. Table View
    if (tbody) {
      if (fines.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</td></tr>`;
      } else {
        tbody.innerHTML = fines.map(f => {
          const veh = vehicles.find(v => v.id === f.vehicleId);
          const driver = drivers.find(d => d.id === f.driverId);
          const statusClass = f.status === 'PAID' ? 'active' : f.status === 'PENDING' ? 'out' : 'maintenance';
          const statusLabel = LanguageManager.t('fine_status_' + f.status.toLowerCase());
          const translatedReason = LanguageManager.translateObservation(f.reason);

          return `
            <tr>
              <td><strong>${f.date}</strong></td>
              <td>${veh ? `<span class="plate-badge">${veh.licensePlate}</span> ${veh.make} ${veh.model}` : f.vehicleId}</td>
              <td><strong>${driver ? driver.fullName : LanguageManager.t('optNoDriver')}</strong></td>
              <td style="max-width:260px;">${translatedReason}</td>
              <td><span class="fine-amount-badge ${f.status === 'PAID' ? 'paid' : ''}">${f.amountEur.toFixed(2)} €</span></td>
              <td>${f.organism || 'DGT'}</td>
              <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
              <td>
                ${f.status === 'PENDING' 
                  ? `<button type="button" class="btn-secondary btn-pay-fine" data-fine-id="${f.id}" style="padding:4px 10px; font-size:0.78rem;">
                       <span>💳</span> <span>${LanguageManager.t('btnMarkFinePaid')}</span>
                     </button>`
                  : `<span style="color:#059669; font-weight:700; font-size:0.8rem;">✓ ${LanguageManager.t('fine_status_paid')}</span>`}
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 2. Cards Feed (Default View - Cards for Cars and Drivers as requested)
    if (cardsFeed) {
      if (fines.length === 0) {
        cardsFeed.innerHTML = `<div style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</div>`;
      } else {
        cardsFeed.innerHTML = fines.map(f => {
          const veh = vehicles.find(v => v.id === f.vehicleId);
          const driver = drivers.find(d => d.id === f.driverId);
          const statusClass = f.status === 'PAID' ? 'active' : f.status === 'PENDING' ? 'out' : 'maintenance';
          const statusLabel = LanguageManager.t('fine_status_' + f.status.toLowerCase());
          const translatedReason = LanguageManager.translateObservation(f.reason);

          return `
            <div class="detail-card" style="border-left: 4px solid ${f.status === 'PAID' ? '#10B981' : '#EF4444'};">
              <div class="detail-card-header">
                <div style="display:flex; align-items:center; gap:8px;">
                  ${veh ? `<span class="plate-badge">${veh.licensePlate}</span>` : ''}
                  <strong style="color:var(--slate-800);">${veh ? `${veh.make} ${veh.model}` : f.vehicleId}</strong>
                </div>
                <span class="status-badge ${statusClass}">${statusLabel}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-top:4px;">
                <div class="detail-card-title" style="font-size:1rem; color:var(--slate-900); flex:1; padding-right:10px;">
                  ${translatedReason}
                </div>
                <span class="fine-amount-badge ${f.status === 'PAID' ? 'paid' : ''}">${f.amountEur.toFixed(2)} €</span>
              </div>
              <div class="detail-card-grid">
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colDriver')}</span>
                  <span class="detail-value" style="display:flex; align-items:center; gap:6px;">
                    👤 <strong>${driver ? driver.fullName : LanguageManager.t('optNoDriver')}</strong>
                  </span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colDate')}</span>
                  <span class="detail-value">📅 ${f.date}</span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colFineOrganism')}</span>
                  <span class="detail-value">🏛️ ${f.organism || 'DGT'}</span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colStatus')}</span>
                  <span class="detail-value">${statusLabel}</span>
                </div>
                ${f.notes ? `
                <div class="detail-card-item full-width">
                  <span class="detail-label">${LanguageManager.t('colObservations')}</span>
                  <span class="detail-value" style="color:#475569; font-weight:500;">
                    ${LanguageManager.translateObservation(f.notes)}
                  </span>
                </div>
                ` : ''}
              </div>
              <div class="detail-card-footer" style="padding-top:4px;">
                ${f.status === 'PENDING' 
                  ? `<button type="button" class="btn-primary btn-pay-fine" data-fine-id="${f.id}" style="padding:6px 12px; font-size:0.8rem; background:#0F766E;">
                       <span>💳</span> <span>${LanguageManager.t('btnMarkFinePaid')}</span>
                     </button>`
                  : `<span style="color:#059669; font-weight:700;">✓ ${LanguageManager.t('fine_status_paid')}</span>`}
              </div>
            </div>
          `;
        }).join('');

        // Wire pay fine click handler
        cardsFeed.querySelectorAll<HTMLButtonElement>('.btn-pay-fine').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const fineId = btn.getAttribute('data-fine-id');
            if (fineId) await this.handleFineStatusChange(fineId, 'PAID');
          });
        });
      }
    }

    // Also wire pay fine in table
    tbody?.querySelectorAll<HTMLButtonElement>('.btn-pay-fine').forEach(btn => {
      btn.addEventListener('click', async () => {
        const fineId = btn.getAttribute('data-fine-id');
        if (fineId) await this.handleFineStatusChange(fineId, 'PAID');
      });
    });
  }

  private async handleFineStatusChange(fineId: string, newStatus: 'PAID' | 'PENDING' | 'APPEALED'): Promise<void> {
    try {
      const res = await fetch(`/api/fines/${fineId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error(LanguageManager.t('error_internal'));

      this.showToast(LanguageManager.t('successFinePaid'), 'success');
      await this.loadData();
    } catch (err: any) {
      this.showToast(err.message || LanguageManager.t('error_internal'), 'error');
    }
  }

  private renderDriverPortalBanner(): void {
    const banner = document.getElementById('driver-portal-banner');
    if (!banner) return;

    if (this.currentUser?.role === 'DRIVER') {
      banner.style.display = 'flex';
      const nameEl = document.getElementById('driver-portal-name');
      const plateEl = document.getElementById('driver-portal-plate');
      const modelEl = document.getElementById('driver-portal-veh-model');

      if (nameEl) nameEl.textContent = this.currentUser.fullName;

      // Find assigned vehicle
      const assignedVeh = this.cachedVehicles.find(v => v.assignedDriverId === this.currentUser?.id);
      if (assignedVeh) {
        if (plateEl) {
          plateEl.style.display = 'inline-block';
          plateEl.textContent = assignedVeh.licensePlate;
        }
        if (modelEl) modelEl.textContent = `${assignedVeh.make} ${assignedVeh.model}`;
      } else {
        if (plateEl) plateEl.style.display = 'none';
        if (modelEl) modelEl.textContent = LanguageManager.t('driverUnassigned');
      }

      // Quick fuel button
      const quickFuelBtn = document.getElementById('btn-driver-quick-fuel');
      if (quickFuelBtn) {
        quickFuelBtn.onclick = () => {
          this.populateModalVehicleDropdowns();
          if (assignedVeh) {
            const fuelVehSelect = document.getElementById('fuel-veh') as HTMLSelectElement;
            if (fuelVehSelect) {
              fuelVehSelect.value = assignedVeh.id;
              this.updateFuelFormHints();
            }
          }
          const dateInput = document.getElementById('fuel-date') as HTMLInputElement;
          if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
          }
          this.openModal('modal-fuel');
        };
      }
    } else {
      banner.style.display = 'none';
    }
  }

  private populateModalDriverDropdowns(): void {
    const vehDriverSelect = document.getElementById('veh-driver') as HTMLSelectElement;
    const driverAssignedVehSelect = document.getElementById('driver-assigned-veh') as HTMLSelectElement;
    const fineVehSelect = document.getElementById('fine-veh') as HTMLSelectElement;
    const fineDriverSelect = document.getElementById('fine-driver') as HTMLSelectElement;

    const noDriverOpt = `<option value="">${LanguageManager.t('optNoDriver')}</option>`;
    const driverOptions = this.cachedDrivers.map(d => 
      `<option value="${d.id}">${d.fullName} (${d.licenseNumber || d.username})</option>`
    ).join('');

    if (vehDriverSelect) {
      vehDriverSelect.innerHTML = noDriverOpt + driverOptions;
    }

    if (driverAssignedVehSelect) {
      const noVehOpt = `<option value="">${LanguageManager.t('optNoVehicle')}</option>`;
      const vehOpts = this.cachedVehicles.map(v => 
        `<option value="${v.id}">${v.licensePlate} - ${v.make} ${v.model}</option>`
      ).join('');
      driverAssignedVehSelect.innerHTML = noVehOpt + vehOpts;
    }

    if (fineVehSelect) {
      fineVehSelect.innerHTML = this.cachedVehicles.map(v => 
        `<option value="${v.id}">${v.licensePlate} - ${v.make} ${v.model}</option>`
      ).join('');
    }

    if (fineDriverSelect) {
      fineDriverSelect.innerHTML = driverOptions;
    }

    // Auto-select assigned driver when vehicle changes in fine modal
    fineVehSelect?.addEventListener('change', () => {
      const selectedVehId = fineVehSelect.value;
      const veh = this.cachedVehicles.find(v => v.id === selectedVehId);
      if (veh?.assignedDriverId && fineDriverSelect) {
        fineDriverSelect.value = veh.assignedDriverId;
      }
    });
  }

  // SUB-SECTION 1: SEPARATE ITV CONTROL AND EXPIRATION WITH OBSERVATIONS
  private renderItvControl(vehicles: Vehicle[]): void {
    const tbody = document.getElementById('itv-table-body');
    const cardsFeed = document.getElementById('itv-cards-feed');
    const now = new Date();

    const itvData = vehicles.map(v => {
      const expDate = new Date(v.itvExpirationDate);
      const diffMs = expDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let statusKey = 'itv_status_valid';
      let statusClass = 'active';

      if (daysRemaining < 0) {
        statusKey = 'itv_status_expired';
        statusClass = 'out';
      } else if (daysRemaining <= 7) {
        statusKey = 'itv_status_urgent';
        statusClass = 'out';
      } else if (daysRemaining <= 30) {
        statusKey = 'itv_status_expiring';
        statusClass = 'maintenance';
      }

      const statusBadgeText = LanguageManager.t(statusKey, { days: Math.abs(daysRemaining) });
      const rawObservations = v.notes || 'Revisió periòdica estàndard sense anomalies reportades.';
      const observations = LanguageManager.translateObservation(rawObservations);

      return {
        vehicle: v,
        expDateStr: v.itvExpirationDate,
        daysRemaining,
        statusBadgeText,
        statusClass,
        observations
      };
    });

    // 1. Table View
    if (tbody) {
      if (itvData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</td></tr>`;
      } else {
        tbody.innerHTML = itvData.map(item => `
          <tr>
            <td><span class="plate-badge">${item.vehicle.licensePlate}</span></td>
            <td><strong>${item.vehicle.make}</strong> ${item.vehicle.model}</td>
            <td><strong>${item.expDateStr}</strong></td>
            <td>${item.daysRemaining > 0 ? LanguageManager.t('unitDaysCount', { days: item.daysRemaining }) : `<span style="color:#EF4444; font-weight:700;">-${LanguageManager.t('unitDaysCount', { days: Math.abs(item.daysRemaining) })}</span>`}</td>
            <td><span class="status-badge ${item.statusClass}">${item.statusBadgeText}</span></td>
            <td style="max-width: 280px; font-size: 0.82rem; color: #475569;">
              <span title="${item.observations}">${item.observations}</span>
            </td>
            <td>
              <button type="button" class="btn-secondary btn-itv-row-details" data-veh-id="${item.vehicle.id}" style="padding: 4px 10px; font-size: 0.78rem;">
                <span>👁️</span> <span>${LanguageManager.t('viewDetailsBtn')}</span>
              </button>
            </td>
          </tr>
        `).join('');

        tbody.querySelectorAll<HTMLButtonElement>('.btn-itv-row-details').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-veh-id');
            const veh = this.cachedVehicles.find(v => v.id === id);
            if (veh) this.openItvDetails(veh);
          });
        });
      }
    }

    // 2. Mobile Cards Feed
    if (cardsFeed) {
      if (itvData.length === 0) {
        cardsFeed.innerHTML = `<div style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</div>`;
      } else {
        cardsFeed.innerHTML = itvData.map(item => `
          <div class="detail-card" data-veh-id="${item.vehicle.id}">
            <div class="detail-card-header">
              <span class="plate-badge">${item.vehicle.licensePlate}</span>
              <span class="status-badge ${item.statusClass}">${item.statusBadgeText}</span>
            </div>
            <div class="detail-card-title">${item.vehicle.make} ${item.vehicle.model}</div>
            <div class="detail-card-grid">
              <div class="detail-card-item">
                <span class="detail-label">${LanguageManager.t('colItvDate')}</span>
                <span class="detail-value">${item.expDateStr}</span>
              </div>
              <div class="detail-card-item">
                <span class="detail-label">${LanguageManager.t('colItvRemaining')}</span>
                <span class="detail-value">${item.daysRemaining > 0 ? LanguageManager.t('unitDaysCount', { days: item.daysRemaining }) : LanguageManager.t('unitDaysExpiredShort')}</span>
              </div>
              <div class="detail-card-item full-width">
                <span class="detail-label">${LanguageManager.t('colObservations')}</span>
                <span class="detail-value" style="color: #475569; font-weight:500;">${item.observations}</span>
              </div>
            </div>
            <div class="detail-card-footer">
              <span>👁️ ${LanguageManager.t('clickForDetailsHint')}</span>
              <span>👉</span>
            </div>
          </div>
        `).join('');

        cardsFeed.querySelectorAll<HTMLElement>('.detail-card').forEach(card => {
          card.addEventListener('click', () => {
            const id = card.getAttribute('data-veh-id');
            const veh = this.cachedVehicles.find(v => v.id === id);
            if (veh) this.openItvDetails(veh);
          });
        });
      }
    }
  }

  // SUB-SECTION 2: MAINTENANCE HISTORY & INTERVENTIONS
  private renderMaintenance(maintenance: MaintenanceRecord[], vehicles: Vehicle[]): void {
    const tbody = document.getElementById('maintenance-table-body');
    const cardsFeed = document.getElementById('maintenance-cards-feed');
    const vehicleMap = new Map(vehicles.map(v => [v.id, v]));

    // 1. Table View
    if (tbody) {
      if (maintenance.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</td></tr>`;
      } else {
        tbody.innerHTML = maintenance.map(m => {
          const veh = vehicleMap.get(m.vehicleId);
          const plate = veh ? veh.licensePlate : m.vehicleId;
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
              <td>
                <button type="button" class="btn-secondary btn-maint-row-details" data-maint-id="${m.id}" style="padding: 4px 10px; font-size: 0.78rem;">
                  <span>👁️</span> <span>${LanguageManager.t('viewDetailsBtn')}</span>
                </button>
              </td>
            </tr>
          `;
        }).join('');

        tbody.querySelectorAll<HTMLButtonElement>('.btn-maint-row-details').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-maint-id');
            const maint = this.cachedMaintenance.find(m => m.id === id);
            if (maint) {
              const veh = vehicleMap.get(maint.vehicleId);
              this.openMaintDetails(maint, veh);
            }
          });
        });
      }
    }

    // 2. Mobile Cards Feed
    if (cardsFeed) {
      if (maintenance.length === 0) {
        cardsFeed.innerHTML = `<div style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</div>`;
      } else {
        cardsFeed.innerHTML = maintenance.map(m => {
          const veh = vehicleMap.get(m.vehicleId);
          const plate = veh ? veh.licensePlate : m.vehicleId;
          const vehName = veh ? `${veh.make} ${veh.model}` : '';
          const typeLabel = LanguageManager.t('maint_type_' + m.type.toLowerCase());
          const statusLabel = LanguageManager.t('maint_status_' + m.status.toLowerCase());
          const statusClass = m.status === 'COMPLETED' ? 'active' : m.status === 'SCHEDULED' ? 'maintenance' : 'out';

          return `
            <div class="detail-card" data-maint-id="${m.id}">
              <div class="detail-card-header">
                <span class="plate-badge">${plate}</span>
                <span class="status-badge ${statusClass}">${statusLabel}</span>
              </div>
              <div class="detail-card-title">${typeLabel} ${vehName ? `(${vehName})` : ''}</div>
              <div class="detail-card-grid">
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colScheduledDate')}</span>
                  <span class="detail-value">${m.scheduledDate}</span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colCost')}</span>
                  <span class="detail-value" style="color:var(--primary-dark);">${m.costEur.toFixed(2)} €</span>
                </div>
                <div class="detail-card-item full-width">
                  <span class="detail-label">${LanguageManager.t('colWorkshop')}</span>
                  <span class="detail-value">${m.workshopName || '-'}</span>
                </div>
                ${m.notes ? `
                <div class="detail-card-item full-width">
                  <span class="detail-label">${LanguageManager.t('colObservations')}</span>
                  <span class="detail-value" style="color: #475569; font-weight:500;">
                    ${LanguageManager.translateObservation(m.notes)}
                  </span>
                </div>
                ` : ''}
              </div>
              <div class="detail-card-footer">
                <span>👁️ ${LanguageManager.t('viewDetailsBtn')}</span>
                <span>👉</span>
              </div>
            </div>
          `;
        }).join('');

        cardsFeed.querySelectorAll<HTMLElement>('.detail-card').forEach(card => {
          card.addEventListener('click', () => {
            const id = card.getAttribute('data-maint-id');
            const maint = this.cachedMaintenance.find(m => m.id === id);
            if (maint) {
              const veh = vehicleMap.get(maint.vehicleId);
              this.openMaintDetails(maint, veh);
            }
          });
        });
      }
    }
  }

  private renderFuelLogs(logs: FuelLog[]): void {
    const tbody = document.getElementById('fuel-table-body');
    const cardsFeed = document.getElementById('fuel-cards-feed');
    const vehicleMap = new Map(this.cachedVehicles.map(v => [v.id, v]));

    // Group logs by vehicle to calculate delta km, consumption, etc.
    const logsByVehicle = new Map<string, FuelLog[]>();
    logs.forEach(log => {
      const arr = logsByVehicle.get(log.vehicleId) || [];
      arr.push({ ...log });
      logsByVehicle.set(log.vehicleId, arr);
    });

    interface EnrichedFuelLog extends FuelLog {
      vehiclePlate: string;
      vehicleName: string;
      deltaKm: number | null;
      pricePerLiter: number;
      consumptionL100km: number | null;
      costPerKm: number | null;
    }

    const enrichedList: EnrichedFuelLog[] = [];

    logsByVehicle.forEach((vehLogs, vehId) => {
      // Sort oldest to newest to compute delta km
      vehLogs.sort((a, b) => {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return dateDiff !== 0 ? dateDiff : a.odometerKm - b.odometerKm;
      });

      const veh = vehicleMap.get(vehId);
      const vehiclePlate = veh ? veh.licensePlate : '4589-LDR';
      const vehicleName = veh ? `${veh.make} ${veh.model}` : '';

      for (let i = 0; i < vehLogs.length; i++) {
        const cur = vehLogs[i];
        const prev = i > 0 ? vehLogs[i - 1] : null;

        let deltaKm: number | null = null;
        if (prev && cur.odometerKm > prev.odometerKm) {
          deltaKm = cur.odometerKm - prev.odometerKm;
        }

        const pricePerLiter = cur.liters > 0 ? cur.costEur / cur.liters : 0;
        const consumptionL100km = (deltaKm && deltaKm > 0 && cur.liters > 0)
          ? (cur.liters / deltaKm) * 100
          : null;
        const costPerKm = (deltaKm && deltaKm > 0)
          ? cur.costEur / deltaKm
          : null;

        enrichedList.push({
          ...cur,
          vehiclePlate,
          vehicleName,
          deltaKm,
          pricePerLiter,
          consumptionL100km,
          costPerKm
        });
      }
    });

    // Sort display list: newest first
    enrichedList.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return dateDiff !== 0 ? dateDiff : b.odometerKm - a.odometerKm;
    });

    // 1. Update Top Fuel KPI Cards
    this.updateFuelKpiMetrics(enrichedList);

    // 2. Render Table View
    if (tbody) {
      if (enrichedList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</td></tr>`;
      } else {
        tbody.innerHTML = enrichedList.map(f => {
          const deltaText = f.deltaKm !== null 
            ? `<span style="color:#059669; font-weight:700;">+${f.deltaKm.toLocaleString()} km</span>`
            : `<span style="color:#94A3B8; font-style:italic;">${LanguageManager.t('lblInitialFill')}</span>`;
          
          const consumText = f.consumptionL100km !== null
            ? `<strong>${f.consumptionL100km.toFixed(2)}</strong> L/100km`
            : `<span style="color:#94A3B8;">-</span>`;

          const tankBadge = f.fullTank !== false 
            ? `<span title="${LanguageManager.t('lblFullTank')}" style="color:#0D9488; font-size:0.75rem;">${LanguageManager.t('lblFullTankShort')}</span>`
            : `<span title="${LanguageManager.t('lblPartialTank')}" style="color:#EAB308; font-size:0.75rem;">${LanguageManager.t('lblPartialTankShort')}</span>`;

          const translatedNotes = LanguageManager.translateObservation(f.notes || '');

          return `
            <tr>
              <td><strong>${f.date}</strong></td>
              <td><span class="plate-badge">${f.vehiclePlate}</span></td>
              <td><strong>${f.odometerKm.toLocaleString()}</strong> km</td>
              <td>${deltaText}</td>
              <td>${f.liters.toFixed(2)} L ${tankBadge}</td>
              <td>${f.pricePerLiter.toFixed(3)} €/L</td>
              <td><strong style="color:var(--primary-dark); font-size:0.95rem;">${f.costEur.toFixed(2)} €</strong></td>
              <td>${consumText}</td>
              <td>${f.fuelStation || '-'}</td>
              <td style="max-width:240px; font-size:0.82rem; color:#475569;">
                <span title="${translatedNotes}">${translatedNotes}</span>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 3. Render Cards Feed
    if (cardsFeed) {
      if (enrichedList.length === 0) {
        cardsFeed.innerHTML = `<div style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</div>`;
      } else {
        cardsFeed.innerHTML = enrichedList.map(f => {
          const deltaBadge = f.deltaKm !== null
            ? `<span style="background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; font-weight:700; padding:3px 8px; border-radius:12px; font-size:0.75rem;">${LanguageManager.t('lblDeltaFromLast', { km: f.deltaKm.toLocaleString() })}</span>`
            : `<span style="background:#F1F5F9; color:#64748B; border:1px solid #CBD5E1; padding:3px 8px; border-radius:12px; font-size:0.72rem;">${LanguageManager.t('lblInitialFill')}</span>`;

          const consumBadge = f.consumptionL100km !== null
            ? `<span style="font-weight:700; color:var(--primary-dark); font-size:0.88rem;">${f.consumptionL100km.toFixed(2)} L/100km</span>`
            : `<span style="color:#94A3B8; font-size:0.8rem;">--</span>`;

          const costPerKmText = f.costPerKm !== null
            ? `${f.costPerKm.toFixed(3)} €/km`
            : `--`;

          const tankStatusLabel = f.fullTank !== false 
            ? `✓ ${LanguageManager.t('lblFullTank')}` 
            : `⚠️ ${LanguageManager.t('lblPartialTank')}`;

          const translatedNotes = LanguageManager.translateObservation(f.notes || '');

          return `
            <div class="detail-card">
              <div class="detail-card-header">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="plate-badge">${f.vehiclePlate}</span>
                  ${deltaBadge}
                </div>
                <div style="text-align:right;">
                  <span style="font-weight:800; color:var(--primary-dark); font-size:1.1rem;">${f.costEur.toFixed(2)} €</span>
                  <div style="font-size:0.72rem; color:#64748B;">${f.pricePerLiter.toFixed(3)} €/L</div>
                </div>
              </div>

              <div class="detail-card-title">
                <span>⛽ ${f.fuelStation || LanguageManager.t('defaultFuelStation')}</span>
                <span style="font-size:0.78rem; font-weight:600; color:#64748B; float:right;">${f.date}</span>
              </div>

              <div class="detail-card-grid">
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colOdometerAtFill')}</span>
                  <span class="detail-value" style="font-weight:700;">${f.odometerKm.toLocaleString()} km</span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colDeltaKm')}</span>
                  <span class="detail-value" style="color:#059669; font-weight:700;">
                    ${f.deltaKm !== null ? `+${f.deltaKm.toLocaleString()} km` : LanguageManager.t('lblInitialFill')}
                  </span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colLiters')}</span>
                  <span class="detail-value">${f.liters.toFixed(2)} L <small style="color:#0F766E;">(${tankStatusLabel})</small></span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colAvgConsumption')}</span>
                  <span class="detail-value">${consumBadge}</span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colCostPerKm')}</span>
                  <span class="detail-value">${costPerKmText}</span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colPricePerLiter')}</span>
                  <span class="detail-value">${f.pricePerLiter.toFixed(3)} €/L</span>
                </div>
                <div class="detail-card-item full-width">
                  <span class="detail-label">${LanguageManager.t('colObservations')}</span>
                  <span class="detail-value" style="color: #475569; font-weight:500;">
                    ${translatedNotes}
                  </span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  private updateFuelKpiMetrics(logs: any[]): void {
    const lastFillEl = document.getElementById('kpi-fuel-last-fill');
    const lastFillDescEl = document.getElementById('kpi-fuel-last-desc');
    const avgConsumEl = document.getElementById('kpi-fuel-avg-consumption');
    const avgDistanceEl = document.getElementById('kpi-fuel-avg-distance');
    const avgPriceEl = document.getElementById('kpi-fuel-avg-price');

    if (logs.length === 0) {
      if (lastFillEl) lastFillEl.textContent = '--';
      if (avgConsumEl) avgConsumEl.textContent = '0.0 L/100km';
      if (avgDistanceEl) avgDistanceEl.textContent = '0 km';
      if (avgPriceEl) avgPriceEl.textContent = '0.00 €/L';
      return;
    }

    // 1. Last Fill-up
    const latest = logs[0];
    if (lastFillEl) {
      lastFillEl.textContent = `${latest.vehiclePlate} (${latest.liters.toFixed(1)} L)`;
    }
    if (lastFillDescEl) {
      lastFillDescEl.textContent = `${latest.date} • ${latest.fuelStation || '-'} • ${latest.costEur.toFixed(2)} €`;
    }

    // 2. Average Consumption
    const validConsumptions = logs.filter(l => l.consumptionL100km !== null && l.consumptionL100km > 3 && l.consumptionL100km < 40);
    if (avgConsumEl) {
      if (validConsumptions.length > 0) {
        const sum = validConsumptions.reduce((acc: number, curr: any) => acc + curr.consumptionL100km, 0);
        const avg = sum / validConsumptions.length;
        avgConsumEl.textContent = `${avg.toFixed(2)} L/100km`;
      } else {
        avgConsumEl.textContent = '--';
      }
    }

    // 3. Average Distance between fills
    const validDeltas = logs.filter(l => l.deltaKm !== null && l.deltaKm > 0);
    if (avgDistanceEl) {
      if (validDeltas.length > 0) {
        const sum = validDeltas.reduce((acc: number, curr: any) => acc + curr.deltaKm, 0);
        const avg = sum / validDeltas.length;
        avgDistanceEl.textContent = `+${Math.round(avg).toLocaleString()} km`;
      } else {
        avgDistanceEl.textContent = '--';
      }
    }

    // 4. Average Fuel Price
    const totalCost = logs.reduce((acc: number, curr: any) => acc + curr.costEur, 0);
    const totalLiters = logs.reduce((acc: number, curr: any) => acc + curr.liters, 0);
    if (avgPriceEl) {
      if (totalLiters > 0) {
        avgPriceEl.textContent = `${(totalCost / totalLiters).toFixed(3)} €/L`;
      } else {
        avgPriceEl.textContent = '0.00 €/L';
      }
    }
  }

  // DETAILED INSPECTION MODALS
  private openItvDetails(vehicle: Vehicle): void {
    const modal = document.getElementById('modal-itv-details');
    if (!modal) return;

    // 1. Vehicle Header
    const plateEl = document.getElementById('modal-itv-plate');
    const vehStatusEl = document.getElementById('modal-itv-veh-status');
    const vehTitleEl = document.getElementById('modal-itv-veh-title');
    const vehMetaEl = document.getElementById('modal-itv-veh-meta');

    if (plateEl) plateEl.textContent = vehicle.licensePlate;
    if (vehStatusEl) {
      const statusClass = vehicle.status === 'ACTIVE' ? 'active' : vehicle.status === 'MAINTENANCE' ? 'maintenance' : 'out';
      vehStatusEl.className = `status-badge ${statusClass}`;
      vehStatusEl.textContent = LanguageManager.t('status_' + vehicle.status.toLowerCase());
    }
    if (vehTitleEl) vehTitleEl.textContent = `${vehicle.make} ${vehicle.model}`;
    if (vehMetaEl) {
      const fuelLabel = LanguageManager.t('fuel_' + vehicle.fuelType.toLowerCase());
      vehMetaEl.textContent = `${LanguageManager.t('colYear')} ${vehicle.year} • ${fuelLabel} • ${vehicle.currentOdometerKm.toLocaleString()} km`;
    }

    // 2. ITV Status
    const itvDateEl = document.getElementById('modal-itv-date');
    const itvRemainingEl = document.getElementById('modal-itv-remaining');
    const itvBadgeWrap = document.getElementById('modal-itv-status-badge');

    const expDate = new Date(vehicle.itvExpirationDate);
    const now = new Date();
    const diffMs = expDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let statusKey = 'itv_status_valid';
    let statusClass = 'active';

    if (daysRemaining < 0) {
      statusKey = 'itv_status_expired';
      statusClass = 'out';
    } else if (daysRemaining <= 7) {
      statusKey = 'itv_status_urgent';
      statusClass = 'out';
    } else if (daysRemaining <= 30) {
      statusKey = 'itv_status_expiring';
      statusClass = 'maintenance';
    }

    if (itvDateEl) itvDateEl.textContent = vehicle.itvExpirationDate;
    if (itvRemainingEl) {
      itvRemainingEl.textContent = daysRemaining > 0 
        ? LanguageManager.t('unitDaysRemaining', { days: daysRemaining })
        : LanguageManager.t('unitDaysExpired', { days: Math.abs(daysRemaining) });
    }
    if (itvBadgeWrap) {
      const badgeText = LanguageManager.t(statusKey, { days: Math.abs(daysRemaining) });
      itvBadgeWrap.innerHTML = `<span class="status-badge ${statusClass}">${badgeText}</span>`;
    }

    // 3. Technical Observations
    const notesEl = document.getElementById('modal-itv-notes');
    if (notesEl) {
      notesEl.textContent = LanguageManager.translateObservation(
        vehicle.notes || 'Sense observacions tècniques anòmales registrades per a este vehicle.'
      );
    }

    // 4. Pending / Scheduled Maintenance for this specific vehicle
    const pendingContainer = document.getElementById('modal-itv-pending-maint');
    if (pendingContainer) {
      const pendingList = this.cachedMaintenance.filter(m => 
        m.vehicleId === vehicle.id && m.status === 'SCHEDULED'
      );

      if (pendingList.length === 0) {
        pendingContainer.innerHTML = `
          <div style="font-size:0.84rem; color:#64748B; font-style:italic; padding:6px 0;">
            ✓ ${LanguageManager.t('lblNoPendingMaint')}
          </div>
        `;
      } else {
        pendingContainer.innerHTML = pendingList.map(m => {
          const typeLabel = LanguageManager.t('maint_type_' + m.type.toLowerCase());
          const statusLabel = LanguageManager.t('maint_status_' + m.status.toLowerCase());
          const statusClass = m.status === 'COMPLETED' ? 'active' : 'maintenance';

          return `
            <div style="background:#FFFFFF; border:1px solid var(--slate-200); border-radius:var(--radius-sm); padding:8px 10px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="font-size:0.86rem; color:var(--slate-800);">${typeLabel}</strong>
                <div style="font-size:0.75rem; color:var(--slate-500); margin-top:2px;">${m.scheduledDate} • ${m.workshopName || '-'}</div>
              </div>
              <div style="text-align:right;">
                <span class="status-badge ${statusClass}" style="font-size:0.7rem;">${statusLabel}</span>
                <div style="font-weight:700; font-size:0.82rem; color:var(--slate-800); margin-top:2px;">${m.costEur.toFixed(2)} €</div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 5. Quick Action Button: pre-select this vehicle in New Maintenance modal
    const quickScheduleBtn = document.getElementById('btn-itv-quick-schedule');
    if (quickScheduleBtn) {
      quickScheduleBtn.onclick = () => {
        modal.classList.remove('open');
        this.populateModalVehicleDropdowns();
        const maintVehSelect = document.getElementById('maint-veh') as HTMLSelectElement;
        if (maintVehSelect) maintVehSelect.value = vehicle.id;
        this.openModal('modal-maintenance');
      };
    }

    modal.classList.add('open');
  }

  private openMaintDetails(maint: MaintenanceRecord, vehicle?: Vehicle): void {
    const modal = document.getElementById('modal-maint-details');
    if (!modal) return;

    const plate = vehicle ? vehicle.licensePlate : maint.vehicleId;
    const typeLabel = LanguageManager.t('maint_type_' + maint.type.toLowerCase());
    const statusLabel = LanguageManager.t('maint_status_' + maint.status.toLowerCase());
    const statusClass = maint.status === 'COMPLETED' ? 'active' : maint.status === 'SCHEDULED' ? 'maintenance' : 'out';

    const plateEl = document.getElementById('modal-maint-plate');
    const statusEl = document.getElementById('modal-maint-status');
    const titleEl = document.getElementById('modal-maint-type-title');
    const dateEl = document.getElementById('modal-maint-date');
    const costEl = document.getElementById('modal-maint-cost');
    const workshopEl = document.getElementById('modal-maint-workshop');
    const notesEl = document.getElementById('modal-maint-notes');

    if (plateEl) plateEl.textContent = plate;
    if (statusEl) {
      statusEl.className = `status-badge ${statusClass}`;
      statusEl.textContent = statusLabel;
    }
    if (titleEl) {
      titleEl.textContent = vehicle 
        ? `${typeLabel} (${vehicle.make} ${vehicle.model})`
        : typeLabel;
    }
    if (dateEl) dateEl.textContent = maint.scheduledDate;
    if (costEl) costEl.textContent = `${maint.costEur.toFixed(2)} €`;
    if (workshopEl) workshopEl.textContent = maint.workshopName || '-';
    if (notesEl) {
      notesEl.textContent = LanguageManager.translateObservation(
        maint.notes || 'Sense observacions addicionals registrades.'
      );
    }

    modal.classList.add('open');
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
      this.populateModalDriverDropdowns();
      this.openModal('modal-vehicle');
    });

    document.getElementById('btn-add-driver')?.addEventListener('click', () => {
      this.populateModalDriverDropdowns();
      this.openModal('modal-driver');
    });

    document.getElementById('btn-add-fine')?.addEventListener('click', () => {
      this.populateModalVehicleDropdowns();
      this.populateModalDriverDropdowns();
      const dateInput = document.getElementById('fine-date') as HTMLInputElement;
      if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }
      this.openModal('modal-fine');
    });

    document.getElementById('btn-add-maintenance')?.addEventListener('click', () => {
      this.populateModalVehicleDropdowns();
      this.openModal('modal-maintenance');
    });

    document.getElementById('btn-add-fuel')?.addEventListener('click', () => {
      this.populateModalVehicleDropdowns();
      // If driver is logged in, auto pre-select their assigned vehicle!
      if (this.currentUser?.role === 'DRIVER') {
        const assignedVeh = this.cachedVehicles.find(v => v.assignedDriverId === this.currentUser?.id);
        if (assignedVeh) {
          const fuelVehSelect = document.getElementById('fuel-veh') as HTMLSelectElement;
          if (fuelVehSelect) {
            fuelVehSelect.value = assignedVeh.id;
            this.updateFuelFormHints();
          }
        }
      }
      const dateInput = document.getElementById('fuel-date') as HTMLInputElement;
      if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }
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
    if (fuelVehSelect) {
      fuelVehSelect.innerHTML = optionsHtml;
      this.updateFuelFormHints();
    }
  }

  private updateFuelFormHints(): void {
    const fuelVehSelect = document.getElementById('fuel-veh') as HTMLSelectElement;
    const odoInput = document.getElementById('fuel-odometer') as HTMLInputElement;
    const litersInput = document.getElementById('fuel-liters') as HTMLInputElement;
    const priceInput = document.getElementById('fuel-price') as HTMLInputElement;

    const lastOdoHintEl = document.getElementById('fuel-last-odometer-hint');
    const deltaHintEl = document.getElementById('fuel-delta-km-hint');
    const unitPriceHintEl = document.getElementById('fuel-unit-price-hint');

    if (!fuelVehSelect) return;
    const vehId = fuelVehSelect.value;
    const veh = this.cachedVehicles.find(v => v.id === vehId);
    if (!veh) return;

    // Find the highest known odometer from either vehicle master or its logs
    const vehFuelLogs = this.cachedFuelLogs.filter(f => f.vehicleId === vehId);
    let lastOdometer = veh.currentOdometerKm || 0;
    if (vehFuelLogs.length > 0) {
      const highestLogOdo = Math.max(...vehFuelLogs.map(f => f.odometerKm));
      lastOdometer = Math.max(lastOdometer, highestLogOdo);
    }

    if (lastOdoHintEl) {
      lastOdoHintEl.textContent = `${LanguageManager.t('lblLastOdometerHint')}: ${lastOdometer.toLocaleString()} km`;
    }

    // Default current input if empty or 0
    if (odoInput && (!odoInput.value || Number(odoInput.value) <= 0)) {
      odoInput.value = String(lastOdometer);
    }

    const currentOdo = Number(odoInput?.value || 0);
    const liters = Number(litersInput?.value || 0);
    const price = Number(priceInput?.value || 0);

    // Delta km & Estimated Consumption hint
    if (deltaHintEl) {
      if (currentOdo > lastOdometer) {
        const delta = currentOdo - lastOdometer;
        let deltaText = `+${delta.toLocaleString()} km ${LanguageManager.t('fuelKpiDistanceBetween')}`;
        if (liters > 0) {
          const estimatedConsum = ((liters / delta) * 100).toFixed(2);
          deltaText += ` (~${estimatedConsum} L/100km)`;
        }
        deltaHintEl.textContent = deltaText;
        deltaHintEl.style.color = '#059669';
      } else if (currentOdo === lastOdometer && currentOdo > 0) {
        deltaHintEl.textContent = `0 km (${LanguageManager.t('lblInitialFill')})`;
        deltaHintEl.style.color = '#64748B';
      } else if (currentOdo < lastOdometer) {
        deltaHintEl.textContent = LanguageManager.t('hintOdometerLower', { lastOdo: lastOdometer.toLocaleString() });
        deltaHintEl.style.color = '#DC2626';
      } else {
        deltaHintEl.textContent = '';
      }
    }

    // Unit price hint (€/L)
    if (unitPriceHintEl) {
      if (price > 0 && liters > 0) {
        const unitPrice = (price / liters).toFixed(3);
        unitPriceHintEl.textContent = LanguageManager.t('hintApproxUnitPrice', { price: unitPrice });
      } else {
        unitPriceHintEl.textContent = '';
      }
    }
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
          assignedDriverId: (document.getElementById('veh-driver') as HTMLSelectElement).value || null,
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

    // Interactive listeners for live calculation of delta km, consumption and unit price
    const fuelVehSelect = document.getElementById('fuel-veh') as HTMLSelectElement;
    fuelVehSelect?.addEventListener('change', () => {
      const odoInput = document.getElementById('fuel-odometer') as HTMLInputElement;
      if (odoInput) odoInput.value = '';
      this.updateFuelFormHints();
    });

    const fuelOdoInput = document.getElementById('fuel-odometer') as HTMLInputElement;
    fuelOdoInput?.addEventListener('input', () => this.updateFuelFormHints());

    const fuelLitersInput = document.getElementById('fuel-liters') as HTMLInputElement;
    fuelLitersInput?.addEventListener('input', () => this.updateFuelFormHints());

    const fuelPriceInput = document.getElementById('fuel-price') as HTMLInputElement;
    fuelPriceInput?.addEventListener('input', () => this.updateFuelFormHints());

    fuelForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const fullTankInput = document.getElementById('fuel-full-tank') as HTMLInputElement;
        const notesInput = document.getElementById('fuel-notes') as HTMLInputElement;

        const payload = {
          tenantId: this.currentTenant,
          vehicleId: (document.getElementById('fuel-veh') as HTMLSelectElement).value,
          driverId: this.currentUser?.id || 'usr_driver_joan',
          date: (document.getElementById('fuel-date') as HTMLInputElement).value,
          odometerKm: Number((document.getElementById('fuel-odometer') as HTMLInputElement).value),
          liters: Number((document.getElementById('fuel-liters') as HTMLInputElement).value),
          costEur: Number((document.getElementById('fuel-price') as HTMLInputElement).value),
          fuelStation: (document.getElementById('fuel-station') as HTMLInputElement).value.trim(),
          fullTank: fullTankInput ? fullTankInput.checked : true,
          notes: notesInput ? notesInput.value.trim() : undefined
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

    // 4. New Driver Form
    const driverForm = document.getElementById('form-new-driver') as HTMLFormElement;
    driverForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const payload = {
          tenantId: this.currentTenant,
          fullName: (document.getElementById('driver-name') as HTMLInputElement).value.trim(),
          username: (document.getElementById('driver-username') as HTMLInputElement).value.trim(),
          email: (document.getElementById('driver-email') as HTMLInputElement).value.trim(),
          phone: (document.getElementById('driver-phone') as HTMLInputElement).value.trim() || null,
          licenseNumber: (document.getElementById('driver-license') as HTMLInputElement).value.trim() || null
        };

        const res = await fetch('/api/drivers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(LanguageManager.t('error_internal'));
        const createdDriver = await res.json();

        // If assigned vehicle selected, update vehicle assignment
        const assignedVehId = (document.getElementById('driver-assigned-veh') as HTMLSelectElement)?.value;
        if (assignedVehId && createdDriver?.id) {
          await fetch(`/api/vehicles/${assignedVehId}/driver`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.authToken}`
            },
            body: JSON.stringify({ driverId: createdDriver.id })
          }).catch(() => null);
        }

        driverForm.reset();
        document.getElementById('modal-driver')?.classList.remove('open');
        this.showToast(LanguageManager.t('successDriverCreated'), 'success');
        await this.loadData();
      } catch (err: any) {
        this.showToast(err.message || LanguageManager.t('error_internal'), 'error');
      }
    });

    // 5. New Fine Form
    const fineForm = document.getElementById('form-new-fine') as HTMLFormElement;
    fineForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const payload = {
          tenantId: this.currentTenant,
          vehicleId: (document.getElementById('fine-veh') as HTMLSelectElement).value,
          driverId: (document.getElementById('fine-driver') as HTMLSelectElement).value || null,
          date: (document.getElementById('fine-date') as HTMLInputElement).value,
          amountEur: Number((document.getElementById('fine-amount') as HTMLInputElement).value),
          reason: (document.getElementById('fine-reason') as HTMLInputElement).value.trim(),
          organism: (document.getElementById('fine-organism') as HTMLInputElement).value.trim() || 'DGT',
          status: (document.getElementById('fine-status') as HTMLSelectElement).value || 'PENDING',
          notes: (document.getElementById('fine-notes') as HTMLTextAreaElement).value.trim() || null
        };

        const res = await fetch('/api/fines', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(LanguageManager.t('error_internal'));

        fineForm.reset();
        document.getElementById('modal-fine')?.classList.remove('open');
        this.showToast(LanguageManager.t('successFineCreated'), 'success');
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
