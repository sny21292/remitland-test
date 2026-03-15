/**
 * Redux Store Configuration.
 *
 * This is the central "database" for your frontend state.
 * Think of it like a single source of truth — similar to how Laravel
 * uses a database, React uses Redux to store and manage app-wide data.
 *
 * configureStore from Redux Toolkit sets up the store with good defaults
 * (dev tools, middleware, etc.) so you don't have to configure them manually.
 */

import { configureStore } from "@reduxjs/toolkit";
import receiverReducer from "./receiverSlice";

export const store = configureStore({
  reducer: {
    // Each key here becomes a "table" in your state.
    // Access it with: state.receiver.transactions, state.receiver.selectedCurrency, etc.
    receiver: receiverReducer,
  },
});

// ─── TypeScript Helpers ──────────────────────────────────────────────
// These types let TypeScript know the shape of your store,
// so you get autocomplete and type-checking when using useSelector/useDispatch.

/** The shape of the entire Redux state tree */
export type RootState = ReturnType<typeof store.getState>;

/** The type of the dispatch function (knows about thunks) */
export type AppDispatch = typeof store.dispatch;
