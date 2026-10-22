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
    loadingTenants: "Carregant empreses...",
    switchTenantTooltip: "Canviar d'empresa (Accés SuperAdmin)",
    tenantLockedTooltip: "Empresa assignada al teu compte",

    // Navigation Tabs
    tabDashboard: "Panell de Control",
    tabVehicles: "Parc de Vehicles",
    tabMaintenance: "ITV i Manteniment",
    tabFuel: "Combustible i Quilometratge",
    tabTenantSettings: "Configuració d'Empresa",
    tabDashboardShort: "Panell",
    tabVehiclesShort: "Vehicles",
    tabDrivers: "Conductors",
    tabDriversShort: "Conductors",
    tabMaintenanceShort: "ITV / Mant.",
    tabFuelShort: "Combustible",
    tabFines: "Multes i Sancions",
    tabFinesShort: "Multes",

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
    fuelKpiLastFill: "Darrer Repostatge",
    fuelKpiLastFillDesc: "Data, vehicle i estació del darrer dipòsit",
    fuelKpiAvgConsumption: "Consum Mitjà de la Flota",
    fuelKpiAvgConsumptionDesc: "Mitjana estimada de litres / 100 km",
    fuelKpiAvgPrice: "Preu Mitjà del Combustible",
    fuelKpiAvgPriceDesc: "Cost per litre (€/L) en proveïments",
    fuelKpiDistanceBetween: "Distància Mitjana entre Dipòsits",
    fuelKpiDistanceBetweenDesc: "Quilòmetres recorreguts entre càrregues",
    colOdometerAtFill: "Odòmetre al Repostar",
    colDeltaKm: "Km des del darrer dipòsit",
    colPricePerLiter: "Preu / Litre",
    colAvgConsumption: "Consum (L/100km)",
    colCostPerKm: "Cost / km",
    colTankStatus: "Estat Dipòsit",
    lblFullTank: "Dipòsit Ple",
    lblPartialTank: "Càrrega Parcial",
    lblInitialFill: "Primer Registre (Base)",
    inputFullTankLabel: "Depòsit complet (per a càlcul exacte de consum)",
    lblLastOdometerHint: "Darrer odòmetre registrat:",

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
    lblNoObservations: "Sense observacions addicionals registrades.",

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
    btnClose: "Tancar",

    // Global Service Loader
    loadingServiceText: "Carregant dades del servei...",

    // Drivers Section
    driversSectionTitle: "Gestió de Conductors i Personal de Flota",
    btnNewDriver: "Registrar Nou Conductor",
    driverKpiTotal: "Total Conductors",
    driverKpiTotalDesc: "Conductors registrats en la flota",
    driverKpiActive: "Conductors Actius",
    driverKpiActiveDesc: "Personal amb llicència en vigor",
    driverKpiAssigned: "Amb Vehicle Assignat",
    driverKpiAssignedDesc: "Conductors amb vehicle vinculat",
    colDriverName: "Nom del Conductor",
    colLicenseNumber: "Núm. Llicència / Carnet",
    colAssignedVehicle: "Vehicle Assignat",
    colDriverPhone: "Telèfon",
    colDriverEmail: "Correu Electrònic",
    colDriverStatus: "Estat Conductor",
    lblAssignedDriver: "Conductor Assignat",
    lblNoDriverAssigned: "Sense conductor assignat",
    lblDriverVehicleBadge: "Conductor:",
    lblDriverBannerHello: "Hola, {name}!",
    lblDriverBannerVehicle: "El teu vehicle assignat és:",
    lblDriverBannerTip: "Pots registrar directament els teus proveïments de combustible i consultar les dades del teu vehicle.",
    modalNewDriverTitle: "Registrar Nou Conductor",
    inputDriverFullName: "Nom i cognoms",
    inputDriverUsername: "Nom d'usuari d'accés",
    inputDriverEmail: "Correu corporatiu",
    inputDriverPhone: "Telèfon de contacte",
    inputDriverLicense: "Número de carnet de conduir (DGT)",
    inputDriverAssignVeh: "Assignar Vehicle de la flota",
    inputVehicleAssignDriver: "Conductor Assignat (opcional)",
    successDriverCreated: "Conductor registrat correctament!",
    successDriverAssigned: "Vehicle assignat al conductor amb èxit!",

    // Fines Section (Multes)
    finesSectionTitle: "Gestió de Multes i Expedients Sancionadors",
    btnNewFine: "Registrar Sanció / Multa",
    fineKpiPendingAmount: "Import Pendent de Pagament",
    fineKpiPendingAmountDesc: "Total de sancions pendents",
    fineKpiPendingCount: "Multes Pendents",
    fineKpiPendingCountDesc: "Expedients sense abonar",
    fineKpiTotalPaid: "Total Abonat en Multes",
    fineKpiTotalPaidDesc: "Sancions pagades de la flota",
    colFineReason: "Motiu de la Infracció",
    colFineAmount: "Import (€)",
    colFineDate: "Data Infracció",
    colFineOrganism: "Organisme Emissor",
    colFineReference: "Núm. Expedient",
    colFineStatus: "Estat Multa",
    fine_status_pending: "Pendent",
    fine_status_paid: "Pagada",
    fine_status_appealed: "Recorreguda",
    btnPayFine: "Marcar com a Pagada",
    modalNewFineTitle: "Registrar Nova Sanció o Multa",
    inputFineReason: "Motiu de la infracció",
    inputFineAmount: "Import de la sanció (€)",
    inputFineDate: "Data de la denúncia",
    inputFineOrganism: "Organisme / Policia / DGT",
    inputFineReference: "Número d'expedient o butlletí",
    successFineCreated: "Multa registrada correctament!",
    successFineStatusUpdated: "Estat de la multa actualitzat correctament!",
    btnRefresh: "Refrescar",
    btnRefreshing: "Actualitzant...",
    successDataRefreshed: "Dades de la flota actualitzades correctament!",

    // Driver Portal & KPIs
    driverPortalWelcome: "Hola, Conductor",
    driverAssignedVehicle: "Vehicle assignat:",
    btnDriverQuickFuel: "Reportar Repostatge d'avui",
    kpiTotalDrivers: "Conductores Totals",
    kpiTotalDriversDesc: "Personal de conducció registrat a la flota",
    kpiAssignedDrivers: "Amb Vehicle Assignat",
    kpiAssignedDriversDesc: "Conductores vinculats actualment a un vehicle",
    kpiUnassignedDrivers: "Sense Vehicle Assignat",
    kpiUnassignedDriversDesc: "Conductores disponibles per a assignació",
    colDriver: "Conductor",
    colPhone: "Telèfon",
    colEmail: "Correu Electrònic",
    driverUnassigned: "Sense assignar",

    // Traffic Fines KPIs & Actions
    kpiTotalFines: "Multes Totals",
    kpiTotalFinesDesc: "Expedients sancionadors registrats",
    kpiPendingFines: "Pendents de Pagament",
    kpiPendingFinesDesc: "Sancions pendents d'abonar o recórrer",
    kpiTotalFinesAmount: "Import Total Sancions",
    kpiTotalFinesAmountDesc: "Volum econòmic total de multes",
    btnMarkFinePaid: "Marcar com a Pagada",
    successFinePaid: "Multa marcada com a pagada correctament!",

    // Modal Options & Dropdowns
    optNoDriver: "-- Sense conductor assignat --",
    optNoVehicle: "-- Sense vehicle assignat inicialment --",

    // Modal Form Labels
    inputDriverNameLabel: "Nom i Cognoms",
    inputLicenseLabel: "Permís de Conduir / Llicència",
    inputAssignedVehicleLabel: "Vehicle Assignat (Opcional)",
    inputFineAmountLabel: "Import de la Multa (€)",
    inputFineReasonLabel: "Motiu de la Infracció",
    inputFineOrganismLabel: "Organisme Emissor",

    // Input Placeholders
    placeholderPlate: "Ex: 1234-BBB",
    placeholderVin: "VF1FL0000...",
    placeholderMake: "Ex: Renault",
    placeholderModel: "Ex: Trafic 2.0 dCi",
    placeholderNotes: "Observacions addicionals del vehicle...",
    placeholderWorkshop: "Ex: Tallers Morvedre",
    placeholderFuelStation: "Ex: Repsol Viver",
    placeholderFuelNotes: "Ex: Proveïment retorn centre logístic...",
    placeholderDriverName: "Ex: Joan Martí Ferrer",
    placeholderDriverUsername: "Ex: driver_joan",
    placeholderDriverEmail: "joan.marti@empresa.com",
    placeholderDriverPhone: "+34 612 345 678",
    placeholderDriverLicense: "B-12345678",
    placeholderFineAmount: "100.00",
    placeholderFineReason: "Ex: Excés de velocitat (radar fix A-7 km 342)",
    placeholderFineOrganism: "Ex: DGT / Ajuntament de València",
    placeholderFineNotes: "Núm. expedient sancionador, al·legacions...",

    // Units, Hints & Dynamic Formats
    unitDaysRemaining: "{days} dies restants",
    unitDaysExpired: "Caducada fa {days} dies",
    unitDaysCount: "{days} dies",
    unitDaysExpiredShort: "Caducada",
    hintOdometerLower: "⚠️ Odòmetre inferior al darrer registrat ({lastOdo} km)",
    hintApproxUnitPrice: "Preu aproximat: {price} €/L",
    lblDeltaFromLast: "+{km} km des d'últim",
    lblFullTankShort: "✓ Ple",
    lblPartialTankShort: "(Parcial)",
    defaultFuelStation: "Estació de Servei",
    userProfileTitle: "Perfil d'usuari",
    refreshDataTitle: "Refrescar dades"
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
    loadingTenants: "Cargando empresas...",
    switchTenantTooltip: "Cambiar de empresa (Acceso SuperAdmin)",
    tenantLockedTooltip: "Empresa asignada a tu cuenta",

    // Navigation Tabs
    tabDashboard: "Panel de Control",
    tabVehicles: "Parque de Vehículos",
    tabMaintenance: "ITV y Mantenimiento",
    tabFuel: "Combustible y Kilometraje",
    tabTenantSettings: "Configuración de Empresa",
    tabDashboardShort: "Panel",
    tabVehiclesShort: "Vehículos",
    tabDrivers: "Conductores",
    tabDriversShort: "Conductores",
    tabMaintenanceShort: "ITV / Mant.",
    tabFuelShort: "Combustible",
    tabFines: "Multas y Sanciones",
    tabFinesShort: "Multas",

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
    fuelKpiLastFill: "Último Repostaje",
    fuelKpiLastFillDesc: "Fecha, vehículo y estación del último depósito",
    fuelKpiAvgConsumption: "Consumo Medio de la Flota",
    fuelKpiAvgConsumptionDesc: "Media estimada de litros / 100 km",
    fuelKpiAvgPrice: "Precio Medio del Combustible",
    fuelKpiAvgPriceDesc: "Coste por litro (€/L) en repostajes",
    fuelKpiDistanceBetween: "Distancia Media entre Depósitos",
    fuelKpiDistanceBetweenDesc: "Kilómetros recorridos entre cargas",
    colOdometerAtFill: "Odómetro al Repostar",
    colDeltaKm: "Km desde último depósito",
    colPricePerLiter: "Precio / Litro",
    colAvgConsumption: "Consumo (L/100km)",
    colCostPerKm: "Coste / km",
    colTankStatus: "Estado Depósito",
    lblFullTank: "Depósito Lleno",
    lblPartialTank: "Carga Parcial",
    lblInitialFill: "Primer Registro (Base)",
    inputFullTankLabel: "Depósito completo (para cálculo exacto de consumo)",
    lblLastOdometerHint: "Último odómetro registrado:",

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
    lblNoObservations: "Sin observaciones adicionales registradas.",

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
    btnClose: "Cerrar",

    // Global Service Loader
    loadingServiceText: "Cargando datos del servicio...",

    // Drivers Section
    driversSectionTitle: "Gestión de Conductores y Personal de Flota",
    btnNewDriver: "Registrar Nuevo Conductor",
    driverKpiTotal: "Total Conductores",
    driverKpiTotalDesc: "Conductores registrados en la flota",
    driverKpiActive: "Conductores Activos",
    driverKpiActiveDesc: "Personal con carnet en vigor",
    driverKpiAssigned: "Con Vehículo Asignado",
    driverKpiAssignedDesc: "Conductores con vehículo vinculado",
    colDriverName: "Nombre del Conductor",
    colLicenseNumber: "Nº Licencia / Carnet",
    colAssignedVehicle: "Vehículo Asignado",
    colDriverPhone: "Teléfono",
    colDriverEmail: "Correo Electrónico",
    colDriverStatus: "Estado Conductor",
    lblAssignedDriver: "Conductor Asignado",
    lblNoDriverAssigned: "Sin conductor asignado",
    lblDriverVehicleBadge: "Conductor:",
    lblDriverBannerHello: "¡Hola, {name}!",
    lblDriverBannerVehicle: "Tu vehículo asignado es:",
    lblDriverBannerTip: "Puedes registrar directamente tus repostajes de combustible y consultar los datos de tu vehículo.",
    modalNewDriverTitle: "Registrar Nuevo Conductor",
    inputDriverFullName: "Nombre y apellidos",
    inputDriverUsername: "Nombre de usuario de acceso",
    inputDriverEmail: "Correo corporativo",
    inputDriverPhone: "Teléfono de contacto",
    inputDriverLicense: "Número de carnet de conducir (DGT)",
    inputDriverAssignVeh: "Asignar Vehículo de la flota",
    inputVehicleAssignDriver: "Conductor Asignado (opcional)",
    successDriverCreated: "¡Conductor registrado correctamente!",
    successDriverAssigned: "¡Vehículo asignado al conductor con éxito!",

    // Fines Section (Multas)
    finesSectionTitle: "Gestión de Multas y Expedientes Sancionadores",
    btnNewFine: "Registrar Sanción / Multa",
    fineKpiPendingAmount: "Importe Pendiente de Pago",
    fineKpiPendingAmountDesc: "Total de sanciones pendientes",
    fineKpiPendingCount: "Multas Pendientes",
    fineKpiPendingCountDesc: "Expedientes sin abonar",
    fineKpiTotalPaid: "Total Abonado en Multas",
    fineKpiTotalPaidDesc: "Sanciones pagadas de la flota",
    colFineReason: "Motivo de la Infracción",
    colFineAmount: "Importe (€)",
    colFineDate: "Fecha Infracción",
    colFineOrganism: "Organismo Emisor",
    colFineReference: "Nº Expediente",
    colFineStatus: "Estado Multa",
    fine_status_pending: "Pendiente",
    fine_status_paid: "Pagada",
    fine_status_appealed: "Recurrida",
    btnPayFine: "Marcar como Pagada",
    modalNewFineTitle: "Registrar Nueva Sanción o Multa",
    inputFineReason: "Motivo de la infracción",
    inputFineAmount: "Importe de la sanción (€)",
    inputFineDate: "Fecha de la denuncia",
    inputFineOrganism: "Organismo / Policía / DGT",
    inputFineReference: "Número de expediente o boletín",
    successFineCreated: "¡Multa registrada correctamente!",
    successFineStatusUpdated: "¡Estado de la multa actualizado correctamente!",
    btnRefresh: "Refrescar",
    btnRefreshing: "Actualizando...",
    successDataRefreshed: "¡Datos de la flota actualizados correctamente!",

    // Driver Portal & KPIs
    driverPortalWelcome: "Hola, Conductor",
    driverAssignedVehicle: "Vehículo asignado:",
    btnDriverQuickFuel: "Reportar Repostaje de hoy",
    kpiTotalDrivers: "Conductores Totales",
    kpiTotalDriversDesc: "Personal de conducción registrado en la flota",
    kpiAssignedDrivers: "Con Vehículo Asignado",
    kpiAssignedDriversDesc: "Conductores vinculados actualmente a un vehículo",
    kpiUnassignedDrivers: "Sin Vehículo Asignado",
    kpiUnassignedDriversDesc: "Conductores disponibles para asignación",
    colDriver: "Conductor",
    colPhone: "Teléfono",
    colEmail: "Correo Electrónico",
    driverUnassigned: "Sin asignar",

    // Traffic Fines KPIs & Actions
    kpiTotalFines: "Multas Totales",
    kpiTotalFinesDesc: "Expedientes sancionadores registrados",
    kpiPendingFines: "Pendientes de Pago",
    kpiPendingFinesDesc: "Sanciones pendientes de abonar o recurrir",
    kpiTotalFinesAmount: "Importe Total Sanciones",
    kpiTotalFinesAmountDesc: "Volumen económico total de multas",
    btnMarkFinePaid: "Marcar como Pagada",
    successFinePaid: "¡Multa marcada como pagada correctamente!",

    // Modal Options & Dropdowns
    optNoDriver: "-- Sin conductor asignado --",
    optNoVehicle: "-- Sin vehículo asignado inicialmente --",

    // Modal Form Labels
    inputDriverNameLabel: "Nombre y Apellidos",
    inputLicenseLabel: "Permiso de Conducir / Licencia",
    inputAssignedVehicleLabel: "Vehículo Asignado (Opcional)",
    inputFineAmountLabel: "Importe de la Multa (€)",
    inputFineReasonLabel: "Motivo de la Infracción",
    inputFineOrganismLabel: "Organismo Emisor",

    // Input Placeholders
    placeholderPlate: "Ej: 1234-BBB",
    placeholderVin: "VF1FL0000...",
    placeholderMake: "Ej: Renault",
    placeholderModel: "Ej: Trafic 2.0 dCi",
    placeholderNotes: "Observaciones adicionales del vehículo...",
    placeholderWorkshop: "Ej: Talleres Morvedre",
    placeholderFuelStation: "Ej: Repsol Viver",
    placeholderFuelNotes: "Ej: Repostaje de regreso a centro logístico...",
    placeholderDriverName: "Ej: Juan Martín Ferrer",
    placeholderDriverUsername: "Ej: conductor_juan",
    placeholderDriverEmail: "juan.martin@empresa.com",
    placeholderDriverPhone: "+34 612 345 678",
    placeholderDriverLicense: "B-12345678",
    placeholderFineAmount: "100.00",
    placeholderFineReason: "Ej: Exceso de velocidad (radar fijo A-7 km 342)",
    placeholderFineOrganism: "Ej: DGT / Ayuntamiento de Valencia",
    placeholderFineNotes: "Nº expediente sancionador, alegaciones...",

    // Units, Hints & Dynamic Formats
    unitDaysRemaining: "{days} días restantes",
    unitDaysExpired: "Caducada hace {days} días",
    unitDaysCount: "{days} días",
    unitDaysExpiredShort: "Caducada",
    hintOdometerLower: "⚠️ Odómetro inferior al último registrado ({lastOdo} km)",
    hintApproxUnitPrice: "Precio aproximado: {price} €/L",
    lblDeltaFromLast: "+{km} km desde último",
    lblFullTankShort: "✓ Lleno",
    lblPartialTankShort: "(Parcial)",
    defaultFuelStation: "Estación de Servicio",
    userProfileTitle: "Perfil de usuario",
    refreshDataTitle: "Refrescar datos"
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
    loadingTenants: "Loading companies...",
    switchTenantTooltip: "Switch company (SuperAdmin Access)",
    tenantLockedTooltip: "Company assigned to your account",

    // Navigation Tabs
    tabDashboard: "Dashboard",
    tabVehicles: "Vehicle Fleet",
    tabMaintenance: "MOT/ITV & Maintenance",
    tabFuel: "Fuel & Mileage Logs",
    tabTenantSettings: "Company Settings",
    tabDashboardShort: "Dashboard",
    tabVehiclesShort: "Vehicles",
    tabDrivers: "Drivers",
    tabDriversShort: "Drivers",
    tabMaintenanceShort: "MOT & Service",
    tabFuelShort: "Fuel",
    tabFines: "Fines & Penalties",
    tabFinesShort: "Fines",

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
    fuelKpiLastFill: "Last Refueling",
    fuelKpiLastFillDesc: "Date, vehicle and station of latest fill-up",
    fuelKpiAvgConsumption: "Fleet Average Consumption",
    fuelKpiAvgConsumptionDesc: "Estimated average liters / 100 km",
    fuelKpiAvgPrice: "Average Fuel Price",
    fuelKpiAvgPriceDesc: "Cost per liter (€/L) across fill-ups",
    fuelKpiDistanceBetween: "Average Distance Between Fills",
    fuelKpiDistanceBetweenDesc: "Distance covered between fill-ups",
    colOdometerAtFill: "Odometer at Refueling",
    colDeltaKm: "Km since last fill-up",
    colPricePerLiter: "Price / Liter",
    colAvgConsumption: "Consumption (L/100km)",
    colCostPerKm: "Cost / km",
    colTankStatus: "Tank Status",
    lblFullTank: "Full Tank",
    lblPartialTank: "Partial Fill",
    lblInitialFill: "Initial Entry (Baseline)",
    inputFullTankLabel: "Full tank (for precise consumption calculation)",
    lblLastOdometerHint: "Last recorded odometer:",

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
    lblNoObservations: "No additional observations recorded.",

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
    btnClose: "Close",

    // Global Service Loader
    loadingServiceText: "Loading service data...",

    // Drivers Section
    driversSectionTitle: "Driver & Fleet Staff Management",
    btnNewDriver: "Register New Driver",
    driverKpiTotal: "Total Drivers",
    driverKpiTotalDesc: "Drivers registered in the fleet",
    driverKpiActive: "Active Drivers",
    driverKpiActiveDesc: "Staff with valid driver licenses",
    driverKpiAssigned: "With Assigned Vehicle",
    driverKpiAssignedDesc: "Drivers with an allocated vehicle",
    colDriverName: "Driver Name",
    colLicenseNumber: "License / Permit No.",
    colAssignedVehicle: "Assigned Vehicle",
    colDriverPhone: "Phone",
    colDriverEmail: "Email",
    colDriverStatus: "Driver Status",
    lblAssignedDriver: "Assigned Driver",
    lblNoDriverAssigned: "No driver assigned",
    lblDriverVehicleBadge: "Driver:",
    lblDriverBannerHello: "Hello, {name}!",
    lblDriverBannerVehicle: "Your assigned vehicle is:",
    lblDriverBannerTip: "You can directly report refuelings and check your assigned vehicle details.",
    modalNewDriverTitle: "Register New Driver",
    inputDriverFullName: "Full name",
    inputDriverUsername: "Login username",
    inputDriverEmail: "Corporate email",
    inputDriverPhone: "Contact phone",
    inputDriverLicense: "Driving license number (DGT)",
    inputDriverAssignVeh: "Assign Fleet Vehicle",
    inputVehicleAssignDriver: "Assigned Driver (optional)",
    successDriverCreated: "Driver registered successfully!",
    successDriverAssigned: "Vehicle assigned to driver successfully!",

    // Fines Section (Multas)
    finesSectionTitle: "Traffic Fines & Violations Management",
    btnNewFine: "Register Fine / Penalty",
    fineKpiPendingAmount: "Outstanding Fine Amount",
    fineKpiPendingAmountDesc: "Total unsettled penalties",
    fineKpiPendingCount: "Pending Fines",
    fineKpiPendingCountDesc: "Unpaid violation dossiers",
    fineKpiTotalPaid: "Total Paid in Fines",
    fineKpiTotalPaidDesc: "Paid fleet traffic fines",
    colFineReason: "Violation Reason",
    colFineAmount: "Amount (€)",
    colFineDate: "Violation Date",
    colFineOrganism: "Issuing Authority",
    colFineReference: "Dossier / Ticket No.",
    colFineStatus: "Fine Status",
    fine_status_pending: "Pending",
    fine_status_paid: "Paid",
    fine_status_appealed: "Appealed",
    btnPayFine: "Mark as Paid",
    modalNewFineTitle: "Register New Traffic Fine",
    inputFineReason: "Violation reason",
    inputFineAmount: "Fine amount (€)",
    inputFineDate: "Date of notification",
    inputFineOrganism: "Authority / Police / Traffic Dept",
    inputFineReference: "Dossier or ticket reference",
    successFineCreated: "Traffic fine registered successfully!",
    successFineStatusUpdated: "Fine status updated successfully!",
    btnRefresh: "Refresh",
    btnRefreshing: "Refreshing...",
    successDataRefreshed: "Fleet data refreshed successfully!",

    // Driver Portal & KPIs
    driverPortalWelcome: "Hello, Driver",
    driverAssignedVehicle: "Assigned vehicle:",
    btnDriverQuickFuel: "Report Today's Refueling",
    kpiTotalDrivers: "Total Drivers",
    kpiTotalDriversDesc: "Driving staff registered in the fleet",
    kpiAssignedDrivers: "With Assigned Vehicle",
    kpiAssignedDriversDesc: "Drivers currently assigned to a vehicle",
    kpiUnassignedDrivers: "Without Assigned Vehicle",
    kpiUnassignedDriversDesc: "Drivers available for assignment",
    colDriver: "Driver",
    colPhone: "Phone",
    colEmail: "Email",
    driverUnassigned: "Unassigned",

    // Traffic Fines KPIs & Actions
    kpiTotalFines: "Total Fines",
    kpiTotalFinesDesc: "Registered violation dossiers",
    kpiPendingFines: "Pending Payment",
    kpiPendingFinesDesc: "Penalties pending payment or appeal",
    kpiTotalFinesAmount: "Total Fines Amount",
    kpiTotalFinesAmountDesc: "Total monetary amount in fines",
    btnMarkFinePaid: "Mark as Paid",
    successFinePaid: "Fine successfully marked as paid!",

    // Modal Options & Dropdowns
    optNoDriver: "-- No assigned driver --",
    optNoVehicle: "-- No vehicle initially assigned --",

    // Modal Form Labels
    inputDriverNameLabel: "Full Name",
    inputLicenseLabel: "Driving License / Permit",
    inputAssignedVehicleLabel: "Assigned Vehicle (Optional)",
    inputFineAmountLabel: "Fine Amount (€)",
    inputFineReasonLabel: "Violation Reason",
    inputFineOrganismLabel: "Issuing Authority",

    // Input Placeholders
    placeholderPlate: "E.g. 1234-BBB",
    placeholderVin: "VF1FL0000...",
    placeholderMake: "E.g. Renault",
    placeholderModel: "E.g. Trafic 2.0 dCi",
    placeholderNotes: "Additional vehicle notes...",
    placeholderWorkshop: "E.g. Morvedre Workshop",
    placeholderFuelStation: "E.g. Repsol Viver",
    placeholderFuelNotes: "E.g. Refueling on return to logistics center...",
    placeholderDriverName: "E.g. John Martin",
    placeholderDriverUsername: "E.g. driver_john",
    placeholderDriverEmail: "john.martin@company.com",
    placeholderDriverPhone: "+34 612 345 678",
    placeholderDriverLicense: "B-12345678",
    placeholderFineAmount: "100.00",
    placeholderFineReason: "E.g. Speeding (fixed speed radar A-7 km 342)",
    placeholderFineOrganism: "E.g. DGT / Valencia City Council",
    placeholderFineNotes: "Violation dossier no., appeals...",

    // Units, Hints & Dynamic Formats
    unitDaysRemaining: "{days} days remaining",
    unitDaysExpired: "Expired {days} days ago",
    unitDaysCount: "{days} days",
    unitDaysExpiredShort: "Expired",
    hintOdometerLower: "⚠️ Odometer lower than last recorded ({lastOdo} km)",
    hintApproxUnitPrice: "Approximate price: {price} €/L",
    lblDeltaFromLast: "+{km} km since last",
    lblFullTankShort: "✓ Full",
    lblPartialTankShort: "(Partial)",
    defaultFuelStation: "Fuel Station",
    userProfileTitle: "User profile",
    refreshDataTitle: "Refresh data"
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

    const titles = targetRoot.querySelectorAll<HTMLElement>('[data-i18n-title]');
    titles.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.title = this.t(key);
      }
    });

    const ariaLabels = targetRoot.querySelectorAll<HTMLElement>('[data-i18n-aria-label]');
    ariaLabels.forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (key) {
        el.setAttribute('aria-label', this.t(key));
      }
    });

    this.updateLanguageSelectorsUI();
  }

  /**
   * Automatic observation / comment translator.
   * Translates free-text notes and technical observations originally in Valencian
   * into Spanish or English depending on the currently active language.
   */
  public static translateObservation(rawText: string | null | undefined): string {
    if (!rawText || !rawText.trim()) {
      return this.t('lblNoObservations');
    }

    const trimmed = rawText.trim();
    const lang = this.currentLang;

    // Direct curated phrase translations
    const EXACT_PHRASES: Record<string, Record<SupportedLanguage, string>> = {
      "Requereix canviar pneumàtics davanters abans d'ITV. Rutes de repartiment València - Sagunt.": {
        va: "Requereix canviar pneumàtics davanters abans d'ITV. Rutes de repartiment València - Sagunt.",
        es: "Requiere cambiar neumáticos delanteros antes de ITV. Rutas de reparto Valencia - Sagunto.",
        en: "Requires replacing front tyres before MOT/ITV. Delivery routes Valencia - Sagunto."
      },
      "Revisió pre-ITV favorable. Estat de càrrega i bateries òptim per al centre històric.": {
        va: "Revisió pre-ITV favorable. Estat de càrrega i bateries òptim per al centre històric.",
        es: "Revisión pre-ITV favorable. Estado de carga y baterías óptimo para el centro histórico.",
        en: "Pre-MOT/ITV inspection passed. Optimal battery charge state for historic center."
      },
      "En taller per desgast de pastilles de fre i revisió ITV urgent (cita 30/10/2026).": {
        va: "En taller per desgast de pastilles de fre i revisió ITV urgent (cita 30/10/2026).",
        es: "En taller por desgaste de pastillas de freno y revisión ITV urgente (cita 30/10/2026).",
        en: "In workshop for brake pad wear and urgent MOT/ITV service (appointment 30/10/2026)."
      },
      "Flota Mediterrània - Rutes llargues": {
        va: "Flota Mediterrània - Rutes llargues",
        es: "Flota Mediterránea - Rutas largas",
        en: "Mediterranean Fleet - Long haul routes"
      },
      "Canvi d'oli sintètic 5W30 i filtre d'oli reglamentari": {
        va: "Canvi d'oli sintètic 5W30 i filtre d'oli reglamentari",
        es: "Cambio de aceite sintético 5W30 y filtro de aceite reglamentario",
        en: "Synthetic oil 5W30 change and regulation oil filter"
      },
      "Cita prèvia confirmada per a inspecció periòdica": {
        va: "Cita prèvia confirmada per a inspecció periòdica",
        es: "Cita previa confirmada para inspección periódica",
        en: "Confirmed appointment for periodic inspection"
      },
      "Substitució pastilles davanteres i revisió líquid de frens": {
        va: "Substitució pastilles davanteres i revisió líquid de frens",
        es: "Sustitución de pastillas delanteras y revisión de líquido de frenos",
        en: "Front brake pad replacement and brake fluid check"
      },
      "Proveïment complet dièsel ruta A-23": {
        va: "Proveïment complet dièsel ruta A-23",
        es: "Repostaje completo diésel ruta A-23",
        en: "Full diesel refueling route A-23"
      },
      "Proveïment retorn centre logístic": {
        va: "Proveïment retorn centre logístic",
        es: "Repostaje de regreso a centro logístico",
        en: "Refueling on return to logistics center"
      },
      "Revisió periòdica estàndard sense anomalies reportades.": {
        va: "Revisió periòdica estàndard sense anomalies reportades.",
        es: "Revisión periódica estándar sin anomalías reportadas.",
        en: "Standard periodic inspection with no reported anomalies."
      },
      "Sense observacions tècniques anòmales registrades per a este vehicle.": {
        va: "Sense observacions tècniques anòmales registrades per a este vehicle.",
        es: "Sin observaciones técnicas anómalas registradas para este vehículo.",
        en: "No abnormal technical observations recorded for this vehicle."
      },
      "Sense observacions addicionals registrades.": {
        va: "Sense observacions addicionals registrades.",
        es: "Sin observaciones adicionales registradas.",
        en: "No additional observations recorded."
      },
      "Sense incidències destacades": {
        va: "Sense incidències destacades",
        es: "Sin incidencias destacadas",
        en: "No notable incidents"
      },
      "Sense incidències": {
        va: "Sense incidències",
        es: "Sin incidencias",
        en: "No incidents"
      },
      "Sense observacions": {
        va: "Sense observacions",
        es: "Sin observaciones",
        en: "No observations"
      },
      "Excedir límit de velocitat (68 km/h en tram limitat a 50 km/h).": {
        va: "Excedir límit de velocitat (68 km/h en tram limitat a 50 km/h).",
        es: "Exceso de velocidad (68 km/h en tramo limitado a 50 km/h).",
        en: "Speeding violation (68 km/h in 50 km/h zone)."
      },
      "Estacionament indegut en carril reservat per a bus i taxi.": {
        va: "Estacionament indegut en carril reservat per a bus i taxi.",
        es: "Estacionamiento indebido en carril reservado para bus y taxi.",
        en: "Improper parking in bus/taxi reserved lane."
      },
      "Accés no autoritzat a Zona de Baixes Emissions (ZBE) sense distintiu ambiental adequat.": {
        va: "Accés no autoritzat a Zona de Baixes Emissions (ZBE) sense distintiu ambiental adequat.",
        es: "Acceso no autorizado a Zona de Bajas Emisiones (ZBE) sin distintivo ambiental adecuado.",
        en: "Unauthorized entry to Low Emission Zone (LEZ) without required environmental badge."
      },
      "No respectar la distància de seguretat entre vehicles pesants.": {
        va: "No respectar la distància de seguretat entre vehicles pesants.",
        es: "No respetar la distancia de seguridad entre vehículos pesados.",
        en: "Failure to maintain safety distance between heavy vehicles."
      }
    };

    if (EXACT_PHRASES[trimmed] && EXACT_PHRASES[trimmed][lang]) {
      return EXACT_PHRASES[trimmed][lang];
    }

    if (lang === 'va') {
      return trimmed;
    }

    // Dynamic term translation using regex glossary for general/custom text
    let translated = trimmed;
    const GLOSSARY: Record<'es' | 'en', [RegExp, string][]> = {
      es: [
        [/Requereix canviar/gi, 'Requiere cambiar'],
        [/pneumàtics davanters/gi, 'neumáticos delanteros'],
        [/pneumàtics posteriors/gi, 'neumáticos traseros'],
        [/pneumàtics/gi, 'neumáticos'],
        [/abans d'ITV/gi, 'antes de ITV'],
        [/abans de/gi, 'antes de'],
        [/Rutes de repartiment/gi, 'Rutas de reparto'],
        [/Rutes llargues/gi, 'Rutas largas'],
        [/Revisió pre-ITV favorable/gi, 'Revisión pre-ITV favorable'],
        [/Revisió periòdica estàndard/gi, 'Revisión periódica estándar'],
        [/Revisió periòdica/gi, 'Revisión periódica'],
        [/Revisió oficial/gi, 'Revisión oficial'],
        [/Revisió/gi, 'Revisión'],
        [/sense anomalies reportades/gi, 'sin anomalías reportadas'],
        [/sense anomalies/gi, 'sin anomalías'],
        [/sense observacions/gi, 'sin observaciones'],
        [/sense incidències/gi, 'sin incidencias'],
        [/Sense/gi, 'Sin'],
        [/Estat de càrrega i bateries òptim/gi, 'Estado de carga y baterías óptimo'],
        [/per al centre històric/gi, 'para el centro histórico'],
        [/En taller per desgast de/gi, 'En taller por desgaste de'],
        [/En taller per/gi, 'En taller por'],
        [/pastilles de fre/gi, 'pastillas de freno'],
        [/pastilles davanteres/gi, 'pastillas delanteras'],
        [/pastilles posteriors/gi, 'pastillas traseras'],
        [/pastilles/gi, 'pastillas'],
        [/revisió líquid de frens/gi, 'revisión de líquido de frenos'],
        [/líquid de frens/gi, 'líquido de frenos'],
        [/revisió ITV urgent/gi, 'revisión ITV urgente'],
        [/cita prèvia confirmada/gi, 'cita previa confirmada'],
        [/per a inspecció periòdica/gi, 'para inspección periódica'],
        [/per a/gi, 'para'],
        [/Canvi d'oli sintètic/gi, 'Cambio de aceite sintético'],
        [/Canvi d'oli/gi, 'Cambio de aceite'],
        [/filtre d'oli reglamentari/gi, 'filtro de aceite reglamentario'],
        [/filtre d'aire/gi, 'filtro de aire'],
        [/filtre/gi, 'filtro'],
        [/Substitució pastilles/gi, 'Sustitución de pastillas'],
        [/Substitució/gi, 'Sustitución'],
        [/Proveïment complet dièsel/gi, 'Repostaje completo diésel'],
        [/Proveïment retorn/gi, 'Repostaje de regreso'],
        [/Proveïment/gi, 'Repostaje'],
        [/centre logístic/gi, 'centro logístico'],
        [/este vehicle/gi, 'este vehículo'],
        [/anòmales registrades/gi, 'anómalas registradas'],
        [/addicionals registrades/gi, 'adicionales registradas'],
        [/dipòsit omplit/gi, 'depósito llenado'],
        [/dipòsit/gi, 'depósito'],
        [/concessionari oficial/gi, 'concesionario oficial']
      ],
      en: [
        [/Requereix canviar/gi, 'Requires replacing'],
        [/pneumàtics davanters/gi, 'front tyres'],
        [/pneumàtics posteriors/gi, 'rear tyres'],
        [/pneumàtics/gi, 'tyres'],
        [/abans d'ITV/gi, 'before MOT/ITV'],
        [/abans de/gi, 'before'],
        [/Rutes de repartiment/gi, 'Delivery routes'],
        [/Rutes llargues/gi, 'Long haul routes'],
        [/Revisió pre-ITV favorable/gi, 'Pre-MOT inspection passed'],
        [/Revisió periòdica estàndard/gi, 'Standard periodic inspection'],
        [/Revisió periòdica/gi, 'Periodic service'],
        [/Revisió oficial/gi, 'Official service'],
        [/Revisió/gi, 'Inspection'],
        [/sense anomalies reportades/gi, 'with no reported anomalies'],
        [/sense anomalies/gi, 'without anomalies'],
        [/sense observacions/gi, 'without observations'],
        [/sense incidències/gi, 'with no incidents'],
        [/Sense/gi, 'No'],
        [/Estat de càrrega i bateries òptim/gi, 'Optimal battery charge state'],
        [/per al centre històric/gi, 'for the historic center'],
        [/En taller per desgast de/gi, 'In workshop due to wear on'],
        [/En taller per/gi, 'In workshop for'],
        [/pastilles de fre/gi, 'brake pads'],
        [/pastilles davanteres/gi, 'front brake pads'],
        [/pastilles posteriors/gi, 'rear brake pads'],
        [/pastilles/gi, 'brake pads'],
        [/revisió líquid de frens/gi, 'brake fluid check'],
        [/líquid de frens/gi, 'brake fluid'],
        [/revisió ITV urgent/gi, 'urgent MOT/ITV inspection'],
        [/cita prèvia confirmada/gi, 'confirmed appointment'],
        [/per a inspecció periòdica/gi, 'for periodic inspection'],
        [/per a/gi, 'for'],
        [/Canvi d'oli sintètic/gi, 'Synthetic oil change'],
        [/Canvi d'oli/gi, 'Oil change'],
        [/filtre d'oli reglamentari/gi, 'regulation oil filter'],
        [/filtre d'aire/gi, 'air filter'],
        [/filtre/gi, 'filter'],
        [/Substitució pastilles/gi, 'Brake pad replacement'],
        [/Substitució/gi, 'Replacement'],
        [/Proveïment complet dièsel/gi, 'Full diesel refueling'],
        [/Proveïment retorn/gi, 'Return refueling'],
        [/Proveïment/gi, 'Refueling'],
        [/centre logístic/gi, 'logistics hub'],
        [/este vehicle/gi, 'this vehicle'],
        [/anòmales registrades/gi, 'abnormal registered'],
        [/addicionals registrades/gi, 'additionally registered'],
        [/dipòsit omplit/gi, 'tank filled'],
        [/dipòsit/gi, 'tank'],
        [/concessionari oficial/gi, 'official dealership']
      ]
    };

    const rules = GLOSSARY[lang as 'es' | 'en'];
    if (rules) {
      for (const [regex, replacement] of rules) {
        translated = translated.replace(regex, replacement);
      }
    }

    return translated;
  }
}
