"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStaticData } from "@/store/staticData/staticDataSlice";
import { fetchDiscountRequests } from "./discountRequests/discountRequestsSlice";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export default function AppBootstrap() {
    const dispatch = useAppDispatch();
    const authStatus = useAppSelector((s) => s.auth.status);
    const staticDataLastFetched = useAppSelector((s) => s.staticData.staticDataLastFetched);
    const requestsLastFetched = useAppSelector((s) => s.discountRequests.requestsFetchedAt);

    React.useEffect(() => {
        if (authStatus == "authenticated" && (Date.now() - staticDataLastFetched) > ONE_DAY_MS) dispatch(fetchStaticData());
        if (authStatus == "authenticated" && (Date.now() - requestsLastFetched) > ONE_HOUR_MS) dispatch(fetchDiscountRequests());
    }, [dispatch, authStatus, staticDataLastFetched, requestsLastFetched]);

    return null;
}
