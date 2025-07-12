# HR ERP System

A modern Angular-based HR ERP system with advanced role-based access, employee/leave/payroll/task management, and a beautiful, highly responsive UI.

## Features
- **Role-based access:** Admin, HR, Employee, Project Manager
- **Employee, Leave, Payroll, and Task Management**
- **Modern UI/UX:** Consistent site colors, card-based mobile layouts, action buttons above forms, and visually distinct button containers
- **Responsive Design:** Mobile-first, adaptive breakpoints, card/table switching, and touch-friendly controls
- **SSR/Prerender-ready:** Works with Angular SSR and static hosting (Netlify, Vercel)

## UI/UX Highlights
- **Card-based Mobile Layouts:** Lists (Employee, Leave, etc.) display as cards on mobile for clarity and touch usability, while using tables on desktop.
- **Action Buttons Above Forms:** All main forms (Employee, Leave Apply, Task, Login) have their action buttons (Save, Submit, etc.) positioned above the form fields for better visibility and UX.
- **Button Containers:** Action buttons in lists are grouped in visually distinct containers with background, padding, and rounded corners for clarity.
- **Improved Desktop Action Buttons:** Approve/Reject and similar actions are styled as large, pill-shaped, gradient buttons with no text wrapping and clear spacing.
- **Consistent Font Sizes:** All text and controls use scalable, readable font sizes across breakpoints.
- **Role-based Navigation:** Sidebar and routes adapt to user role, showing only relevant features.

## Responsive Design

The app is fully responsive and mobile-friendly:

- **Mobile-first breakpoints:** Custom breakpoints at 480px, 768px, 992px, 1200px, and 1400px for optimal scaling.
- **Sidebar & Topbar:**
  - Desktop: Sidebar navigation
  - Mobile: Off-canvas sidebar, always-visible top navbar
- **Tables & Cards:**
  - Tables on desktop, card lists on mobile for key features
  - All tables are wrapped in `.table-responsive` for horizontal scrolling if needed
- **Buttons & Forms:**
  - Buttons are large, touch-friendly, and consistently styled
  - Forms are centered, full-width on mobile, and have action buttons above fields
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
- **Bootstrap theming & global styles:** Customize `src/styles.scss` for colors, spacing, breakpoints, and UI tweaks.
- **Add new features:** Use the provided structure in `src/app/features/` for new modules/components.

## License
MIT
