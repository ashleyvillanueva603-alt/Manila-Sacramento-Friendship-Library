"use client"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  startIndex: number
  endIndex: number
  totalItems: number
  hasMore?: boolean // Added optional hasMore prop to indicate more pages might exist
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
  hasMore = false, // Default to false
}: PaginationControlsProps) {
  // Generate page numbers to display (show current page and adjacent pages)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if near the beginning
      if (currentPage <= 3) {
        endPage = 4
      }

      // Adjust if near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push("...")
      }

      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push("...")
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-col items-center justify-between gap-4 pt-6 sm:flex-row">
      <div className="text-sm text-muted-foreground">
        Showing {startIndex}–{endIndex} of {totalItems}
        {hasMore ? "+" : ""} items
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <button
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            >
              <PaginationPrevious />
            </button>
          </PaginationItem>

          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(page as number)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <button
              onClick={() => {
                // Allow next page if either within known pages OR hasMore is true
                if (currentPage < totalPages || hasMore) {
                  onPageChange(currentPage + 1)
                }
              }}
              disabled={currentPage >= totalPages && !hasMore}
              className={currentPage >= totalPages && !hasMore ? "pointer-events-none opacity-50" : "cursor-pointer"}
            >
              <PaginationNext />
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
        {hasMore ? "+" : ""}
      </div>
    </div>
  )
}
