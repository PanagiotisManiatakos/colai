"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppLoader from "@/components/ui/AppLoader";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { SearchBar } from "@/components/ui/SearchBar";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";

import OrderCard from "@/features/orders/components/OrderCard";
import {
  DEFAULT_ORDER_LIST_PAGE,
  DEFAULT_ORDER_LIST_PAGE_SIZE,
} from "@/lib/api/orderListQuery";
import { fetchOrders } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userInfo = useAppSelector((s) => s.auth.userInfos);

  const orders = useAppSelector((s) => s.orders.orders);
  const paging = useAppSelector((s) => s.orders.ordersPaging);
  const listLoading = useAppSelector((s) => s.orders.loadingOrders);
  const refreshing = useAppSelector((s) => s.orders.refreshingOrders);

  const urlSearch = (searchParams.get("search") ?? "").trim();
  const urlPage = parsePositiveInt(
    searchParams.get("page"),
    DEFAULT_ORDER_LIST_PAGE,
  );
  const urlPageSize = parsePositiveInt(
    searchParams.get("pagesize"),
    DEFAULT_ORDER_LIST_PAGE_SIZE,
  );

  const [q, setQ] = React.useState(urlSearch);

  React.useEffect(() => {
    setQ(urlSearch);
  }, [urlSearch]);

  React.useEffect(() => {
    void dispatch(
      fetchOrders({
        q: urlSearch,
        page: urlPage,
        pagesize: urlPageSize,
      }),
    );
  }, [dispatch, urlSearch, urlPage, urlPageSize]);

  const applySearchToUrl = React.useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = next.trim();

      if (trimmed) params.set("search", trimmed);
      else params.delete("search");

      params.delete("page");

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const goToPage = React.useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextPage <= DEFAULT_ORDER_LIST_PAGE) params.delete("page");
      else params.set("page", String(nextPage));

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const onRefresh = React.useCallback(async () => {
    await dispatch(
      fetchOrders({
        q: urlSearch,
        page: urlPage,
        pagesize: urlPageSize,
        force: true,
      }),
    ).unwrap();
  }, [dispatch, urlSearch, urlPage, urlPageSize]);

  const totalPages = Number(paging?.totalpages ?? 0);
  const hasKnownTotalPages = totalPages > 0;
  const currentPage = Math.min(
    urlPage,
    paging?.currentPage && paging.currentPage > 0
      ? paging.currentPage
      : urlPage,
  );
  const canGoPrev = currentPage > DEFAULT_ORDER_LIST_PAGE;
  const canGoNext = hasKnownTotalPages
    ? currentPage < totalPages
    : orders.length >= urlPageSize;

  const showInitialLoader = listLoading && orders.length === 0;
  const showUpdatingLoader = listLoading && orders.length > 0;
  const showPagination =
    !listLoading &&
    (canGoPrev || canGoNext || hasKnownTotalPages || orders.length > 0);

  const pageInfo = (
    <>
      Σελίδα {currentPage}
      {hasKnownTotalPages ? ` / ${totalPages}` : ""}
      {paging?.totalrecords != null ? ` · ${paging.totalrecords} συνολικά` : ""}
    </>
  );

  return (
    <>
      <div className="app-card mb-3 p-2">
        <SearchBar
          placeholder="Αναζήτηση (ID, συνταγή, όνομα, ΑΜΚΑ…)"
          value={q}
          onChange={setQ}
          debounceMs={500}
          debouncedCompareTo={urlSearch}
          onDebouncedChange={applySearchToUrl}
        />
      </div>

      <PullToRefresh onRefresh={onRefresh} isRefreshing={refreshing}>
        {showInitialLoader || showUpdatingLoader ? (
          <AppLoader label="Φόρτωση παραγγελιών…" />
        ) : orders.length ? (
          <div className="d-flex flex-column gap-2">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} onDelete={() => {}} />
            ))}
          </div>
        ) : (
          <div className="app-card text-secondary p-3 text-center">
            Δεν βρέθηκαν παραγγελίες.
          </div>
        )}

        {showPagination ? (
          <div className="app-card mt-3 p-3">
            <div className="d-md-none">
              <div className="d-flex justify-content-between align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  disabled={!canGoPrev || listLoading}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  <i className="bi bi-chevron-left me-1" aria-hidden />
                  Προηγούμενη
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  disabled={!canGoNext || listLoading}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  Επόμενη
                  <i className="bi bi-chevron-right ms-1" aria-hidden />
                </button>
              </div>

              <div
                className="text-secondary text-center mt-2"
                style={{ fontSize: 13 }}
              >
                {pageInfo}
              </div>
            </div>

            <div className="d-none d-md-flex align-items-center justify-content-between gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                disabled={!canGoPrev || listLoading}
                onClick={() => goToPage(currentPage - 1)}
              >
                <i className="bi bi-chevron-left me-1" aria-hidden />
                Προηγούμενη
              </button>

              <div className="text-secondary text-center" style={{ fontSize: 13 }}>
                {pageInfo}
              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                disabled={!canGoNext || listLoading}
                onClick={() => goToPage(currentPage + 1)}
              >
                Επόμενη
                <i className="bi bi-chevron-right ms-1" aria-hidden />
              </button>
            </div>
          </div>
        ) : null}
      </PullToRefresh>

      {userInfo?.isSeller && (
        <FloatingActionButton href="/orders/0" ariaLabel="Νέα παραγγελία" />
      )}
    </>
  );
}
