"use client";

import React from "react";

import DiscountRequestCard from "@/features/orders/components/DiscountRequestCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SearchBar } from "@/components/ui/SearchBar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchDiscountRequests } from "@/store/discountRequests/discountRequestsSlice";
import PullToRefresh from "@/components/ui/PullToRefresh";
import AppLoader from "@/components/ui/AppLoader";

export default function DiscountRequestsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const discountRequests = useAppSelector((s) => s.discountRequests);
  const listLoading = useAppSelector((s) => s.discountRequests.loadingList);
  const refreshing = useAppSelector((s) => s.discountRequests.refreshingList);

  const urlSearch = (searchParams.get("search") ?? "").trim();
  const [q, setQ] = React.useState(urlSearch);

  React.useEffect(() => {
    void dispatch(
      fetchDiscountRequests(urlSearch ? { q: urlSearch } : undefined),
    );
  }, [dispatch, urlSearch]);

  const applySearchToUrl = React.useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = next.trim();

      if (trimmed) params.set("search", trimmed);
      else params.delete("search");

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const onSubmitSearch = React.useCallback(() => {
    applySearchToUrl(q);
  }, [applySearchToUrl, q]);

  const onClearSearch = React.useCallback(() => {
    applySearchToUrl("");
  }, [applySearchToUrl]);

  const onRefresh = React.useCallback(async () => {
    await dispatch(
      fetchDiscountRequests(
        urlSearch ? { q: urlSearch, force: true } : { force: true },
      ),
    ).unwrap();
  }, [dispatch, urlSearch]);

  const showInitialLoader =
    listLoading && discountRequests.requests.length === 0;

  return (
    <div className="d-flex flex-column h-100" style={{ minHeight: 0 }}>
      <div className="app-card mb-3 p-2">
        <SearchBar
          placeholder="Αναζήτηση αιτήματος"
          value={q}
          onChange={setQ}
          onSubmit={onSubmitSearch}
          onClear={onClearSearch}
        />
      </div>
      <PullToRefresh
        useSelfScroll
        className="flex-grow-1"
        onRefresh={onRefresh}
        isRefreshing={refreshing}
      >
        {showInitialLoader ? (
          <AppLoader label="Φόρτωση αιτημάτων..." />
        ) : discountRequests.requests.length ? (
          <div className="d-flex flex-column gap-2">
            {discountRequests.requests.map((r) => (
              <DiscountRequestCard key={r.uid} request={r} />
            ))}
          </div>
        ) : (
          <div className="app-card text-secondary p-3 text-center">
            Δεν βρέθηκαν αιτήματα.
          </div>
        )}
      </PullToRefresh>
    </div>
  );
}
