# FleetMaster-Pro 🚐⚡

> **Enterprise Multi-Tenant Fleet, Maintenance & Fuel SaaS Application**  
> *SaaS d'alt rendiment per a la gestió de flotes corporatives, ITV/MOT, manteniments i combustible amb aïllament multi-empresa estricte.*

---

## 1. Característiques Principals (Core Features)

- **Aïllament Multi-Empresa Estricte (Multi-Tenancy):**
  - Cada usuari, vehicle, manteniment i registre de combustible està estrictament associat al seu `tenant_id`.
  - Cap usuari de l'empresa A pot visualitzar o accedir a les dades de l'empresa B (enforçat via PostgreSQL RLS i repositoris Hexagonals).
- **Control d'ITV / MOT i Manteniments Programats:**
  - Alertes automàtiques per a revisions imminents per data de venciment (< 30 dies) o per quilometratge del vehicle (canvis d'oli, filtres, frens i pneumàtics).
- **Registre de Combustible i Odòmetre:**
  - Registre de despeses de carburant (dièsel, gasolina, elèctric, híbrid) i quilòmetres reals amb verificació Zod.
- **Internacionalització Estricta (100% i18n):**
  - Suport natiu i paritat de claus total entre **Valencià (`va`)**, **Español (`es`)** i **English (`en`)**.
  - **Bandera oficial de la Comunitat Valenciana (Reial Senyera Coronada)** copiada i optimitzada des de *Dine-Done*.
- **Arquitectura Hexagonal (Ports & Adapters):**
  - Motor de dades dual governat per la variable d'entorn `USE_MOCK_DB=true`:
    - **Fase 1 (Desenvolupament / Mock):** Base de dades efímera local basada en fitxers JSON a `/mock_data`.
    - **Fase 2 (Producció / Real):** Supabase PostgreSQL 15+ amb Row Level Security (RLS) actiu.
    - **Regla estricta:** Cap petició és enviada a Supabase si `USE_MOCK_DB=true`.

---

## 2. Pila Tecnològica (Tech Stack)

| Capa | Tecnologia | Descripció |
|---|---|---|
| **Frontend** | TypeScript + HTML5 + CSS3 + Vite | Interfície web responsive, ràpida i adaptable a mòbil i escriptori |
| **Backend / API** | Express + TypeScript | API REST modular, segura, amb RBAC, capçaleres de seguretat i Zod |
| **BBDD Ephemeral** | Fitxers JSON (`mock_data/`) | Mock local per a proves i desenvolupament sense dependències |
| **BBDD Cloud** | Supabase (PostgreSQL 15+) | RLS, polítiques multi-empresa i funcions emmagatzemades |
| **Desplegament** | Vercel Serverless | Fitxer `vercel.json` integrat per a desplegament continu immediat |

---

## 3. Credencials de Supabase & Esquema SQL

L'esquema complet de la base de dades PostgreSQL amb totes les taules (`tenants`, `users`, `vehicles`, `maintenance_records`, `fuel_mileage_logs`), enums, índexs i polítiques RLS es troba a:
👉 [`supabase/schema.sql`](supabase/schema.sql)

Credencials de Supabase configurades:
```env
SUPABASE_URL=https://kiwrugzvuahgtqdhiocj.supabase.co
SUPABASE_ANON_KEY=sb_publishable_eRuuVa-8SPN4x25GiNRv0w_w8-4E0Ne
```

---

## 4. Instal·lació i Execució Local

```bash
# 1. Instal·lar dependències
npm install

# 2. Executar tests unitaris de domini i i18n (100% cobertura de claus)
npm test

# 3. Compilació de producció
npm run build

# 4. Iniciar entorn de desenvolupament local (Client a :7080 i API a :7081)
npm run dev
```

---

## 5. Usuaris i Rols per Defecte

| Rol | Usuari | Contrasenya | Empresa |
|---|---|---|---|
| **SuperAdmin** | `superadmin` | `Admin2026!` | Global SaaS |
| **TenantAdmin** | `admin_valencia` | `Admin2026!` | València Transports Logístics SL |
| **Driver** | `conductor_joan` | `Driver2026!` | València Transports Logístics SL |
| **TenantAdmin** | `admin_med` | `Admin2026!` | Mediterrània Fleet Services SA |
