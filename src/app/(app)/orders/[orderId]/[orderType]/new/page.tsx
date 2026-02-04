"use client";
import NotFound from "@/app/not-found";
import OrderEoppyWizard from "@/components/orders/new/eoppy/OrderEoppyWizard";
import OrderRetailWizard from "@/components/orders/new/retail/OrderRetailWizard";
import { setDraftProperty } from "@/features/orders/ordersSlice";
import { useAppDispatch } from "@/store/hooks";
import { useParams } from "next/navigation";
import React from "react";

const WIZARDS: Record<string, React.ComponentType> = {
    eoppy: OrderEoppyWizard,
    retail: OrderRetailWizard,
};

export default function NewNonEoppyOrderPage() {
    const dispatch = useAppDispatch()
    const params = useParams<{ orderId: string, orderType: string }>();
    const orderType = params.orderType;

    React.useEffect(() => {
        dispatch(setDraftProperty({ key: "type", value: orderType }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const Wizard = orderType ? WIZARDS[orderType] : undefined;
    if (!Wizard) return <NotFound />;

    return <Wizard />;
}

