"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrders } from "@/features/orders/ordersSlice";

import OrderCard from "@/components/orders/OrderCard";
import AppLoader from "@/components/ui/AppLoader";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { SearchBar } from "@/components/ui/SearchBar";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((s) => s.orders.orders);
  const listLoading = useAppSelector((s) => s.orders.loadingOrders);
  const refreshing = useAppSelector((s) => s.orders.refreshingOrders);

  React.useEffect(() => {
    if (orders.length > 0) return;
    dispatch(fetchOrders());
  }, [dispatch, orders.length]);

  const onRefresh = React.useCallback(async () => {
    await dispatch(fetchOrders({ force: true })).unwrap();
  }, [dispatch]);

  const showInitialLoader = listLoading && orders.length === 0;

  return (
    <>
      <PullToRefresh onRefresh={onRefresh} isRefreshing={refreshing}>
        <div className="app-card p-3 mb-3">
          <SearchBar placeholder="Αναζήτηση (ID, συνταγή, όνομα, ΑΜΚΑ…)" />
        </div>

        {showInitialLoader ? (
          <AppLoader label="Φόρτωση παραγγελιών…" />
        ) : orders.length ? (
          orders.map((o) => <OrderCard key={o.id} order={o} onDelete={() => {}} />)
        ) : (
          <div className="app-card p-4 text-center text-secondary">Δεν βρέθηκαν παραγγελίες.</div>
        )}
      </PullToRefresh>

      <FloatingActionButton href="/orders/new" ariaLabel="Νέα παραγγελία (Επιλογή πλατφόρμας)" />
    </>
  );
}
