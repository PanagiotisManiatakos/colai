"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderById } from "@/features/orders/ordersSlice";
import AppLoader from "@/components/ui/AppLoader";
import OrderDetailsView from "@/components/orders/OrderDetailsView";

export default function OrderViewPage() {
  const params = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const orderId = Number(params.orderId);
  const uid = searchParams.get("uid");

  const dispatch = useAppDispatch();
  const order = useAppSelector((s) => s.orders.selected?.order);
  const loading = useAppSelector((s) => s.orders.selected?.loading);
  const error = useAppSelector((s) => s.orders.selected?.loadingError);

  React.useEffect(() => {
    if (!orderId || !uid) return;
    dispatch(fetchOrderById({ orderId, orderUID: uid }));
  }, [dispatch, orderId, uid]);

  if (loading || !order) return <AppLoader label="Φόρτωση παραγγελίας…" />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="d-flex flex-column h-100" style={{ minHeight: 0 }}>
      <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>

        {/* <div className="d-flex gap-2 mb-3">
        <Link href="/orders" className="btn btn-outline-secondary flex-fill">
          <i className="bi bi-chevron-left me-2" />
          Back
          </Link>

          <Link href={`/orders/${order.id}/edit`} className="btn btn-primary flex-fill">
          <i className="bi bi-pencil-square me-2" />
          Edit
          </Link>
          </div> */}

        <OrderDetailsView order={order} mode="view" value={{}} />
      </div>
    </div>
  );
}
