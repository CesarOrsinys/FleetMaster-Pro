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

    // Clear any table and feed data
    const vehiclesTbody = document.getElementById('vehicles-table-body');
    if (vehiclesTbody) vehiclesTbody.innerHTML = '';
    const itvTbody = document.getElementById('itv-table-body');
    if (itvTbody) itvTbody.innerHTML = '';
    const maintTbody = document.getElementById('maintenance-table-body');
    if (maintTbody) maintTbody.innerHTML = '';
    const fuelTbody = document.getElementById('fuel-table-body');
    if (fuelTbody) fuelTbody.innerHTML = '';

    ['vehicles', 'itv', 'maintenance', 'fuel'].forEach(key => {
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
      this.renderItvControl(this.cachedVehicles);
      this.renderMaintenance(this.cachedMaintenance, this.cachedVehicles);
      this.renderFuelLogs(this.cachedFuelLogs);
      this.updateKpis(this.cachedVehicles, this.cachedMaintenance, this.cachedFuelLogs);
      this.renderAlerts();
      this.populateModalVehicleDropdowns();
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
      this.renderItvControl(this.cachedVehicles);
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
    const cardsFeed = document.getElementById('vehicles-cards-feed');

    if (tbody) {
      if (vehicles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</td></tr>`;
      } else {
        tbody.innerHTML = vehicles.map(v => {
          const statusClass = v.status === 'ACTIVE' ? 'active' : v.status === 'MAINTENANCE' ? 'maintenance' : 'out';
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
    }

    if (cardsFeed) {
      if (vehicles.length === 0) {
        cardsFeed.innerHTML = `<div style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</div>`;
      } else {
        cardsFeed.innerHTML = vehicles.map(v => {
          const statusClass = v.status === 'ACTIVE' ? 'active' : v.status === 'MAINTENANCE' ? 'maintenance' : 'out';
          const statusLabel = LanguageManager.t('status_' + v.status.toLowerCase());
          const fuelLabel = LanguageManager.t('fuel_' + v.fuelType.toLowerCase());

          return `
            <div class="detail-card" data-vehicle-id="${v.id}">
              <div class="detail-card-header">
                <span class="plate-badge">${v.licensePlate}</span>
                <span class="status-badge ${statusClass}">${statusLabel}</span>
              </div>
              <div class="detail-card-title">${v.make} ${v.model} (${v.year})</div>
              <div class="detail-card-grid">
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
            <td>${item.daysRemaining > 0 ? `${item.daysRemaining} dies` : `<span style="color:#EF4444; font-weight:700;">-${Math.abs(item.daysRemaining)} dies</span>`}</td>
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
                <span class="detail-value">${item.daysRemaining > 0 ? `${item.daysRemaining} dies` : `Caducada`}</span>
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
    const vehicleMap = new Map(this.cachedVehicles.map(v => [v.id, v.licensePlate]));

    if (tbody) {
      if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</td></tr>`;
      } else {
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
    }

    if (cardsFeed) {
      if (logs.length === 0) {
        cardsFeed.innerHTML = `<div style="text-align:center; padding: 2rem; color: #64748B;">${LanguageManager.t('emptyTableMessage')}</div>`;
      } else {
        cardsFeed.innerHTML = logs.map(f => {
          const plate = vehicleMap.get(f.vehicleId) || '4589-LDR';
          return `
            <div class="detail-card">
              <div class="detail-card-header">
                <span class="plate-badge">${plate}</span>
                <span style="font-weight:700; color:var(--primary-dark); font-size:1rem;">${f.costEur.toFixed(2)} €</span>
              </div>
              <div class="detail-card-title">${f.fuelStation || 'Estació de Servei'}</div>
              <div class="detail-card-grid">
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colDate')}</span>
                  <span class="detail-value">${f.date}</span>
                </div>
                <div class="detail-card-item">
                  <span class="detail-label">${LanguageManager.t('colOdometer')}</span>
                  <span class="detail-value">${f.odometerKm.toLocaleString()} km</span>
                </div>
                <div class="detail-card-item full-width">
                  <span class="detail-label">${LanguageManager.t('colLiters')}</span>
                  <span class="detail-value">${f.liters.toFixed(2)} L</span>
                </div>
                ${f.notes ? `
                <div class="detail-card-item full-width">
                  <span class="detail-label">${LanguageManager.t('colObservations')}</span>
                  <span class="detail-value" style="color: #475569; font-weight:500;">
                    ${LanguageManager.translateObservation(f.notes)}
                  </span>
                </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('');
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
        ? `${daysRemaining} dies restants` 
        : `Caducada fa ${Math.abs(daysRemaining)} dies`;
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
