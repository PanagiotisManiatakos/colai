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
    <OrderEoppyWizard />
  );
}

