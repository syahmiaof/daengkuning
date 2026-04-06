# User Manual: Operational Guide

This document supplies procedural walkthroughs covering how end-users (Admins and Students) interact with the CMS Akademi Persilatan Daeng Kuning.

***

## 👨‍💼 1. Admin System Management Guide

### Checking Payments & Updating Fees
1. Navigate to `login.html` and authenticate with an Admin or Superadmin credential.
2. Under the unified Admin dashboard, click on **Pengurusan Yuran** (Fee Management).
3. The real-time DataTables will instantly render member payment status. Green tags indicate active memberships; Red tags indicate arrears.
4. To add a payment, select a user's matrix profile, input the MYR amount, target month/year, and insert the receipt proof URL if required. The table will auto-refresh upon successful payload submission to Supabase.

### Managing Members & RBAC (Superadmin Only)
1. Within the dashboard, select **Pengurusan Ahli**.
2. As a `superadmin`, protected functionality will appear allowing you to alter the clearance level of accounts (e.g., upgrading a 'student' to an 'admin').
3. You may use the universal search bar on the table to isolate specific IC patterns or names violently fast without reloading the view.

***

## 🥋 2. Student Interface Guide

### Self-Registration & Logging In
1. As a new recruit, navigate to the `Portal Ahli` directly from the main landing page.
2. Select **Daftar Akaun Baru**. Input your Identity Card Number (IC), Email, and a secure password.
3. The system will create an intrinsic account on the database. Proceed to login immediately using the exact details.

### Viewing the Digital Membership Card & Status
1. Upon logging in, you will be directed to `dashboard-student.html`.
2. The topmost section presents the **Digital Gold Card**. Your exact name, ID, and active status are holographically integrated.
3. In the lower widget, you can visualize an interactive graph displaying chronological payment history, avoiding disputes with administration.

***

## 🛠️ 3. Troubleshooting & Frequently Asked Questions

**Issue: Why am I seeing a blank white screen upon entering the Admin Dashboard?**
* **Solution (Browser Cache):** The application relies aggressively on caching to maintain speed. Clear your browser cache or perform a hard refresh (`CTRL + F5` or `CMD + SHIFT + R`) to force your browser to pull the latest Vercel configurations.

**Issue: Password Reset Link shows as "Expired".**
* **Solution:** Supabase natively limits the expiry window of cryptographic reset links to exactly 24 hours to prevent unauthorized mailbox interception. Contact standard administration vertically to generate a new reset ticket immediately.

**Issue: My mobile phone heats up on the `Warisan` page.**
* **Solution:** Highly dense graphical engines running on WebGL (processing the 3D Keris model) naturally stress hardware. We have already minimized particle density optimizations by 75%; if it persists, ensure your phone doesn't have "Low Power Mode" artificially throttling graphics rendering.
