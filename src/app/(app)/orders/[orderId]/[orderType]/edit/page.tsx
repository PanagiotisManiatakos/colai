"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";

import AppLoader from "@/components/ui/AppLoader";
import NotFoundView from "@/components/system/NotFoundView";

import { editDraftAsync } from "@/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import OrderEoppyWizard from "@/features/orders/wizard/eoppy/OrderEoppyWizard";
import OrderRetailWizard from "@/features/orders/wizard/retail/OrderRetailWizard";

const WIZARDS: Record<string, React.ComponentType> = {
  eoppy: OrderEoppyWizard,
  retail: OrderRetailWizard,
};

export default function OrderWizardEditPage() {
  const dispatch = useAppDispatch();
  const params = useParams<{ orderType: string }>();
  const searchParams = useSearchParams();

  const orderType = params.orderType;
  const uid = searchParams.get("uid") ?? "";

  const editState = useAppSelector((s) => s.orders.draft.editState);
  const [isBootstrapping, setIsBootstrapping] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await dispatch(editDraftAsync({ catid: 4, typeid: orderType, uid })).unwrap();
      } finally {
        if (isMounted) setIsBootstrapping(false);
      }
    };

    void bootstrap();
    return () => {
      isMounted = false;
    };
  }, [dispatch, orderType, uid]);

  const Wizard = WIZARDS[orderType];
  if (!Wizard) return <NotFoundView />;

  if (editState.loading || isBootstrapping) return <AppLoader label="Φόρτωση παραγγελίας…" />;
  if (editState.error) return <div className="alert alert-danger">{editState.error}</div>;

  return <Wizard />;
}
