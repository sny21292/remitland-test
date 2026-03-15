/**
 * API Service - Centralizes all HTTP calls to the Laravel backend.
 *
 * Think of this like a Laravel "Service" class — it wraps Axios (similar to
 * Guzzle in PHP) and exposes clean functions for each endpoint.
 *
 * The backend returns data wrapped in { data: ... } (Laravel API Resource format).
 * We unwrap it here so components get clean data.
 */

import axios from "axios";
import type { Receiver, Transaction } from "../store/receiverSlice";

// Fallback sample data used when the backend is not running
import sampleReceiver from "../data/receivers.json";
import sampleTransactions from "../data/transactions.json";

// Create a reusable Axios instance with the base URL pre-configured.
// This is like setting a base_url in a Laravel HTTP client.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Transform backend receiver response to our frontend format.
 * The backend returns currencies as a flat array; we map them to "accounts".
 */
function transformReceiver(apiData: Record<string, unknown>): Receiver {
  const data = (apiData as Record<string, unknown>).data
    ? (apiData as Record<string, Record<string, unknown>>).data
    : apiData;

  const currencies = (data.currencies as Array<Record<string, string>>) || [];

  return {
    id: data.id as number,
    name: data.name as string,
    email: data.email as string,
    type: data.type as string,
    accounts: currencies.map((c) => ({
      currency: c.code,
      flag: c.flag_emoji,
      account_number: c.account_number,
      country: c.country,
      bank_name: c.bank_name,
      branch_name: c.branch_name,
      swift_bic: c.swift_code,
      bsb: null,
      routing_number: null,
    })),
  };
}

/**
 * Transform backend transaction response to our frontend format.
 */
function transformTransaction(t: Record<string, unknown>): Transaction {
  return {
    id: t.id as number,
    date: t.date_time as string,
    request_id: t.request_id as string,
    type: t.type as string,
    to: t.to_name as string,
    amount: parseFloat(String(t.amount).replace(/,/g, "")),
    currency: t.currency_code as string,
    status: t.status as string,
    cancel_reason: null,
  };
}

/**
 * Fetch receiver details by ID.
 * Falls back to sample data if the backend is unavailable.
 */
export async function getReceiver(id: number = 1): Promise<Receiver> {
  try {
    const response = await api.get(`/receivers/${id}`);
    return transformReceiver(response.data);
  } catch {
    // Backend not running — return sample data so the UI still works
    console.warn("API unavailable, using sample receiver data");
    return sampleReceiver as Receiver;
  }
}

/**
 * Fetch transactions for a receiver, optionally filtered by currency.
 * Backend endpoint: GET /api/receivers/{id}/transactions?currency=USD
 * Falls back to sample data if the backend is unavailable.
 */
export async function getTransactions(
  receiverId: number = 1,
  currency?: string
): Promise<Transaction[]> {
  try {
    const params: Record<string, string> = {};
    if (currency) params.currency = currency;
    const response = await api.get(`/receivers/${receiverId}/transactions`, {
      params,
    });
    // Backend returns { data: [...] } (Laravel Resource Collection)
    const items = response.data.data || response.data;
    return (items as Array<Record<string, unknown>>).map(transformTransaction);
  } catch {
    // Backend not running — filter sample data client-side
    console.warn("API unavailable, using sample transaction data");
    const all = sampleTransactions as Transaction[];
    if (currency) {
      return all.filter((t) => t.currency === currency);
    }
    return all;
  }
}

/**
 * Update a transaction's status (e.g., mark as Approved).
 * Backend endpoint: PATCH /api/transactions/{id}/status
 */
export async function updateTransactionStatus(
  transactionId: number,
  status: string
): Promise<Transaction> {
  const response = await api.patch(`/transactions/${transactionId}/status`, {
    status,
  });
  const data = response.data.data || response.data;
  return transformTransaction(data);
}

/**
 * Trigger a file download for a completed transaction.
 * Opens the backend download URL in a new tab.
 */
export function downloadTransactionFile(): void {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  window.open(`${baseUrl}/download`, "_blank");
}

export default api;
