/**
 * CurrencyTabs - Horizontal tabs for switching between currency accounts.
 *
 * Each tab shows a flag emoji, currency code, and the account number.
 * The selected tab gets a yellow border highlight.
 *
 * Props pattern: The parent controls which tab is selected (via
 * `selected` prop) and handles the click (via `onSelect` callback).
 * This keeps the component reusable and testable.
 */

"use client";

import type { Account } from "../store/receiverSlice";

interface CurrencyTabsProps {
  accounts: Account[];
  selected: string;           // The currently selected currency code
  onSelect: (currency: string) => void; // Callback when a tab is clicked
}

export default function CurrencyTabs({
  accounts,
  selected,
  onSelect,
}: CurrencyTabsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {accounts.map((account) => {
        const isActive = account.currency === selected;

        return (
          <button
            key={account.currency}
            onClick={() => onSelect(account.currency)}
            className={`flex min-w-[160px] flex-col rounded-xl border-2 px-4 py-3 text-left transition-all ${
              isActive
                ? "border-yellow-400 bg-yellow-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {/* Flag + currency code */}
            <span className="text-base font-semibold text-gray-800">
              {account.flag} {account.currency}
            </span>
            {/* Account number (truncated for display) */}
            <span className="mt-1 text-xs text-gray-500">
              {account.account_number}
            </span>
          </button>
        );
      })}
    </div>
  );
}
