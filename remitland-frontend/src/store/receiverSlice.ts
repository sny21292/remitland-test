/**
 * Receiver Slice - Redux state management for receiver & transaction data.
 *
 * In Laravel terms, think of a "slice" as a focused Model + Controller
 * combined: it defines the data shape (like a Model) and the actions
 * that modify it (like Controller methods).
 *
 * Redux Toolkit uses "Immer" under the hood, so you can write code that
 * looks like it mutates state directly — but it actually produces
 * immutable updates safely.
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getReceiver, getTransactions } from "../services/api";

// ─── TypeScript Interfaces ───────────────────────────────────────────

export interface Account {
  currency: string;
  flag: string;
  account_number: string;
  country: string;
  bank_name: string;
  branch_name: string;
  swift_bic: string;
  bsb: string | null;
  routing_number: string | null;
}

export interface Receiver {
  id: number;
  name: string;
  email: string;
  type: string;
  accounts: Account[];
}

export interface Transaction {
  id: number;
  date: string;
  request_id: string;
  type: string;
  to: string;
  amount: number;
  currency: string;
  status: string;
  cancel_reason: string | null;
}

interface ReceiverState {
  receiver: Receiver | null;
  transactions: Transaction[];
  selectedCurrency: string;
  loading: boolean;
  error: string | null;
}

// ─── Helper: Read persisted currency from localStorage ───────────────
function getPersistedCurrency(): string {
  if (typeof window === "undefined") return "USD";
  return localStorage.getItem("remitland_selected_currency") || "USD";
}

const initialState: ReceiverState = {
  receiver: null,
  transactions: [],
  selectedCurrency: "USD",
  loading: false,
  error: null,
};

// ─── Async Thunks (like Laravel Jobs — handle async API calls) ───────

export const fetchReceiver = createAsyncThunk(
  "receiver/fetchReceiver",
  async (id: number = 1) => {
    return await getReceiver(id);
  }
);

export const fetchTransactions = createAsyncThunk(
  "receiver/fetchTransactions",
  async ({ receiverId, currency }: { receiverId?: number; currency?: string }) => {
    return await getTransactions(receiverId || 1, currency);
  }
);

// ─── Slice Definition ────────────────────────────────────────────────
const receiverSlice = createSlice({
  name: "receiver",
  initialState,

  reducers: {
    /**
     * Set the selected currency tab and persist to localStorage.
     */
    setSelectedCurrency(state, action: PayloadAction<string>) {
      state.selectedCurrency = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("remitland_selected_currency", action.payload);
      }
    },

    /**
     * Update a single transaction's status in the list.
     * Called by Socket.IO when another user changes a status.
     */
    updateTransactionInList(
      state,
      action: PayloadAction<{ id: number; status: string }>
    ) {
      const { id, status } = action.payload;
      const transaction = state.transactions.find((t) => t.id === id);
      if (transaction) {
        transaction.status = status;
      }
    },

    /**
     * Add a new transaction to the list (from queue processing).
     * Called by Socket.IO when a queued transaction finishes processing.
     * Only adds it if the transaction's currency matches the selected tab.
     */
    addTransactionToList(state, action: PayloadAction<Transaction>) {
      const newTxn = action.payload;
      // Only add if it matches the currently viewed currency
      if (newTxn.currency === state.selectedCurrency) {
        // Add to the beginning of the list (newest first)
        // Check if it already exists (avoid duplicates)
        const exists = state.transactions.some((t) => t.id === newTxn.id);
        if (!exists) {
          state.transactions.unshift(newTxn);
        }
      }
    },

    /**
     * Hydrate currency from localStorage on app load.
     */
    hydrateCurrency(state) {
      state.selectedCurrency = getPersistedCurrency();
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchReceiver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceiver.fulfilled, (state, action) => {
        state.loading = false;
        state.receiver = action.payload;
      })
      .addCase(fetchReceiver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch receiver";
      });

    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch transactions";
      });
  },
});

export const {
  setSelectedCurrency,
  updateTransactionInList,
  addTransactionToList,
  hydrateCurrency,
} = receiverSlice.actions;

export default receiverSlice.reducer;
