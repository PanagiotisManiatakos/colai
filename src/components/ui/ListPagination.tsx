"use client";

import {
  formatListPageInfo,
  type ListPaginationState,
} from "@/lib/pagination/listPagination";

type ListPaginationProps = Pick<
  ListPaginationState,
  "currentPage" | "canGoPrev" | "canGoNext" | "showPagination"
> & {
  disabled?: boolean;
  onPageChange: (page: number) => void;
  pageInfo?: ListPaginationState;
};

export default function ListPagination({
  currentPage,
  canGoPrev,
  canGoNext,
  showPagination,
  disabled = false,
  onPageChange,
  pageInfo,
}: ListPaginationProps) {
  if (!showPagination) return null;

  const infoText = pageInfo ? formatListPageInfo(pageInfo) : null;

  return (
    <div className="app-card mt-3 p-3">
      <div className="d-md-none">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            disabled={!canGoPrev || disabled}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <i className="bi bi-chevron-left me-1" aria-hidden />
            Προηγούμενη
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            disabled={!canGoNext || disabled}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Επόμενη
            <i className="bi bi-chevron-right ms-1" aria-hidden />
          </button>
        </div>

        {infoText ? (
          <div
            className="text-secondary text-center mt-2"
            style={{ fontSize: 13 }}
          >
            {infoText}
          </div>
        ) : null}
      </div>

      <div className="d-none d-md-flex align-items-center justify-content-between gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          disabled={!canGoPrev || disabled}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <i className="bi bi-chevron-left me-1" aria-hidden />
          Προηγούμενη
        </button>

        {infoText ? (
          <div className="text-secondary text-center" style={{ fontSize: 13 }}>
            {infoText}
          </div>
        ) : null}

        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          disabled={!canGoNext || disabled}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Επόμενη
          <i className="bi bi-chevron-right ms-1" aria-hidden />
        </button>
      </div>
    </div>
  );
}
