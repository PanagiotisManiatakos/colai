"use client";

import OrderEoppyWizard from "@/components/orders/new/eoppy/OrderEoppyWizard";
import OrderRetailWizard from "@/components/orders/new/retail/OrderRetailWizard";
import AppLoader from "@/components/ui/AppLoader";
import { editDraftAsync } from "@/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";

export default function NewOrderPage() {
    const dispatch = useAppDispatch()
    const params = useParams<{ orderId: string, orderType: string }>();
    const editState = useAppSelector(s => s.orders.draft.editState)
    const searchParams = useSearchParams();
    const orderType = params.orderType;
    const uid = searchParams.get("uid");

    React.useEffect(() => {
        const handleFetch = async () => {
            try {
                await dispatch(editDraftAsync({ catid: 4, typeid: orderType, uid: uid ?? "" })).unwrap();
            } catch (e: any) {
            }
        };
        handleFetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (editState.loading) return <AppLoader label="Φόρτωση παραγγελίας…" />;
    if (editState.error) return <div className="alert alert-danger">{error}</div>;


    return (
        <>
            {orderType === "eoppy" ? (
                <OrderEoppyWizard />
            ) :
                <OrderRetailWizard />}
        </>
    );
}
