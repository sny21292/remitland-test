/**
 * TransactionTable - Displays transactions in a responsive table/card layout.
 *
 * On desktop: traditional <table>.
 * On mobile: stacked cards.
 *
 * KEY FEATURE: Status can be changed via a dropdown.
 * When changed, it calls the backend API, which notifies the Socket.IO server,
 * which broadcasts to ALL connected browsers — so other users see it instantly.
 */

"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { downloadTransactionFile, updateTransactionStatus } from "../services/api";
import { useDispatch } from "react-redux";
import { updateTransactionInList } from "../store/receiverSlice";
import type { Transaction } from "../store/receiverSlice";
import type { AppDispatch } from "../store/store";

interface TransactionTableProps {
  transactions: Transaction[];
  onRowClick?: (transaction: Transaction) => void;
}

// The statuses a user can set (per spec: only Pending and Approved)
const AVAILABLE_STATUSES = ["Pending", "Approved"];

export default function TransactionTable({
  transactions,
  onRowClick,
}: TransactionTableProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Track which transaction's status dropdown is open
  const [statusDropdownId, setStatusDropdownId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  /**
   * Handle status change from dropdown.
   * 1. Calls backend PATCH API (which notifies Socket.IO server)
   * 2. Also updates local Redux state for immediate UI feedback
   *
   * The Socket.IO broadcast will update OTHER users' browsers.
   * This local dispatch updates THIS user's browser immediately
   * (optimistic update — no waiting for the socket round-trip).
   */
  const handleStatusChange = async (txnId: number, newStatus: string) => {
    setUpdatingId(txnId);
    setStatusDropdownId(null);

    try {
      // Call backend API — this triggers Socket.IO broadcast to other users
      await updateTransactionStatus(txnId, newStatus);
      // Update our own Redux store immediately (optimistic update)
      dispatch(updateTransactionInList({ id: txnId, status: newStatus }));
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    // The API already returns a formatted string like "Apr 19 2025 | 14:30"
    // so we display it directly. If it's an ISO string, we format it.
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Already formatted by the API
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  /**
   * Render action buttons based on status + the status change dropdown.
   * Statuses are: Pending (needs action) and Approved (can download).
   */
  const renderAction = (transaction: Transaction) => {
    const isUpdating = updatingId === transaction.id;

    return (
      <div className="flex items-center gap-2">
        {/* Pending: show "Track Your Payment (Amendment)" */}
        {transaction.status === "Pending" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="whitespace-nowrap rounded-md bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-100"
          >
            Track Your Payment (Amendment)
          </button>
        )}

        {/* Approved: show "Download" */}
        {transaction.status === "Approved" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadTransactionFile();
            }}
            className="whitespace-nowrap rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
          >
            Download
          </button>
        )}

        {/* ── Status Change Dropdown ── */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStatusDropdownId(
                statusDropdownId === transaction.id ? null : transaction.id
              );
            }}
            disabled={isUpdating}
            className="rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
            title="Change status"
          >
            {isUpdating ? (
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {/* Dropdown menu */}
          {statusDropdownId === transaction.id && (
            <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase text-gray-400">
                Change Status
              </p>
              {AVAILABLE_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (status !== transaction.status) {
                      handleStatusChange(transaction.id, status);
                    }
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-gray-50 ${
                    status === transaction.status
                      ? "font-semibold text-yellow-600"
                      : "text-gray-700"
                  }`}
                >
                  {status === transaction.status && (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <StatusBadge status={status} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        No transactions found.
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop Table ── */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Date & Time</th>
              <th className="px-4 py-3 font-medium">Request ID</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">To</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, index) => (
              <tr
                key={txn.id}
                onClick={() => onRowClick?.(txn)}
                className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {formatDate(txn.date)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                  {txn.request_id}
                </td>
                <td className="px-4 py-3 text-gray-700">{txn.type}</td>
                <td className="px-4 py-3 text-gray-700">{txn.to}</td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {formatAmount(txn.amount, txn.currency)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={txn.status} />
                </td>
                <td className="px-4 py-3">{renderAction(txn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="space-y-3 md:hidden">
        {transactions.map((txn, index) => (
          <div
            key={txn.id}
            onClick={() => onRowClick?.(txn)}
            className={`rounded-lg border border-gray-100 bg-white p-4 shadow-sm ${
              onRowClick ? "cursor-pointer active:bg-gray-50" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  #{index + 1} &middot; {txn.to}
                </p>
                <p className="mt-0.5 font-mono text-xs text-gray-400">
                  {txn.request_id}
                </p>
              </div>
              <StatusBadge status={txn.status} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{formatDate(txn.date)}</p>
                <p className="text-xs text-gray-500">{txn.type}</p>
              </div>
              <p className="text-base font-semibold text-gray-800">
                {formatAmount(txn.amount, txn.currency)}
              </p>
            </div>
            <div className="mt-3 flex justify-end">
              {renderAction(txn)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
