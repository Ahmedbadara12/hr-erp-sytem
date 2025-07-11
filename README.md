# HR ERP System

A modern Angular-based HR ERP system with role-based access, employee/leave/payroll/task management, and a beautiful Bootstrap UI.

## Features
- **Role-based access:** Admin, HR, Employee, Project Manager
- **Employee, Leave, Payroll, and Task Management**
- **Bootstrap 5 UI:** Modern, clean, and consistent
- **Responsive Design:** Mobile-friendly layout, responsive sidebar/topbar, and adaptive tables
- **SSR/Prerender-ready:** Works with Angular SSR and static hosting (Netlify, Vercel)

## Responsive Design

The app is fully responsive and mobile-friendly:

- **Bootstrap Grid & Utilities:** All layouts use Bootstrap's grid system and responsive utility classes for adaptive spacing, alignment, and visibility.
- **Responsive Sidebar & Topbar:**
  - On desktop, a sidebar is shown for navigation.
  - On mobile, the sidebar collapses into an off-canvas menu, toggled by a hamburger button in the top navbar.
  - The top navbar is always visible on mobile for quick access.
- **Tables:** All main tables (e.g., Employee List) are wrapped in `.table-responsive` for horizontal scrolling on small screens.
- **Cards & Forms:** Use full width on mobile and are centered with appropriate spacing.
- **Tested on multiple screen sizes** for usability and appearance.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run locally:**
   ```bash
   ng serve
   ```
3. **Build for production:**
   ```bash
   ng build
   ```
4. **SSR/Prerender:**
   ```bash
   ng run hr-erp:prerender
   ```

## Deployment
- **Netlify:** Set publish directory to `dist/hr-erp/browser` and ensure `_redirects` is present for SPA routing.
- **Vercel:** Use the static output or SSR as needed. The app is SSR-safe and guards against browser-only APIs.

## Customization
- **Bootstrap theming:** Customize `src/styles.scss` for colors, spacing, and breakpoints.
- **Add new features:** Use the provided structure in `src/app/features/` for new modules/components.

## License
MIT
