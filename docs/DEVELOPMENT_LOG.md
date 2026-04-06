# Development Log: Phase-by-Phase Progress

This document tracks the chronological engineering progress of the CMS Akademi Daeng Kuning, detailing the paradigm shifts from foundational markup to complex data orchestration.

***

## 🟢 Phase 1: Branding & UI Foundation
**Objective:** Establish the visual identity and structural boilerplate of the portal.
*   **Implementation:**
    *   Developed the global `branding.css` containing the CSS variables for the 'Jewelry-Dojo' design system.
    *   Redesigned the primary navigation header to feature a translucent glassmorphism background (`backdrop-blur`).
    *   Engineered a global `footer-social.css` module and integrated it across all pages to ensure aesthetic consistency.
    *   Standardized the usage of the Daeng Kuning crest logo (`logo.png`) by auto-cropping it via Python to produce high-resolution, perfectly boxed favicons across 17+ pages.

## 🟡 Phase 2: Interaction Design & Micro-Animations
**Objective:** Elevate user engagement statically before connecting absolute backend logic.
*   **Implementation:**
    *   Integrated **GSAP** and **ScrollTrigger** into `index.html`.
    *   Built the cinematic "Hero Section" where the prominent 3D-styled martial arts character (`ahmad.png`) scales and translates upon hover to simulate depth.
    *   Implemented "Running Numbers" to dynamically count up the academy's statistics (active students, training centers) during scroll intersections.
    *   Applied refined transitions (`transition-all duration-300`) uniformly to create an expensive, weighty feel to buttons and cards.

## 🟠 Phase 3: Immersive Experience & WebGL Integration
**Objective:** Showcase the martial arts legacy utilizing bleeding-edge web APIs.
*   **Implementation:**
    *   Constructed `warisan.html` using **Three.js** to mount a 3D canvas spanning the entire viewport.
    *   Added a GLTF loader in `warisan-logic.js` to asynchronously download and render the `keris_surakarta.glb`.
    *   Integrated orbital controls (`OrbitControls`) allowing users to drag, rotate, and zoom the 3D Keris in lighting that replicates a museum exhibit.
    *   *Optimization Action:* Initially used `particles.js` combined with high `window.devicePixelRatio`, which choked mobile GPUs. We performed an architectural overhaul, capping pixel ratios to `1.25` and reducing particle count from 120 to 30, solving massive mobile lag. An elegant golden loading overlay was deployed to mask the async model downloads.
    *   Refactored the gallery page (`gallery.html`) into an immersive masonry grid system utilizing lightweight JavaScript iteration (`gallery-immersive.js`).

## 🔴 Phase 4: Backend Integration & Authentication (Supabase)
**Objective:** Secure the system and transition from static dummy pages to a complete CRUD Web Entity.
*   **Implementation:**
    *   Injected Supabase v2 CDNs globally and established the secure connection payload within `database.js` / `auth.js`.
    *   Architected the **Role-Based Access Control (RBAC)** restricting `superadmin` (`dk001`) from `admin` and `student`.
    *   Reworked the login validation flow to reject brute-forcing. 
    *   Migrated from forced auto-generated accounts to a resilient User Self-Registration workflow in `student-registration` logic. 

## 🟣 Phase 5: Specialized Modules & Admin Overhaul
**Objective:** Provide operational tools for academy management.
*   **Implementation:**
    *   Developed the **Busana Showcase** (`koleksi.html`) featuring e-commerce style grids.
    *   Built the **Virtual Dashboard** (`dashboard-student.html`), allowing students to query real-time data indicating their payment arrears and possessing a digital Gold Member Card.
    *   Overhauled the **Admin Yuran** and **Admin Ahli** dashboards utilizing DataTables. Features introduced include checking individual payment histories with real-time DOM-rendering and dynamic SVG graphs.
    *   *Data Pruning:* Evaluated usage statistics and aggressively executed a `DROP TABLE` on the `kehadiran` (attendance) database to drastically minimize payload queries and focus completely on priority objectives (Users, Fees, Memberships).
