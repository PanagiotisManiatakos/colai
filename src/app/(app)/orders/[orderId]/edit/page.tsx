"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderById, } from "@/features/orders/ordersSlice";
import AppLoader from "@/components/ui/AppLoader";
import OrderDetailsForm from "@/components/orders/OrderDetailsForm";

export default function OrderEditPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = Number(params.orderId);

  const router = useRouter();
  const dispatch = useAppDispatch();

  const order = useAppSelector((s) => s.orders.selected?.order);
  const loading = useAppSelector((s) => s.orders.selected?.loading);
  const error = useAppSelector((s) => s.orders.selected?.loadingError);

  //   const saving = useAppSelector((s) => s.orders.savingSelected);
  //   const saveError = useAppSelector((s) => s.orders.saveError);

  //const [patch, setPatch] = React.useState<OrderEditPatch>({});

  React.useEffect(() => {
    if (orderId) dispatch(fetchOrderById({
      orderId,
      orderUID: ""
    }));
  }, [dispatch, orderId]);

  async function onSave() {
    if (!order) return;

    // await dispatch(updateOrderById({ orderId: order.id, patch }))
    //   .unwrap()
    //   .catch(() => {});

    // If update endpoint doesn’t return updated order, refetch on view page is fine.
    router.replace(`/orders/${order.id}`);
  }

  if (loading || !order) return <AppLoader label="Φόρτωση για επεξεργασία…" />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex gap-2 mb-3">
        <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => router.back()}>
          <i className="bi bi-x-lg me-2" />
          Cancel
        </button>

        <button type="button" className="btn btn-success flex-fill" onClick={onSave} >
          {/* {saving ? (
            <span className="d-inline-flex align-items-center gap-2">
              <span className="spinner-border spinner-border-sm" aria-hidden />
              Saving…
            </span>
          ) : (
            <>
              <i className="bi bi-check2-circle me-2" />
              Save
            </>
          )} */}
        </button>
      </div>

      {/* {saveError ? <div className="alert alert-danger">{saveError}</div> : null} */}

      {/* <OrderDetailsForm
        order={order}
        mode="edit"
        value={patch}
        // onChange={(p) => setPatch((prev) => ({ ...prev, ...p }))}
      /> */}
    </div>
  );
}
