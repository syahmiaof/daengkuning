# Project Overview: CMS Akademi Persilatan Daeng Kuning

## 🎯 1. Project Objective
The **CMS Akademi Persilatan Daeng Kuning** is a comprehensive, modern Content Management System (CMS) and public-facing portal designed to manage the operational and branding needs of a traditional Malay Martial Arts Academy. The project bridges the gap between historical heritage and cutting-edge web technology, delivering a highly immersive experience for visitors and an efficient management dashboard for administrators and students.

Our primary objective is to cultivate the martial arts ecosystem through digitalization. It provides a secure layer for role-based access control (RBAC), simplifies fee management, digitizes membership validation, and preserves heritage via state-of-the-art interactive 3D modeling.

***

## ⚙️ 2. Technology Stack
The project adopts a modern **Serverless Web Application** architecture to ensure high performance, maintainability, and enterprise-grade security.

*   **HTML5 / Semantic Markup:** Ensures accessibility, SEO optimization, and structural integrity.
*   **Tailwind CSS:** A utility-first CSS framework used for rapid UI development, achieving a highly polished and completely responsive layout without bloated CSS files.
*   **Vanilla JavaScript (ES6+):** Utilized for DOM manipulation and asynchronous logic (fetching data, rendering charts, handling forms) without the overhead of heavy frameworks like React or Vue, guaranteeing absolute loading speed.
*   **Supabase (PostgreSQL Backend as a Service):** Powers the backend database, handles Row Level Security (RLS) policies, and provides robust out-of-the-box user authentication.
*   **Three.js & WebGL:** A 3D library used to render the highly immersive *Keris Surakarta* models directly in the browser, offering interactive web experiences.
*   **GSAP (GreenSock Animation Platform):** The industry standard for high-performance animations. Combines with `ScrollTrigger` to create cinematic, scrollytelling visual flows.
*   **Vercel:** Cloud platform utilized for lightning-fast Edge-network Production Deployment.

***

## 🎨 3. High-Level Architecture & Design System

### Architecture
The CMS operates on a **Client-Side Rendering (CSR)** model. The frontend (hosted on Vercel) acts independently, utilizing REST APIs and WebSocket connections to securely communicate with the Supabase PostgreSQL cluster. 

*   **Public Layer:** Accessible to all visitors (`index.html`, `warisan.html`, `koleksi.html`). Focuses on branding and high interactivity.
*   **Authentication Layer:** (`login.html`, `reset-password.html`) Secures endpoints via Supabase JWT Tokens and establishes user roles (`superadmin`, `admin`, `student`).
*   **Private/Dashboard Layer:** Serves structured interfaces depending on roles. Admins handle CRUD operations on members and payments (`dashboard-admin.html`); students manage their profiles and validate their fees (`dashboard-student.html`).

### The 'Jewelry-Dojo' (Dark & Gold) Design System
The visual language of the CMS was explicitly coded using a **'Jewelry-Dojo'** philosophy. This design system elevates the martial arts brand from a traditional grassroots entity to an exclusive, premium heritage organization.

*   **Color Palette:**
    *   *Primary Black (Onyx Backgrounds - `#0A0A0A`):* Represents the classic martial arts uniform (*baju layang*), enforcing a sense of mystery, discipline, and authority.
    *   *Silat Gold (`#D4AF37` / `#FFDF00`):* Symbolizes royalty, heritage, and the 'Keris'. It provides high contrast on the dark background to command attention to Call-to-Action buttons and key typography.
*   **Glassmorphism & Lighting:** Instead of flat colors, the portal extensively uses `backdrop-blur-md` (frosted glass) and `drop-shadow` CSS properties. This mimics the feeling of viewing artifacts inside a poorly-lit, premium museum display case.
*   **Typography:** Combining sophisticated Serif fonts (for headers and heritage elements) with clean Sans-Serif fonts (for UI inputs and dashboards) to map the juxtaposition between rich history and modern utility.
