/**
 * Receivers Page (Home Page) - The main entry point of the app.
 *
 * This page shows a simple UI with a "View Receiver" button.
 * Clicking the button opens the ReceiverModal popup.
 *
 * "use client" is required because:
 * 1. We use useState (React hook for local state)
 * 2. We render ReceiverModal (a client component with interactivity)
 *
 * In Laravel terms, this is like your welcome.blade.php — the landing page.
 */

"use client";

import { useState } from "react";
import ReceiverModal from "../components/ReceiverModal";

export default function ReceiversPage() {
  // useState creates a boolean toggle for the modal.
  // false = closed, true = open.
  // setModalOpen is the function to change it (like a setter method).
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      {/* ── Page Header ── */}
      <div className="text-center">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-xl font-bold text-white shadow-lg shadow-yellow-200">
            R
          </div>
          <h1 className="text-3xl font-bold text-gray-900">RemitLand</h1>
        </div>

        <p className="mb-8 text-gray-500">
          International Money Transfer Dashboard
        </p>

        {/* ── View Receiver Button ── */}
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-yellow-400 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-yellow-200 transition-all hover:bg-yellow-500 hover:shadow-xl hover:shadow-yellow-200 active:scale-[0.98]"
        >
          View Receiver
        </button>

        {/* Quick link to Dashboard */}
        <p className="mt-6 text-sm text-gray-400">
          or visit the{" "}
          <a
            href="/dashboard"
            className="font-medium text-yellow-600 underline transition-colors hover:text-yellow-700"
          >
            Dashboard
          </a>
        </p>
      </div>

      {/* ── Receiver Modal ── */}
      {/* This component renders nothing when isOpen=false */}
      <ReceiverModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
