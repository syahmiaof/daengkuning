# Project Management & Operational Timeline

## 1. 12-Week Development Gantt Chart

The project follows a rapid agile framework executed over 12 weeks, graduating from low-fidelity wireframes to full cloud-edge deployment.

| Week   | Milestone Category       | Core Objectives Completed | Status |
| :---:  | :---                     | :---                      | :---:  |
| **W 1-2** | Requirements & UI | Brand analysis, Layout mapping, Color system established (`branding.css`). | 🟢 Completed |
| **W 3-4** | Interactive Frontend | GSAP Integration. `index.html` cinematic overlays. Layout responsiveness. | 🟢 Completed |
| **W 5**   | WebGL Integration | Three.js Keris implementation. 3D Model parameter calibrations. | 🟢 Completed |
| **W 6-7** | Database Engineering | Supabase init. PostgreSQL Schema mapping (Tables: Users, Ahli, Yuran). | 🟢 Completed |
| **W 8-9** | Auth & Dashboards | JWT Authentication setup. Built distinct Dashboards for Admin and Students. | 🟢 Completed |
| **W 10**  | Data Linking | REST integrations. Chart injections mapping actual payload from `yuran`. | 🟢 Completed |
| **W 11**  | System Audits | Removed legacy/redundant modules (`kehadiran`). Standardized `<title>` tab consistency. | 🟢 Completed |
| **W 12**  | Deployment & QA | Final Vercel Production deployment. URL mapping (`silatdaengkuning.vercel.app`). | 🟢 Completed |

***

## 2. Risk Management & Mitigation Strategies

To maintain absolute system integrity and prevent user frustration, specific risks were identified and neutralized during development:

### Risk 1: WebGL 3D Payload Paralyzing Mobile Processors
* **Threat:** The `keris_surakarta.glb` size, plus 120 animated JS particles natively caused 15 FPS jitter on iOS and midrange Android devices.
* **Mitigation:**
  * Forced a constrained limitation on spatial rendering mapping via `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))`.
  * Slashed background physics calculations (particles) by 75% down to 30 nodes.
  * Injected an elegant golden CSS "Menempa Keris..." overlay spinner preventing users from interacting with un-rendered DOM structures during slow networks.

### Risk 2: Malicious Privilege Escalation
* **Threat:** A student forcefully changing their Local Storage role to "admin" to access financial spreadsheets.
* **Mitigation:**
  * Client-side roles are strictly mapped to cryptographic responses validated on the Supabase payload. Even if UI is bypassed, the Database Level Row-Security (RLS) directly rejects unauthorized `UPDATE` or `SELECT` queries without a cryptographic `Bearer token`.
  * The `logs` CCTV table is completely isolated and cannot be tampered with by any standard admin without Superadmin terminal clearance.

### Risk 3: Data Orphanization 
* **Threat:** A student is deleted, but their fee records permanently loop in the database causing aggregate reporting errors.
* **Mitigation:**
  * Engineered all structural queries regarding child tables (`yuran`, `logs`) to execute standard `ON DELETE CASCADE`. Removing the master member cleanly flushes all dependent historical artifacts natively via PostgreSQL.
