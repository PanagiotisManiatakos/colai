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
    <OrderWizard />
  );
}
