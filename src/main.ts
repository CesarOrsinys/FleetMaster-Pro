import { LanguageManager, SupportedLanguage } from './ui/i18n/LanguageManager.js';
import { renderFlagHtml } from './core/flags.js';
import { Vehicle } from './core/domain/Vehicle.js';
import { MaintenanceRecord } from './core/domain/MaintenanceRecord.js';
import { FuelLog } from './core/domain/FuelLog.js';

class AppController {
  private currentTenant: string = 'tenant_valencia';

  public init(): void {
    LanguageManager.init();

    // Render Valencian flag in dropdown
    const flagVaEl = document.getElementById('flag-va');
    if (flagVaEl) {
      flagVaEl.innerHTML = renderFlagHtml('va');
    }

    this.setupEventListeners();
    this.loadData();
  }

  private setupEventListeners(): void {
    // Language Dropdown Toggle
    const langBtn = document.getElementById('lang-btn');
    const langMenu = document.getElementById('lang-menu');

    langBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      langMenu?.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      langMenu?.classList.remove('open');
    });

    // Language Selection Items
    document.querySelectorAll<HTMLElement>('.lang-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const lang = item.getAttribute('data-lang') as SupportedLanguage;
        if (lang) {
          LanguageManager.setLanguage(lang);
          langMenu?.classList.remove('open');
          this.renderAlerts();
        }
      });
    });

    // Tenant Switcher
    const tenantSelect = document.getElementById('tenant-select') as HTMLSelectElement;
    tenantSelect?.addEventListener('change', () => {
      this.currentTenant = tenantSelect.value;
      this.loadData();
    });

    // Tab Navigation
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
  }

  private async loadData(): Promise<void> {
    try {
      const [vehiclesRes, maintRes, fuelRes] = await Promise.all([
        fetch(`/api/vehicles?tenantId=${this.currentTenant}`).catch(() => null),
        fetch(`/api/maintenance?tenantId=${this.currentTenant}`).catch(() => null),
        fetch(`/api/fuel-logs?tenantId=${this.currentTenant}`).catch(() => null)
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
      const statusLabel = v.status === 'ACTIVE' ? LanguageManager.t('statusActive') : v.status === 'MAINTENANCE' ? LanguageManager.t('statusMaintenance') : LanguageManager.t('statusOutOfService');

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
      const statusLabel = m.status === 'COMPLETED' ? LanguageManager.t('maintStatusCompleted') : m.status === 'SCHEDULED' ? LanguageManager.t('maintStatusScheduled') : LanguageManager.t('maintStatusCancelled');
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
            <p style="font-size: 0.8rem; color: #991B1B;">Venciment ITV el 30/10/2026 (< 10 dies restants)</p>
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
