/**
 * ReceiverModal - The main popup that shows receiver details & transactions.
 *
 * This is the most complex component in the app. It combines:
 * - Receiver info header (name, email, type badge)
 * - Currency tabs for switching accounts
 * - Bank/receiver details with "Show More" toggle
 * - Transaction list with search, filter, and pagination
 *
 * KEY REACT PATTERNS USED:
 * - useEffect: Runs side effects (API calls) when dependencies change.
 *   Similar to Laravel Livewire's mount() and updated() lifecycle hooks.
 * - useState: Local component state (like Livewire properties).
 * - useSelector/useDispatch: Read/write Redux state (like accessing a shared DB).
 * - Conditional rendering: {condition && <JSX>} — like Blade's @if directive.
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import {
  fetchReceiver,
  fetchTransactions,
  setSelectedCurrency,
  hydrateCurrency,
} from "../store/receiverSlice";
import { connectSocket, disconnectSocket } from "../services/socket";
import CurrencyTabs from "./CurrencyTabs";
import SearchBar from "./SearchBar";
import TransactionTable from "./TransactionTable";
import Pagination from "./Pagination";

interface ReceiverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 5;

export default function ReceiverModal({ isOpen, onClose }: ReceiverModalProps) {
  // ── Read from Redux store ──
  const dispatch = useDispatch<AppDispatch>();
  const { receiver, transactions, selectedCurrency, loading } = useSelector(
    (state: RootState) => state.receiver
  );

  // ── Local state (only this component needs these) ──
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyActionNeeded, setOnlyActionNeeded] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Hydrate persisted currency from localStorage on first render ──
  useEffect(() => {
    dispatch(hydrateCurrency());
  }, [dispatch]);

  /**
   * Fetch receiver data when the modal opens.
   * This useEffect runs whenever `isOpen` changes — similar to
   * Livewire's "updated" hook or a Laravel Observer.
   */
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchReceiver(1));
    }
  }, [isOpen, dispatch]);

  /**
   * Fetch transactions whenever the selected currency changes.
   * This creates a reactive chain: click tab -> update currency ->
   * this effect fires -> new transactions load.
   */
  useEffect(() => {
    if (isOpen && selectedCurrency) {
      dispatch(fetchTransactions({ receiverId: 1, currency: selectedCurrency }));
      setCurrentPage(1); // Reset to page 1 when currency changes
    }
  }, [isOpen, selectedCurrency, dispatch]);

  /**
   * Connect Socket.IO when modal opens, disconnect when it closes.
   * This is cleanup pattern — the returned function runs on unmount
   * or when dependencies change (like __destruct in PHP).
   */
  useEffect(() => {
    if (isOpen) {
      connectSocket(dispatch);
    }
    return () => {
      disconnectSocket();
    };
  }, [isOpen, dispatch]);

  // ── Client-side search filtering ──
  // useMemo caches the result and only recalculates when dependencies change.
  // This prevents re-filtering on every render (performance optimization).
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Filter by search query (matches "To" field or "Status")
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (txn) =>
          txn.to.toLowerCase().includes(query) ||
          txn.status.toLowerCase().includes(query)
      );
    }

    // "Only Action Needed" filter — show only Pending, Cancelled, Rejected
    if (onlyActionNeeded) {
      result = result.filter((txn) =>
        ["Pending", "Cancelled", "Rejected"].includes(txn.status)
      );
    }

    return result;
  }, [transactions, searchQuery, onlyActionNeeded]);

  // ── Pagination logic ──
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, onlyActionNeeded]);

  // Find the account details for the currently selected currency
  const selectedAccount = receiver?.accounts.find(
    (acc) => acc.currency === selectedCurrency
  );

  /**
   * Handle currency tab change.
   * Updates Redux state and persists to localStorage.
   */
  const handleCurrencyChange = (currency: string) => {
    dispatch(setSelectedCurrency(currency));
  };

  // Don't render anything if the modal is closed
  if (!isOpen) return null;

  return (
    /**
     * Modal overlay — the dark backdrop behind the popup.
     * Clicking the overlay closes the modal.
     * On mobile, the modal takes full screen.
     */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Modal content — stopPropagation prevents clicks inside from closing */}
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Close Button ── */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ── Scrollable Content ── */}
        <div className="overflow-y-auto p-6 sm:p-8">
          {loading && !receiver ? (
            // Loading skeleton
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
            </div>
          ) : receiver ? (
            <>
              {/* ── Receiver Header ── */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  {/* Avatar circle with initials */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-lg font-bold text-yellow-700">
                    {receiver.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {receiver.name}
                    </h2>
                    <p className="text-sm text-gray-500">{receiver.email}</p>
                  </div>
                  {/* Individual/Business badge */}
                  <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {receiver.type}
                  </span>
                </div>
              </div>

              {/* ── Currency Tabs ── */}
              <div className="mb-6">
                <CurrencyTabs
                  accounts={receiver.accounts}
                  selected={selectedCurrency}
                  onSelect={handleCurrencyChange}
                />
              </div>

              {/* ── Receiver/Bank Details ── */}
              {selectedAccount && (
                <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">
                    Receiver Details
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <span className="text-gray-500">Country</span>
                      <p className="font-medium text-gray-800">
                        {selectedAccount.country}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Bank Name</span>
                      <p className="font-medium text-gray-800">
                        {selectedAccount.bank_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Branch Name</span>
                      <p className="font-medium text-gray-800">
                        {selectedAccount.branch_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Swift/BIC Code</span>
                      <p className="font-mono font-medium text-gray-800">
                        {selectedAccount.swift_bic}
                      </p>
                    </div>

                    {/* Show More details (hidden by default) */}
                    {showMoreDetails && (
                      <>
                        {selectedAccount.bsb && (
                          <div>
                            <span className="text-gray-500">BSB</span>
                            <p className="font-mono font-medium text-gray-800">
                              {selectedAccount.bsb}
                            </p>
                          </div>
                        )}
                        {selectedAccount.routing_number && (
                          <div>
                            <span className="text-gray-500">Routing Number</span>
                            <p className="font-mono font-medium text-gray-800">
                              {selectedAccount.routing_number}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Account Number</span>
                          <p className="font-mono font-medium text-gray-800">
                            {selectedAccount.account_number}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Show More / Show Less toggle */}
                  <button
                    onClick={() => setShowMoreDetails(!showMoreDetails)}
                    className="mt-3 text-sm font-medium text-yellow-600 transition-colors hover:text-yellow-700"
                  >
                    {showMoreDetails ? "Show Less" : "Show More"}
                  </button>
                </div>
              )}

              {/* ── Transactions Section ── */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Transactions With {receiver.name.split(" ")[0]}
                </h3>

                {/* Search + Filter Controls */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="w-full sm:max-w-xs">
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search by recipient or status..."
                    />
                  </div>

                  {/* "Only Action Needed" toggle */}
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={onlyActionNeeded}
                      onChange={(e) => setOnlyActionNeeded(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                    />
                    Only Action Needed
                  </label>
                </div>

                {/* Transaction Table */}
                <TransactionTable transactions={paginatedTransactions} />

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-gray-400">
              Failed to load receiver data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
