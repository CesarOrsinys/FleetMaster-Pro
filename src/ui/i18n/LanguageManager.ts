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
    tabDashboardShort: "Panell",
    tabVehiclesShort: "Vehicles",
    tabMaintenanceShort: "ITV / Mant.",
    tabFuelShort: "Combustible",

    // Dashboard KPIs
    kpiTotalVehicles: "Vehicles Actius",
    kpiPendingItv: "ITV Pròximes (< 30 dies)",
    kpiUpcomingMaintenance: "Revisions Pendents",
    kpiFuelConsumption: "Despesa en Combustible (Mes)",
    kpiOdometerTotal: "Quilòmetres Totals Recorreguts",
    recentAlertsTitle: "Alertes i Venciments Imminents",
    noAlertsMessage: "No hi ha alertes pendents. Tots els vehicles compleixen amb el pla de manteniment.",
    kpiTotalVehiclesDesc: "Flota operativa assignada a l'empresa",
    kpiPendingItvDesc: "Inspeccions tècniques urgents requerides",
    kpiUpcomingMaintDesc: "Oli, frens o filtres programats",
    kpiFuelExpenseDesc: "Mes actual (facturació en curs)",

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

    // Fuel Types
    fuel_diesel: "Dièsel",
    fuel_gasoline: "Gasolina",
    fuel_electric: "Elèctric",
    fuel_hybrid: "Híbrid",
    fuel_plugin_hybrid: "Híbrid Endollable",
    fuel_cng_gas: "Gas GNC",

    // Vehicle Statuses
    status_active: "Actiu",
    status_maintenance: "En Taller",
    status_out_of_service: "Fora de Servei",

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

    // Maintenance Types
    maint_type_oil_change: "Canvi d'Oli i Filtres",
    maint_type_itv_mot: "Inspecció Tècnica (ITV)",
    maint_type_brakes: "Pastilles i Discos de Fre",
    maint_type_tires: "Canvi de Pneumàtics",
    maint_type_filters: "Filtres d'Aire i Habitacle",
    maint_type_general_repair: "Reparació Mecànica General",
    maint_type_bodywork: "Planxa i Pintura",

    // Maintenance Statuses
    maint_status_scheduled: "Programada",
    maint_status_in_progress: "En Curs",
    maint_status_completed: "Realitzada",
    maint_status_cancelled: "Anul·lada",

    // Alerts & Urgency Badges
    badge_urgent: "URGENT",
    badge_scheduled: "PROGRAMAT",
    badge_in_progress: "EN CURS",
    alert_itv_imminent: "Venciment ITV el {date} ({days} dies restants)",
    alert_maint_scheduled: "{type} programat per al {date}",
    alert_oil_odometer: "Pròxima revisió d'oli als {targetKm} km (actual: {curKm} km)",

    // Tenants
    tenant_valencia_name: "València Transports Logístics SL",
    tenant_med_name: "Mediterrània Fleet Services SA",

    // Fuel Logs Section
    btnNewFuelLog: "Registrar Repostatge",
    colDate: "Data",
    colLiters: "Litres",
    colPriceEur: "Total (€)",
    colFuelStation: "Estació de Servei",
    colReceipt: "Tiquet / Factura",

    // Modals & Form Labels
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
    modalNewVehicleTitle: "Registrar Nou Vehicle a la Flota",
    modalNewMaintenanceTitle: "Programar Manteniment o ITV",
    modalNewFuelLogTitle: "Registrar Repostatge de Combustible",
    inputWorkshopLabel: "Taller o Proveïdor",
    inputCostLabel: "Cost estimat / import (€)",
    inputScheduledDateLabel: "Data programada",
    inputLitersLabel: "Litres repostats (L)",
    inputFuelStationLabel: "Estació de servei",
    inputDateLabel: "Data del registre",
    selectVehiclePlaceholder: "Tria vehicle...",
    inputNextServiceKmLabel: "Pròxima revisió de manteniment (km)",
    inputStatusLabel: "Estat operatiu",
    inputInterventionTypeLabel: "Tipus d'intervenció",

    // Success & Error Feedback
    loadingMessage: "Carregant dades...",
    savedSuccessMessage: "Registre guardat correctament.",
    deletedSuccessMessage: "Registre eliminat satisfactòriament.",
    confirmDeletePrompt: "Segur que desitges eliminar este registre?",
    emptyTableMessage: "No s'han trobat registres per a esta consulta.",
    successVehicleCreated: "Vehicle registrat amb èxit en la flota.",
    successMaintenanceCreated: "Intervenció de manteniment programada amb èxit.",
    successFuelLogged: "Repostatge guardat correctament en el sistema.",
    error_network: "Error de connexió amb el servidor. Reintenta-ho en uns segons.",
    error_unauthorized: "Sessió caducada o credencials no vàlides.",
    error_required_fields: "Si us plau, ompli tots els camps obligatoris.",
    error_vehicle_not_found: "No s'ha trobat el vehicle especificat.",
    error_internal: "S'ha produït un error intern en el servidor.",

    // ITV & Maintenance Split Sections & Mobile Views
    sectionItvExpiration: "Control i Venciment d'ITV per Vehicle",
    sectionItvSubtitle: "Supervisió de dates límit d'inspecció periòdica i observacions tècniques per unitat",
    sectionMaintenanceRecords: "Historial d'Intervencions i Manteniments Programats",
    sectionMaintSubtitle: "Registre detallat de reparacions, costos i tallers proveïdors",

    // ITV Columns & Attributes
    colItvRemaining: "Dies Restants",
    colItvStatus: "Estat ITV",
    colObservations: "Observacions i Estat Tècnic",

    // ITV Status Tags
    itv_status_valid: "Vigent",
    itv_status_expiring: "Pròxima ({days} dies)",
    itv_status_urgent: "Urgent ({days} dies)",
    itv_status_expired: "Caducada fa {days} dies",

    // Mobile Table / Cards Switcher
    viewModeTable: "Taula",
    viewModeCards: "Targetes",
    mobileScrollHint: "👈 Desplaça horitzontalment per a veure la taula completa 👉",
    viewDetailsBtn: "Veure Detalls",
    clickForDetailsHint: "Clica per a consultar els detalls complets",

    // Modals for ITV and Maintenance Details
    modalItvDetailsTitle: "Fitxa Tècnica i Estat d'ITV",
    modalMaintDetailsTitle: "Detalls de la Intervenció de Manteniment",
    lblPendingMaint: "Manteniments Pendents o Programats",
    lblNoPendingMaint: "Sense manteniments pendents programats per a este vehicle.",
    lblItvInfo: "Dades de la Inspecció Tècnica (ITV)",
    lblTechnicalNotes: "Observacions Tècniques del Vehicle",
    btnScheduleService: "Programar Intervenció",
    btnClose: "Tancar"
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
    tabDashboardShort: "Panel",
    tabVehiclesShort: "Vehículos",
    tabMaintenanceShort: "ITV / Mant.",
    tabFuelShort: "Combustible",

    // Dashboard KPIs
    kpiTotalVehicles: "Vehículos Activos",
    kpiPendingItv: "ITV Próximas (< 30 días)",
    kpiUpcomingMaintenance: "Revisiones Pendientes",
    kpiFuelConsumption: "Gasto en Combustible (Mes)",
    kpiOdometerTotal: "Kilómetros Totales Recorridos",
    recentAlertsTitle: "Alertas y Vencimientos Inminentes",
    noAlertsMessage: "No hay alertas pendientes. Todos los vehículos cumplen con el plan de mantenimiento.",
    kpiTotalVehiclesDesc: "Flota operativa asignada a la empresa",
    kpiPendingItvDesc: "Inspecciones técnicas urgentes requeridas",
    kpiUpcomingMaintDesc: "Aceite, frenos o filtros programados",
    kpiFuelExpenseDesc: "Mes actual (facturación en curso)",

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

    // Fuel Types
    fuel_diesel: "Diésel",
    fuel_gasoline: "Gasolina",
    fuel_electric: "Eléctrico",
    fuel_hybrid: "Híbrido",
    fuel_plugin_hybrid: "Híbrido Enchufable",
    fuel_cng_gas: "Gas GNC",

    // Vehicle Statuses
    status_active: "Activo",
    status_maintenance: "En Taller",
    status_out_of_service: "Fuera de Servicio",

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

    // Maintenance Types
    maint_type_oil_change: "Cambio de Aceite y Filtros",
    maint_type_itv_mot: "Inspección Técnica (ITV)",
    maint_type_brakes: "Pastillas y Discos de Freno",
    maint_type_tires: "Cambio de Neumáticos",
    maint_type_filters: "Filtros de Aire y Habitáculo",
    maint_type_general_repair: "Reparación Mecánica General",
    maint_type_bodywork: "Chapa y Pintura",

    // Maintenance Statuses
    maint_status_scheduled: "Programada",
    maint_status_in_progress: "En Curso",
    maint_status_completed: "Realizada",
    maint_status_cancelled: "Anulada",

    // Alerts & Urgency Badges
    badge_urgent: "URGENTE",
    badge_scheduled: "PROGRAMADO",
    badge_in_progress: "EN CURSO",
    alert_itv_imminent: "Vencimiento ITV el {date} ({days} días restantes)",
    alert_maint_scheduled: "{type} programado para el {date}",
    alert_oil_odometer: "Próxima revisión de aceite a los {targetKm} km (actual: {curKm} km)",

    // Tenants
    tenant_valencia_name: "València Transports Logístics SL",
    tenant_med_name: "Mediterrània Fleet Services SA",

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
    modalNewVehicleTitle: "Registrar Nuevo Vehículo en la Flota",
    modalNewMaintenanceTitle: "Programar Mantenimiento o ITV",
    modalNewFuelLogTitle: "Registrar Repostaje de Combustible",
    inputWorkshopLabel: "Taller o Proveedor",
    inputCostLabel: "Coste estimado / importe (€)",
    inputScheduledDateLabel: "Fecha programada",
    inputLitersLabel: "Litros repostados (L)",
    inputFuelStationLabel: "Estación de servicio",
    inputDateLabel: "Fecha del registro",
    selectVehiclePlaceholder: "Elige vehículo...",
    inputNextServiceKmLabel: "Próxima revisión de mantenimiento (km)",
    inputStatusLabel: "Estado operativo",
    inputInterventionTypeLabel: "Tipo de intervención",

    // Success & Error Feedback
    loadingMessage: "Cargando datos...",
    savedSuccessMessage: "Registro guardado correctamente.",
    deletedSuccessMessage: "Registro eliminado satisfactoriamente.",
    confirmDeletePrompt: "¿Seguro que deseas eliminar este registro?",
    emptyTableMessage: "No se han encontrado registros para esta consulta.",
    successVehicleCreated: "Vehículo registrado con éxito en la flota.",
    successMaintenanceCreated: "Intervención de mantenimiento programada con éxito.",
    successFuelLogged: "Repostaje guardado correctamente en el sistema.",
    error_network: "Error de conexión con el servidor. Reinténtalo en unos segundos.",
    error_unauthorized: "Sesión caducada o credenciales no válidas.",
    error_required_fields: "Por favor, completa todos los campos requeridos.",
    error_vehicle_not_found: "No se ha encontrado el vehículo especificado.",
    error_internal: "Se ha producido un error interno en el servidor.",

    // ITV & Maintenance Split Sections & Mobile Views
    sectionItvExpiration: "Control y Vencimiento de ITV por Vehículo",
    sectionItvSubtitle: "Supervisión de fechas límite de inspección periódica y observaciones técnicas por unidad",
    sectionMaintenanceRecords: "Historial de Intervenciones y Mantenimientos Programados",
    sectionMaintSubtitle: "Registro detallado de reparaciones, costes y talleres proveedores",

    // ITV Columns & Attributes
    colItvRemaining: "Días Restantes",
    colItvStatus: "Estado ITV",
    colObservations: "Observaciones y Estado Técnico",

    // ITV Status Tags
    itv_status_valid: "Vigente",
    itv_status_expiring: "Próxima ({days} días)",
    itv_status_urgent: "Urgente ({days} días)",
    itv_status_expired: "Caducada hace {days} días",

    // Mobile Table / Cards Switcher
    viewModeTable: "Tabla",
    viewModeCards: "Tarjetas",
    mobileScrollHint: "👈 Desplaza horizontalmente para ver la tabla completa 👉",
    viewDetailsBtn: "Ver Detalles",
    clickForDetailsHint: "Clica para consultar los detalles completos",

    // Modals for ITV and Maintenance Details
    modalItvDetailsTitle: "Ficha Técnica y Estado de ITV",
    modalMaintDetailsTitle: "Detalles de la Intervención de Mantenimiento",
    lblPendingMaint: "Mantenimientos Pendientes o Programados",
    lblNoPendingMaint: "Sin mantenimientos pendientes programados para este vehículo.",
    lblItvInfo: "Datos de la Inspección Técnica (ITV)",
    lblTechnicalNotes: "Observaciones Técnicas del Vehículo",
    btnScheduleService: "Programar Intervención",
    btnClose: "Cerrar"
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
    tabDashboardShort: "Dashboard",
    tabVehiclesShort: "Vehicles",
    tabMaintenanceShort: "MOT & Service",
    tabFuelShort: "Fuel",

    // Dashboard KPIs
    kpiTotalVehicles: "Active Vehicles",
    kpiPendingItv: "Upcoming MOT/ITV (< 30 days)",
    kpiUpcomingMaintenance: "Pending Service Inspections",
    kpiFuelConsumption: "Monthly Fuel Cost",
    kpiOdometerTotal: "Total Distance Logged (km)",
    recentAlertsTitle: "Imminent Maintenance & Expiration Alerts",
    noAlertsMessage: "No pending alerts. All vehicles comply with the maintenance plan.",
    kpiTotalVehiclesDesc: "Operational fleet assigned to company",
    kpiPendingItvDesc: "Urgent vehicle inspections required",
    kpiUpcomingMaintDesc: "Oil, brakes or filter services scheduled",
    kpiFuelExpenseDesc: "Current month (billing in progress)",

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

    // Fuel Types
    fuel_diesel: "Diesel",
    fuel_gasoline: "Gasoline",
    fuel_electric: "Electric",
    fuel_hybrid: "Hybrid",
    fuel_plugin_hybrid: "Plug-in Hybrid",
    fuel_cng_gas: "CNG Gas",

    // Vehicle Statuses
    status_active: "Active",
    status_maintenance: "In Workshop",
    status_out_of_service: "Out of Service",

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

    // Maintenance Types
    maint_type_oil_change: "Oil & Filter Service",
    maint_type_itv_mot: "Technical Inspection (MOT/ITV)",
    maint_type_brakes: "Brake Pads & Discs",
    maint_type_tires: "Tire Replacement",
    maint_type_filters: "Air & Cabin Filters",
    maint_type_general_repair: "General Mechanical Repair",
    maint_type_bodywork: "Bodywork & Paint",

    // Maintenance Statuses
    maint_status_scheduled: "Scheduled",
    maint_status_in_progress: "In Progress",
    maint_status_completed: "Completed",
    maint_status_cancelled: "Cancelled",

    // Alerts & Urgency Badges
    badge_urgent: "URGENT",
    badge_scheduled: "SCHEDULED",
    badge_in_progress: "IN PROGRESS",
    alert_itv_imminent: "MOT/ITV expiration on {date} ({days} days remaining)",
    alert_maint_scheduled: "{type} scheduled for {date}",
    alert_oil_odometer: "Next oil service at {targetKm} km (current: {curKm} km)",

    // Tenants
    tenant_valencia_name: "València Transports Logístics SL",
    tenant_med_name: "Mediterrània Fleet Services SA",

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
    modalNewVehicleTitle: "Register New Fleet Vehicle",
    modalNewMaintenanceTitle: "Schedule Maintenance or MOT/ITV",
    modalNewFuelLogTitle: "Log Fuel Receipt",
    inputWorkshopLabel: "Workshop or Provider",
    inputCostLabel: "Estimated Cost (€)",
    inputScheduledDateLabel: "Scheduled Date",
    inputLitersLabel: "Liters Filled (L)",
    inputFuelStationLabel: "Fuel Station",
    inputDateLabel: "Record Date",
    selectVehiclePlaceholder: "Select vehicle...",
    inputNextServiceKmLabel: "Next Scheduled Maintenance (km)",
    inputStatusLabel: "Operational Status",
    inputInterventionTypeLabel: "Intervention Type",

    // Success & Error Feedback
    loadingMessage: "Loading data...",
    savedSuccessMessage: "Record saved successfully.",
    deletedSuccessMessage: "Record deleted successfully.",
    confirmDeletePrompt: "Are you sure you want to delete this record?",
    emptyTableMessage: "No records found matching this query.",
    successVehicleCreated: "Vehicle successfully registered in the fleet.",
    successMaintenanceCreated: "Maintenance intervention scheduled successfully.",
    successFuelLogged: "Fuel receipt successfully saved in the system.",
    error_network: "Network connection error. Please try again shortly.",
    error_unauthorized: "Session expired or invalid credentials.",
    error_required_fields: "Please fill in all required fields.",
    error_vehicle_not_found: "The specified vehicle was not found.",
    error_internal: "An internal server error occurred.",

    // ITV & Maintenance Split Sections & Mobile Views
    sectionItvExpiration: "Vehicle MOT & ITV Expiration Control",
    sectionItvSubtitle: "Periodic technical inspection deadlines and technical notes per unit",
    sectionMaintenanceRecords: "Intervention History & Scheduled Maintenance",
    sectionMaintSubtitle: "Detailed record of repairs, costs, and service workshops",

    // ITV Columns & Attributes
    colItvRemaining: "Remaining Days",
    colItvStatus: "MOT Status",
    colObservations: "Observations & Technical Condition",

    // ITV Status Tags
    itv_status_valid: "Valid",
    itv_status_expiring: "Expiring Soon ({days} days)",
    itv_status_urgent: "Urgent ({days} days)",
    itv_status_expired: "Expired {days} days ago",

    // Mobile Table / Cards Switcher
    viewModeTable: "Table",
    viewModeCards: "Cards",
    mobileScrollHint: "👈 Swipe horizontally to view full table 👉",
    viewDetailsBtn: "View Details",
    clickForDetailsHint: "Click to view full details",

    // Modals for ITV and Maintenance Details
    modalItvDetailsTitle: "Technical Sheet & MOT Status",
    modalMaintDetailsTitle: "Maintenance Intervention Details",
    lblPendingMaint: "Pending or Scheduled Maintenance",
    lblNoPendingMaint: "No pending maintenance scheduled for this vehicle.",
    lblItvInfo: "Technical Inspection (MOT) Data",
    lblTechnicalNotes: "Vehicle Technical Observations",
    btnScheduleService: "Schedule Service",
    btnClose: "Close"
  }
};

