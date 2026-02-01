"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import OrderCard from "@/components/orders/OrderCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { fetchOrders } from "@/features/orders/ordersSlice";
import AppLoader from "@/components/ui/AppLoader";
import PullToRefresh from "@/components/ui/PullToRefresh";

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const loadedOnceRef = React.useRef(false);

  const loading = useAppSelector((s) => s.orders.loadingOrders);
  const orders = useAppSelector((s) => s.orders.orders);

  React.useEffect(() => {
    if (orders.length > 0) return;
    if (loadedOnceRef.current) return;
    loadedOnceRef.current = true;

    dispatch(fetchOrders());
  }, [dispatch, orders.length]);

  async function onRefresh() {
    // Force bypass cache + refresh
    await dispatch(fetchOrders({ force: true })).unwrap();
  }

  return (
    <>
      <PullToRefresh onRefresh={onRefresh} isRefreshing={loading}>
        <div className="app-card p-3 mb-3">
          <SearchBar placeholder="Αναζήτηση (ID, συνταγή, όνομα, ΑΜΚΑ…)" />
        </div>

        {loading && orders.length === 0 ? (
          <AppLoader label="Φόρτωση παραγγελιών…" />
        ) : orders.length ? (
          orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              onDelete={() => { }}
            />
          ))
        ) : (
          <div className="app-card p-4 text-center text-secondary">Δεν βρέθηκαν παραγγελίες.</div>
        )}
      </PullToRefresh>

      <FloatingActionButton href="/orders/new" ariaLabel="Νέα παραγγελία (Επιλογή πλατφόρμας)" />
    </>
  );
}
