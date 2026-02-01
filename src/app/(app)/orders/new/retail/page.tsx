"use client";

import OrderWizard from "@/components/orders/new/retail/OrderRetailWizard";
import { setDraftProperty } from "@/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";

export default function NewNonEoppyOrderPage() {
  const dispatch = useAppDispatch()
  const type = useAppSelector(state => state.orders.draft.order.type)

  React.useEffect(() => {
    if (!type) dispatch(setDraftProperty({ key: "type", value: "retail" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {/* <div className="app-card p-4 mb-3">
        <h1 className="h5 fw-semibold mb-1">Νέα παραγγελία – Λιανικής</h1>
        <p className="text-secondary small mb-0">
          Συμπλήρωσε τα στοιχεία.
        </p>
      </div> */}

      <OrderWizard />
    </div>
  );
}
