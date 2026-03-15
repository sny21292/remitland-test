/**
 * Pagination - Page navigation for transaction lists.
 *
 * This handles client-side pagination — the parent component holds
 * all items, and Pagination just tells the parent which page is active.
 *
 * In Laravel, you'd use $items->links(). Here we build pagination
 * controls manually since we're paginating client-side data.
 */

"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  /**
   * Build an array of page numbers to display.
   * Shows first, last, and a window around the current page.
   * Gaps are represented by -1 (rendered as "...").
   */
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const delta = 1; // How many pages to show around current

    for (let i = 1; i <= totalPages; i++) {
      // Always show first page, last page, and pages near current
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== -1) {
        // Add a gap marker (ellipsis)
        pages.push(-1);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        &laquo; Prev
      </button>

      {/* Page number buttons */}
      {getPageNumbers().map((page, index) =>
        page === -1 ? (
          // Ellipsis for gaps
          <span key={`gap-${index}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentPage === page
                ? "bg-yellow-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next &raquo;
      </button>
    </div>
  );
}
