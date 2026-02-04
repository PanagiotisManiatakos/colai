"use client";

import OrderEoppyWizard from "@/components/orders/new/eoppy/OrderEoppyWizard";
import OrderRetailWizard from "@/components/orders/new/retail/OrderRetailWizard";
import { editDraftAsync } from "@/features/orders/ordersSlice";
import { useAppDispatch } from "@/store/hooks";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";

export default function NewOrderPage() {
    const dispatch = useAppDispatch()
    const params = useParams<{ orderId: string, orderType: string }>();
    const searchParams = useSearchParams();
    const orderId = Number(params.orderId);
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

    }, [])



    return (
        <>
            {orderType === "eoppy" ? (
                <OrderEoppyWizard />
            ) :
                <OrderRetailWizard />}
        </>
    );
}
