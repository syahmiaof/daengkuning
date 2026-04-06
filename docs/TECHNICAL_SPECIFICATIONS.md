# Technical Specifications: File & Logic Annotation

This document elaborates on the system's file structural logic, highlighting the absolute modular design deployed for maintaining high scalability and organized technical debt.

***

## 🗂️ 1. Directory Tree Architecture

```text
c:\Users\USER\OneDrive\Desktop\project\cms-daeng-kuning\
├── assets\               # Multimedia delivery assets
│   ├── img\              # Compressed .png, .jpg (Logos, Ahmad, UI Graphics)
│   └── 3d\               # GLTF/GLB web-native 3D Models (e.g., keris_surakarta)
├── css\                  # Cascading Style Sheets Layers
│   ├── branding.css      # Core variable library (Jewelry-Dojo aesthetic constants)
│   ├── footer-social.css # Structural markup for repeating footer nodes
│   └── (Tailwind via CDN / PostCSS rendering)
├── docs\                 # Internal Technical Deliverables (.md files)
├── js\                   # Central JavaScript Logic Orchestrator
│   ├── auth.js           # Authentication guards, JWT handling, session continuity
│   ├── database.js       # Core Supabase REST API init and database context
│   ├── ui.js             # General DOM manipulators (Toasts, Modals, Spinners)
│   ├── admin-ahli.js     # Admin Logic: User creation & DataTables rendering
│   ├── admin-yuran.js    # Admin Logic: Financial ledger CRUD orchestration
│   ├── student.js        # Student Logic: Generating Dynamic Payment Graphs
│   ├── warisan-logic.js  # Dedicated Three.js / WebGL orchestrator for 3D mapping
│   ├── animations.js     # GSAP timeline directives and ScrollTrigger logic
│   └── config.js         # Global structural constants
└── (*.html Files)        # DOM structures mapping to precise views
```

***

## 🧩 2. Annotated JavaScript Modules

To ensure absolute code cleanliness, JavaScript operations are completely decoupled by domain:

*   **`js/auth.js`**
    *   **Purpose:** Houses all cryptographic validation tools natively mapped to Supabase Auth. Secures the navigation routing with robust checking loops. If `requireAdmin()` fires and identifies a student, it automatically redirects the `window.location` immediately backward preventing view execution.
*   **`js/database.js`**
    *   **Purpose:** Exposes the `supabaseUrl` and `supabaseKey`. Sets up the structural API bindings globally ensuring files like `admin-yuran.js` don't need to rebuild identical network definitions.
*   **`js/warisan-logic.js`**
    *   **Purpose:** Initiates the `THREE.Scene()`, mounts `GLTFLoader()`, injects ambient, directional, and physical lighting arrays, and processes 60-FPS rendering cycles. Employs error-fallbacks (like generating a geometric placeholder Keris if the primary `.glb` fails to load via latency).
*   **`js/ui.js`**
    *   **Purpose:** Reduces duplicate code by storing universally called components. Functions like `showNotification(msg, type)` or custom dropdown toggles are centralized here.

## 🔐 3. Security Considerations
*   Files ending in `-admin.html` contain client-side route guards validating session JWT tokens instantly against `session.role`.
*   Direct manipulation of `<script>` DOM elements via external inspection is useless; Supabase blocks rogue submissions strictly using Row Level Security parameters. All structural JS targets data exclusively utilizing UUID mappings.
