import { renderFlagHtml } from '../../core/flags.js';

export type SupportedLanguage = 'va' | 'es' | 'en';

export interface LanguageMeta {
  code: SupportedLanguage;
  label: string;
  name: string;
}

export const LANGUAGE_META: Record<SupportedLanguage, LanguageMeta> = {
  va: { code: 'va', label: 'VA', name: 'Valencià' },
  es: { code: 'es', label: 'ES', name: 'Español' },
  en: { code: 'en', label: 'EN', name: 'English' }
};

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  LANGUAGE_META.va,
  LANGUAGE_META.es,
  LANGUAGE_META.en
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  va: {
    // App Bar & Branding
    appTitle: "FleetMaster-Pro",
    appSubtitle: "Gestió Intel·ligent de Flotes i Manteniment SaaS",
    tenantSelectorLabel: "Empresa",
    selectTenantPlaceholder: "Tria empresa...",
    switchLanguage: "Canviar idioma",
    profileRoleSuperAdmin: "SuperAdmin Global",
    profileRoleTenantAdmin: "Cap de Flota",
    profileRoleDriver: "Conductor",
    btnLogout: "Tancar sessió",
    btnLogin: "Iniciar sessió",

    // Auth & Login Screen
    loginScreenTitle: "Accés al Sistema FleetMaster-Pro",
    loginSubtitle: "Introdueix les teues credencials per accedir a la gestió de flota",
    inputUsernameLabel: "Nom d'usuari",
    inputUsernamePlaceholder: "Ex: admin_valencia",
    inputPasswordLabel: "Contrasenya",
    inputPasswordPlaceholder: "Introdueix la teua contrasenya",
    loginSubmitBtn: "Iniciar sessió",
    loginLoggingIn: "Accedint...",
    loginErrorInvalid: "Credencials incorrectes. Si us plau, revisa usuari i contrasenya.",
    loginSelectTenant: "Empresa / Flota",
    demoCredentialsTitle: "Credencials de prova ràpida:",
    quickFillVal: "València Admin",
    quickFillMed: "Mediterrània Admin",
    quickFillDriver: "Conductor Joan",
    quickFillSuper: "SuperAdmin",
    welcomeBack: "Benvingut/da",
    currentUser: "Usuari connectat",
    loginModalTitle: "Accés al Sistema FleetMaster-Pro",

    // Navigation Tabs
    tabDashboard: "Panell de Control",
    tabVehicles: "Parc de Vehicles",
    tabMaintenance: "ITV i Manteniment",
    tabFuel: "Combustible i Quilometratge",
    tabTenantSettings: "Configuració d'Empresa",

    // Dashboard KPIs
    kpiTotalVehicles: "Vehicles Actius",
    kpiPendingItv: "ITV Pròximes (< 30 dies)",
    kpiUpcomingMaintenance: "Revisions Pendents",
    kpiFuelConsumption: "Despesa en Combustible (Mes)",
    kpiOdometerTotal: "Quilòmetres Totals Recorreguts",
    recentAlertsTitle: "Alertes i Venciments Imminents",
    noAlertsMessage: "No hi ha alertes pendents. Tots els vehicles compleixen amb el pla de manteniment.",

    // Vehicles Section
    btnNewVehicle: "Nou Vehicle",
    filterVehiclesPlaceholder: "Cercar per matrícula, marca o model...",
    colLicensePlate: "Matrícula",
    colVehicle: "Vehicle (Marca i Model)",
    colYear: "Any",
    colFuelType: "Combustible",
    colOdometer: "Quilòmetres (km)",
    colStatus: "Estat",
    colAssignedDriver: "Conductor Assignat",
    colItvDate: "Venciment ITV",
    colNextService: "Pròxima Revisió (km)",
    colActions: "Accions",
    statusActive: "Actiu",
    statusMaintenance: "En Taller",
    statusOutOfService: "Fora de Servei",
    unassignedDriver: "Sense assignar",

    // Maintenance Section
    btnNewMaintenance: "Programar Manteniment",
    colMaintenanceType: "Tipus d'Intervenció",
    colScheduledDate: "Data Programada",
    colCompletedDate: "Data de Realització",
    colWorkshop: "Taller / Proveïdor",
    colCost: "Cost (€)",
    colMaintenanceStatus: "Estat",
    maintTypeItv: "Inspecció Tècnica (ITV)",
    maintTypeOil: "Canvi d'Oli i Filtre d'Oli",
    maintTypeFilters: "Sustitució de Filtres (Aire/Pol·len)",
    maintTypeBrakes: "Pastilles i Discos de Fre",
    maintTypeTires: "Pneumàtics",
    maintTypeGeneral: "Reparació Mecànica General",
    maintStatusScheduled: "Programada",
    maintStatusCompleted: "Realitzada",
    maintStatusCancelled: "Anul·lada",

    // Fuel Logs Section
    btnNewFuelLog: "Registrar Repostatge",
    colDate: "Data",
    colLiters: "Litres",
    colPriceEur: "Total (€)",
    colFuelStation: "Estació de Servei",
    colReceipt: "Tiquet / Factura",

    // Modal & Form Labels
    modalSaveBtn: "Guardar Registre",
    modalCancelBtn: "Cancel·lar",
    inputPlateLabel: "Matrícula oficial",
    inputMakeLabel: "Marca",
    inputModelLabel: "Model",
    inputYearLabel: "Any de fabricació",
    inputVinLabel: "Nombre de Bastidor (VIN)",
    inputFuelLabel: "Tipus de Combustible",
    inputOdometerLabel: "Lectura Odòmetre actual (km)",
    inputItvDateLabel: "Data límit ITV",
    inputNotesLabel: "Observacions addicionals",

    // General / Feedback
    loadingMessage: "Carregant dades...",
    savedSuccessMessage: "Registre guardat correctament.",
    deletedSuccessMessage: "Registre eliminat satisfactòriament.",
    confirmDeletePrompt: "Segur que desitges eliminar este registre?",
    emptyTableMessage: "No s'han trobat registres per a esta consulta."
  },

  es: {
    // App Bar & Branding
    appTitle: "FleetMaster-Pro",
    appSubtitle: "Gestión Inteligente de Flotas y Mantenimiento SaaS",
    tenantSelectorLabel: "Empresa",
    selectTenantPlaceholder: "Elige empresa...",
    switchLanguage: "Cambiar idioma",
    profileRoleSuperAdmin: "SuperAdmin Global",
    profileRoleTenantAdmin: "Jefe de Flota",
    profileRoleDriver: "Conductor",
    btnLogout: "Cerrar sesión",
    btnLogin: "Iniciar sesión",

    // Auth & Login Screen
    loginScreenTitle: "Acceso al Sistema FleetMaster-Pro",
    loginSubtitle: "Introduce tus credenciales para acceder a la gestión de flota",
    inputUsernameLabel: "Nombre de usuario",
    inputUsernamePlaceholder: "Ej: admin_valencia",
    inputPasswordLabel: "Contraseña",
    inputPasswordPlaceholder: "Introduce tu contraseña",
    loginSubmitBtn: "Iniciar sesión",
    loginLoggingIn: "Accediendo...",
    loginErrorInvalid: "Credenciales incorrectas. Por favor, revisa usuario y contraseña.",
    loginSelectTenant: "Empresa / Flota",
    demoCredentialsTitle: "Credenciales de prueba rápida:",
    quickFillVal: "València Admin",
    quickFillMed: "Mediterrània Admin",
    quickFillDriver: "Conductor Joan",
    quickFillSuper: "SuperAdmin",
    welcomeBack: "Bienvenido/a",
    currentUser: "Usuario conectado",
    loginModalTitle: "Acceso al Sistema FleetMaster-Pro",

    // Navigation Tabs
    tabDashboard: "Panel de Control",
    tabVehicles: "Parque de Vehículos",
    tabMaintenance: "ITV y Mantenimiento",
    tabFuel: "Combustible y Kilometraje",
    tabTenantSettings: "Configuración de Empresa",

    // Dashboard KPIs
    kpiTotalVehicles: "Vehículos Activos",
    kpiPendingItv: "ITV Próximas (< 30 días)",
    kpiUpcomingMaintenance: "Revisiones Pendientes",
    kpiFuelConsumption: "Gasto en Combustible (Mes)",
    kpiOdometerTotal: "Kilómetros Totales Recorridos",
    recentAlertsTitle: "Alertas y Vencimientos Inminentes",
    noAlertsMessage: "No hay alertas pendientes. Todos los vehículos cumplen con el plan de mantenimiento.",

    // Vehicles Section
    btnNewVehicle: "Nuevo Vehículo",
    filterVehiclesPlaceholder: "Buscar por matrícula, marca o modelo...",
    colLicensePlate: "Matrícula",
    colVehicle: "Vehículo (Marca y Modelo)",
    colYear: "Año",
    colFuelType: "Combustible",
    colOdometer: "Kilómetros (km)",
    colStatus: "Estado",
    colAssignedDriver: "Conductor Asignado",
    colItvDate: "Vencimiento ITV",
    colNextService: "Próxima Revisión (km)",
    colActions: "Acciones",
    statusActive: "Activo",
    statusMaintenance: "En Taller",
    statusOutOfService: "Fuera de Servicio",
    unassignedDriver: "Sin asignar",

    // Maintenance Section
    btnNewMaintenance: "Programar Mantenimiento",
    colMaintenanceType: "Tipo de Intervención",
    colScheduledDate: "Fecha Programada",
    colCompletedDate: "Fecha de Realización",
    colWorkshop: "Taller / Proveedor",
    colCost: "Coste (€)",
    colMaintenanceStatus: "Estado",
    maintTypeItv: "Inspección Técnica (ITV)",
    maintTypeOil: "Cambio de Aceite y Filtro de Aceite",
    maintTypeFilters: "Sustitución de Filtros (Aire/Polen)",
    maintTypeBrakes: "Pastillas y Discos de Freno",
    maintTypeTires: "Neumáticos",
    maintTypeGeneral: "Reparación Mecánica General",
    maintStatusScheduled: "Programada",
    maintStatusCompleted: "Realizada",
    maintStatusCancelled: "Anulada",

    // Fuel Logs Section
    btnNewFuelLog: "Registrar Repostaje",
    colDate: "Fecha",
    colLiters: "Litros",
    colPriceEur: "Total (€)",
    colFuelStation: "Estación de Servicio",
    colReceipt: "Tique / Factura",

    // Modal & Form Labels
    modalSaveBtn: "Guardar Registro",
    modalCancelBtn: "Cancelar",
    inputPlateLabel: "Matrícula oficial",
    inputMakeLabel: "Marca",
    inputModelLabel: "Modelo",
    inputYearLabel: "Año de fabricación",
    inputVinLabel: "Número de Bastidor (VIN)",
    inputFuelLabel: "Tipo de Combustible",
    inputOdometerLabel: "Lectura Odómetro actual (km)",
    inputItvDateLabel: "Fecha límite ITV",
    inputNotesLabel: "Observaciones adicionales",

    // General / Feedback
    loadingMessage: "Cargando datos...",
    savedSuccessMessage: "Registro guardado correctamente.",
    deletedSuccessMessage: "Registro eliminado satisfactoriamente.",
    confirmDeletePrompt: "¿Seguro que deseas eliminar este registro?",
    emptyTableMessage: "No se han encontrado registros para esta consulta."
  },

  en: {
    // App Bar & Branding
    appTitle: "FleetMaster-Pro",
    appSubtitle: "Intelligent Fleet Management & Maintenance SaaS",
    tenantSelectorLabel: "Company",
    selectTenantPlaceholder: "Select company...",
    switchLanguage: "Switch language",
    profileRoleSuperAdmin: "Global SuperAdmin",
    profileRoleTenantAdmin: "Fleet Manager",
    profileRoleDriver: "Driver",
    btnLogout: "Log out",
    btnLogin: "Log in",

    // Auth & Login Screen
    loginScreenTitle: "Sign in to FleetMaster-Pro",
    loginSubtitle: "Enter your corporate credentials to access the fleet management system",
    inputUsernameLabel: "Username",
    inputUsernamePlaceholder: "E.g. admin_valencia",
    inputPasswordLabel: "Password",
    inputPasswordPlaceholder: "Enter your password",
    loginSubmitBtn: "Sign in",
    loginLoggingIn: "Signing in...",
    loginErrorInvalid: "Invalid credentials. Please verify your username and password.",
    loginSelectTenant: "Company / Fleet",
    demoCredentialsTitle: "Quick demo credentials:",
    quickFillVal: "València Admin",
    quickFillMed: "Mediterrània Admin",
    quickFillDriver: "Driver Joan",
    quickFillSuper: "SuperAdmin",
    welcomeBack: "Welcome back",
    currentUser: "Connected user",
    loginModalTitle: "Sign in to FleetMaster-Pro",

    // Navigation Tabs
    tabDashboard: "Dashboard",
    tabVehicles: "Vehicle Fleet",
    tabMaintenance: "MOT/ITV & Maintenance",
    tabFuel: "Fuel & Mileage Logs",
    tabTenantSettings: "Company Settings",

    // Dashboard KPIs
    kpiTotalVehicles: "Active Vehicles",
    kpiPendingItv: "Upcoming MOT/ITV (< 30 days)",
    kpiUpcomingMaintenance: "Pending Service Inspections",
    kpiFuelConsumption: "Monthly Fuel Cost",
    kpiOdometerTotal: "Total Distance Logged (km)",
    recentAlertsTitle: "Imminent Maintenance & Expiration Alerts",
    noAlertsMessage: "No pending alerts. All vehicles comply with the maintenance plan.",

    // Vehicles Section
    btnNewVehicle: "Add Vehicle",
    filterVehiclesPlaceholder: "Filter by license plate, make, or model...",
    colLicensePlate: "License Plate",
    colVehicle: "Vehicle (Make & Model)",
    colYear: "Year",
    colFuelType: "Fuel Type",
    colOdometer: "Odometer (km)",
    colStatus: "Status",
    colAssignedDriver: "Assigned Driver",
    colItvDate: "MOT/ITV Expiration",
    colNextService: "Next Service (km)",
    colActions: "Actions",
    statusActive: "Active",
    statusMaintenance: "In Workshop",
    statusOutOfService: "Out of Service",
    unassignedDriver: "Unassigned",

    // Maintenance Section
    btnNewMaintenance: "Schedule Maintenance",
    colMaintenanceType: "Service Type",
    colScheduledDate: "Scheduled Date",
    colCompletedDate: "Completion Date",
    colWorkshop: "Workshop / Provider",
    colCost: "Cost (€)",
    colMaintenanceStatus: "Status",
    maintTypeItv: "Technical Inspection (MOT/ITV)",
    maintTypeOil: "Engine Oil & Oil Filter Change",
    maintTypeFilters: "Filters Replacement (Air/Cabin)",
    maintTypeBrakes: "Brake Pads & Discs",
    maintTypeTires: "Tires & Balancing",
    maintTypeGeneral: "General Mechanical Repair",
    maintStatusScheduled: "Scheduled",
    maintStatusCompleted: "Completed",
    maintStatusCancelled: "Cancelled",

    // Fuel Logs Section
    btnNewFuelLog: "Log Fuel Receipt",
    colDate: "Date",
    colLiters: "Liters",
    colPriceEur: "Total (€)",
    colFuelStation: "Fuel Station",
    colReceipt: "Receipt / Invoice",

    // Modal & Form Labels
    modalSaveBtn: "Save Record",
    modalCancelBtn: "Cancel",
    inputPlateLabel: "Official License Plate",
    inputMakeLabel: "Make",
    inputModelLabel: "Model",
    inputYearLabel: "Manufacturing Year",
    inputVinLabel: "VIN Number",
    inputFuelLabel: "Fuel Type",
    inputOdometerLabel: "Current Odometer (km)",
    inputItvDateLabel: "MOT/ITV Expiration Date",
    inputNotesLabel: "Additional Notes",

    // General / Feedback
    loadingMessage: "Loading data...",
    savedSuccessMessage: "Record saved successfully.",
    deletedSuccessMessage: "Record deleted successfully.",
    confirmDeletePrompt: "Are you sure you want to delete this record?",
    emptyTableMessage: "No records found matching this query."
  }
};

