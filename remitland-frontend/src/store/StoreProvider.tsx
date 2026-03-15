/**
 * Store Provider - Wraps the app with the Redux Provider.
 *
 * In Next.js App Router, the root layout is a Server Component by default.
 * Redux needs access to React context (a client-side feature), so we
 * create this separate Client Component to wrap children with the Provider.
 *
 * This is marked with "use client" — a Next.js directive that tells the
 * framework to render this component in the browser, not on the server.
 * Think of it like Blade vs. Livewire: Server Components are Blade
 * (rendered on server), Client Components are Livewire (interactive).
 */

"use client";

import { Provider } from "react-redux";
import { store } from "./store";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Provider makes the Redux store available to all child components,
  // similar to how Laravel's service container makes bindings available.
  return <Provider store={store}>{children}</Provider>;
}
