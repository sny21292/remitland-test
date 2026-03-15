/**
 * StatusBadge - A small colored pill that shows a transaction's status.
 *
 * This is a "presentational" component — it only renders UI based on
 * the props it receives. No state, no side effects. In Laravel terms,
 * it's like a Blade component: @component('status-badge', ['status' => 'Pending'])
 */

"use client";

interface StatusBadgeProps {
  status: string;
}

/**
 * Maps each status string to its background + text color classes.
 * Using a Record type ensures TypeScript catches typos.
 */
const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-green-100 text-green-800",
  Success: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  Rejected: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  // Fall back to a neutral gray if the status is unknown
  const style = statusStyles[status] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}
