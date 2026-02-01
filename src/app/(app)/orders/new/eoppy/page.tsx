"use client";

import OrderEoppyWizard from "@/components/orders/new/eoppy/OrderEoppyWizard";
import { setDraftProperty } from "@/features/orders/ordersSlice";
import { useAppDispatch } from "@/store/hooks";
import React from "react";

export default function NewNonEoppyOrderPage() {
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    dispatch(setDraftProperty({ key: "type", value: "eoppy" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="app-card p-4 mb-3">
        <h1 className="h5 fw-semibold mb-1">Νέα παραγγελία – Λιανικής</h1>
        <p className="text-secondary small mb-0">
          Συμπλήρωσε τα στοιχεία.
        </p>
      </div>

      <OrderEoppyWizard />
    </div>
  );
}

