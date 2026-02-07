"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppLoader from "@/components/ui/AppLoader";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { SearchBar } from "@/components/ui/SearchBar";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";

import OrderCard from "@/features/orders/components/OrderCard";
import { fetchOrders } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const orders = useAppSelector((s) => s.orders.orders);
  const listLoading = useAppSelector((s) => s.orders.loadingOrders);
  const refreshing = useAppSelector((s) => s.orders.refreshingOrders);

  const urlSearch = (searchParams.get("search") ?? "").trim();
  const [q, setQ] = React.useState(urlSearch);

  React.useEffect(() => {
    setQ(urlSearch);
  }, [urlSearch]);

  React.useEffect(() => {
    void dispatch(fetchOrders(urlSearch ? { q: urlSearch } : undefined));
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
    [pathname, router, searchParams]
  );

  const onSubmitSearch = React.useCallback(() => {
    applySearchToUrl(q);
  }, [applySearchToUrl, q]);

  const onClearSearch = React.useCallback(() => {
    applySearchToUrl("");
  }, [applySearchToUrl]);

  const onRefresh = React.useCallback(async () => {
    await dispatch(fetchOrders(urlSearch ? { q: urlSearch, force: true } : { force: true })).unwrap();
  }, [dispatch, urlSearch]);

  const showInitialLoader = listLoading && orders.length === 0;

  return (
    <div className="h-100 d-flex flex-column" style={{ minHeight: 0 }}>
      <div className="app-card p-2 mb-3">
        <SearchBar
          placeholder="Αναζήτηση (ID, συνταγή, όνομα, ΑΜΚΑ…)"
          value={q}
          onChange={setQ}
          onSubmit={onSubmitSearch}
          onClear={onClearSearch}
        />
      </div>
      <PullToRefresh useSelfScroll className="flex-grow-1" onRefresh={onRefresh} isRefreshing={refreshing}>

        {showInitialLoader ? (
          <AppLoader label="Φόρτωση παραγγελιών…" />
        ) : orders.length ? (
          <div className="d-flex flex-column gap-2">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} onDelete={() => { }} />
            ))}
          </div>
        ) : (
          <div className="app-card p-4 text-center text-secondary">Δεν βρέθηκαν παραγγελίες.</div>
        )}
      </PullToRefresh>

      <FloatingActionButton href="/orders/0" ariaLabel="Νέα παραγγελία" />
    </div>
  );
}