export class LanguageManager {
  private static currentLang: SupportedLanguage = 'va';

  public static init(): void {
    let saved: SupportedLanguage | null = null;
    if (typeof localStorage !== 'undefined') {
      saved = localStorage.getItem('fleetmaster_lang') as SupportedLanguage;
    }
    if (saved && (saved === 'va' || saved === 'es' || saved === 'en')) {
      this.currentLang = saved;
    } else {
      this.currentLang = 'va'; // Default to Valencian as requested
    }
    if (typeof document !== 'undefined') {
      this.setupCustomLanguageSelectors();
      this.applyTranslations();
    }
  }

  public static getLanguage(): SupportedLanguage {
    return this.currentLang;
  }

  public static setLanguage(lang: SupportedLanguage): void {
    this.currentLang = lang;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fleetmaster_lang', lang);
    }
    if (typeof document !== 'undefined') {
      this.updateLanguageSelectorsUI();
      this.applyTranslations();
      document.dispatchEvent(new CustomEvent('app:language-changed', { detail: { lang } }));
    }
  }

  public static t(key: string, params?: Record<string, string | number>): string {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS['va'];
    let text = dict[key] || TRANSLATIONS['es'][key] || TRANSLATIONS['en'][key] || `[${key}]`;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  }

  public static setupCustomLanguageSelectors(): void {
    if (typeof document === 'undefined') return;
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
    if (typeof document === 'undefined') return;
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
    if (typeof document === 'undefined') return;
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

  public static applyTranslations(root?: HTMLElement | Document): void {
    if (typeof document === 'undefined') return;
    const targetRoot = root || document;
    const elements = targetRoot.querySelectorAll<HTMLElement>('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    const placeholders = targetRoot.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-i18n-placeholder]');
    placeholders.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.placeholder = this.t(key);
      }
    });

    this.updateLanguageSelectorsUI();
  }
}
