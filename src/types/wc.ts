/** Row from `GET /api/wc-diadikasia/calendar` (`listData`). Field casing may vary by backend. */
export type wcCalendar = {
    customerCode: string;
    /** Optional; passed to `GET /api/search-customer-tels` when present. */
    customer_GID?: string;
    customerGID?: string;
    customerName: string;
    /** Backend may send `pel_GRLSH` or `peL_GRLSH`. */
    pel_GRLSH?: string;
    peL_GRLSH?: string;
    amka?: string;
    sellerCode: string;
    sellerName: string;
    lastPAEO: string;
    /** Backend may send `task_CODE` or `tasK_CODE`. */
    task_CODE?: string;
    tasK_CODE?: string;
    lastOrderDate: string;
    expectedNextOrderDate: string;
    datesInfo: string;
    daysUntilReminder: number;
    doctoR_SINTAGHS: string;
    docT_GRLSH: string;
    items: string;
    totalTurnover: number;
    pasy: number;
    totaL_EXP: number;
    ordersCount: number;
    plethos: number;
    team: string;
    area: string;
    statuS_EA: string;
};

export function wcCalendarTaskCode(r: wcCalendar): string {
    return (r.tasK_CODE ?? r.task_CODE ?? "").trim();
}

export function wcCustomerGid(r: wcCalendar): string {
    return (r.customer_GID ?? r.customerGID ?? "").trim();
}

/** `data` from `GET /api/search-customer-tels`. */
export type SearchCustomerTelsPhone = {
    name: string;
    phone: string;
    isFromCustomer: boolean;
};

export type SearchCustomerTelsData = {
    customerAMKA: string;
    customerGID: string;
    customerName: string;
    telephones: SearchCustomerTelsPhone[];
    emails: string[];
};
