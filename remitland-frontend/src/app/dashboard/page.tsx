/**
 * Dashboard Page - Route: /dashboard
 *
 * In Next.js App Router, each folder inside src/app/ becomes a URL route.
 * This file at src/app/dashboard/page.tsx maps to http://localhost:3000/dashboard
 *
 * This is similar to how Laravel routes work:
 *   Route::get('/dashboard', [DashboardController::class, 'index']);
 *
 * The actual UI is in the Dashboard component — this page file just
 * renders it. Keeping the page file thin is a common Next.js pattern.
 */

import Dashboard from "../../components/Dashboard";

export default function DashboardPage() {
  return <Dashboard />;
}
