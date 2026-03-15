/**
 * SearchBar - A text input for filtering transactions.
 *
 * This component is "controlled" — its value is managed by the parent
 * component through props. This is a core React pattern:
 * - The parent owns the state (search query string)
 * - This component just renders the input and calls onChange when typed in
 *
 * In Laravel/Blade, you'd use wire:model for this. In React, we pass
 * the value down and the onChange handler up.
 */

"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search by recipient or status...",
}: SearchBarProps) {
  return (
    <div className="relative">
      {/* Search icon (SVG) positioned inside the input */}
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        // onChange fires on every keystroke; we extract the string value
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
      />
    </div>
  );
}
