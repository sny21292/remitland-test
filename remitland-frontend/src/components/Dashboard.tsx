/**
 * Dashboard - The main dashboard layout component.
 *
 * This component renders:
 * - Account Balance card
 * - Quick Conversion card
 * - Transaction type filter tabs (All, Add Money, Send Money, Conversion)
 * - Transactions table (clicking a row opens the ReceiverModal)
 *
 * REACT PATTERN: "Lifting state up"
 * The modal open/close state lives here because this component needs
 * to control when the modal shows. In Laravel, this would be like
 * a parent Livewire component managing a child modal's visibility.
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { fetchTransactions } from "../store/receiverSlice";
import Sidebar from "./Sidebar";
import TransactionTable from "./TransactionTable";
import ReceiverModal from "./ReceiverModal";
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 8;
const TRANSACTION_TYPES = ["All", "Add Money", "Send Money", "Conversion"];

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading } = useSelector(
    (state: RootState) => state.receiver
  );

  // ── Local UI state ──
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all transactions on mount (no currency filter for dashboard)
  useEffect(() => {
    dispatch(fetchTransactions({ receiverId: 1 }));
  }, [dispatch]);

  // ── Filter transactions by type and search ──
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Filter by transaction type tab
    if (activeTypeFilter !== "All") {
      result = result.filter((txn) => txn.type === activeTypeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (txn) =>
          txn.to.toLowerCase().includes(query) ||
          txn.status.toLowerCase().includes(query) ||
          txn.request_id.toLowerCase().includes(query)
      );
    }

    return result;
  }, [transactions, activeTypeFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTypeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content (offset by sidebar width on desktop) */}
      <div className="lg:pl-64">
        {/* ── Top Bar (mobile only: hamburger menu) ── */}
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-yellow-400 text-xs font-bold text-white">
              R
            </div>
            <span className="font-bold text-gray-900">RemitLand</span>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* ── Top Cards Row ── */}
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {/* Account Balance Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-500">Account Balance</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">$24,500.00</p>
              <p className="mt-1 text-sm text-green-600">+2.5% from last month</p>
              <div className="mt-4 flex gap-3">
                <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                  USD Account
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  Primary
                </span>
              </div>
            </div>

            {/* Quick Conversion Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-500">Quick Conversion</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="font-semibold text-gray-800">1,000.00 USD</p>
                  </div>
                  <span className="text-lg">🇺🇸</span>
                </div>
                <div className="flex justify-center">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-500">To</p>
                    <p className="font-semibold text-gray-800">1,520.00 AUD</p>
                  </div>
                  <span className="text-lg">🇦🇺</span>
                </div>
              </div>
              <button className="mt-4 w-full rounded-lg bg-yellow-400 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-yellow-500">
                Convert Now
              </button>
            </div>
          </div>

          {/* ── Transactions Section ── */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="border-b border-gray-100 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Transactions
                </h2>
                <div className="w-full sm:max-w-xs">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search transactions..."
                  />
                </div>
              </div>

              {/* Transaction Type Filter Tabs */}
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {TRANSACTION_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveTypeFilter(type)}
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      activeTypeFilter === type
                        ? "bg-yellow-400 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
                </div>
              ) : (
                <>
                  <TransactionTable
                    transactions={paginatedTransactions}
                    onRowClick={() => setModalOpen(true)}
                  />
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Receiver Modal — rendered here so it overlays everything */}
      <ReceiverModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