export class LanguageManager {
  private static currentLang: SupportedLanguage = 'va';

  public static init(): void {
    const saved = localStorage.getItem('fleetmaster_lang') as SupportedLanguage;
    if (saved && (saved === 'va' || saved === 'es' || saved === 'en')) {
      this.currentLang = saved;
    } else {
      this.currentLang = 'va'; // Default to Valencian as requested
    }
    this.setupCustomLanguageSelectors();
    this.applyTranslations();
  }

  public static getLanguage(): SupportedLanguage {
    return this.currentLang;
  }

  public static setLanguage(lang: SupportedLanguage): void {
    this.currentLang = lang;
    localStorage.setItem('fleetmaster_lang', lang);
    this.updateLanguageSelectorsUI();
    this.applyTranslations();
    document.dispatchEvent(new CustomEvent('app:language-changed', { detail: { lang } }));
  }

  public static t(key: string): string {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS['va'];
    return dict[key] || TRANSLATIONS['es'][key] || TRANSLATIONS['en'][key] || `[${key}]`;
  }

  public static setupCustomLanguageSelectors(): void {
    // Close dropdowns on outside click or escape
    document.addEventListener('click', (e) => {
      document.querySelectorAll<HTMLElement>('.custom-lang-selector').forEach(selector => {
        if (!selector.contains(e.target as Node)) {
          selector.classList.remove('open');
          const btn = selector.querySelector('.lang-select-btn');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll<HTMLElement>('.custom-lang-selector').forEach(selector => {
          selector.classList.remove('open');
          const btn = selector.querySelector('.lang-select-btn');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    });

    this.renderCustomSelectors();
  }

  public static renderCustomSelectors(): void {
    const selectors = document.querySelectorAll<HTMLElement>('.custom-lang-selector');
    selectors.forEach(container => {
      const btn = container.querySelector<HTMLButtonElement>('.lang-select-btn');
      const panel = container.querySelector<HTMLElement>('.lang-dropdown-panel');

      if (btn && !btn.dataset.initialized) {
        btn.dataset.initialized = 'true';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = container.classList.toggle('open');
          btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }

      if (panel) {
        panel.innerHTML = '';
        SUPPORTED_LANGUAGES.forEach(meta => {
          const item = document.createElement('div');
          item.className = `lang-dropdown-item ${meta.code === this.currentLang ? 'active' : ''}`;
          item.setAttribute('role', 'option');
          item.setAttribute('data-lang', meta.code);
          item.setAttribute('aria-selected', meta.code === this.currentLang ? 'true' : 'false');
          item.innerHTML = `
            <span class="lang-item-flag">${renderFlagHtml(meta.code)}</span>
            <span class="lang-item-name">${meta.name}</span>
            <span class="lang-item-code">${meta.label}</span>
          `;
          item.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setLanguage(meta.code);
            container.classList.remove('open');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          });
          panel.appendChild(item);
        });
      }
    });

    this.updateLanguageSelectorsUI();
  }

  public static updateLanguageSelectorsUI(): void {
    const selectors = document.querySelectorAll<HTMLElement>('.custom-lang-selector');
    selectors.forEach(container => {
      const btnFlag = container.querySelector<HTMLElement>('.lang-btn-flag');
      const btnCode = container.querySelector<HTMLElement>('.lang-btn-code');
      const panel = container.querySelector<HTMLElement>('.lang-dropdown-panel');

      if (btnFlag) {
        btnFlag.innerHTML = renderFlagHtml(this.currentLang);
      }
      if (btnCode) {
        btnCode.textContent = LANGUAGE_META[this.currentLang].label;
      }

      if (panel) {
        panel.querySelectorAll<HTMLElement>('.lang-dropdown-item').forEach(el => {
          const lang = el.getAttribute('data-lang');
          if (lang === this.currentLang) {
            el.classList.add('active');
            el.setAttribute('aria-selected', 'true');
          } else {
            el.classList.remove('active');
            el.setAttribute('aria-selected', 'false');
          }
        });
      }
    });
  }

  public static applyTranslations(root: HTMLElement | Document = document): void {
    const elements = root.querySelectorAll<HTMLElement>('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    const placeholders = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-i18n-placeholder]');
    placeholders.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.placeholder = this.t(key);
      }
    });

    this.updateLanguageSelectorsUI();
  }
}
