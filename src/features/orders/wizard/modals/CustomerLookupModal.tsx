"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch } from "@/store/hooks";
import { loadCustomerAddressesAsync, setDraftProperty, setLastOrderInfoCustomerErpGID } from "@/store/orders/ordersSlice";
import {
    applyLastErpOrderData,
    applyLastOrderData,
    applyPersonErpGIDFromLastOrder,
    extractAddressErpGID,
    extractPersonErpGID,
    extractShipToOtherAddress,
    syncShipToOtherAddressFlags,
} from "@/lib/applyLastOrderData";
import { store } from "@/store/store";
import AppLoader from "@/components/ui/AppLoader";

export type CustomerSearchResult = {
    telephone1: any;
    peS_TEL_1: any;
    taytothta: any;
    explain?: string;
    iS_CERTIFIED_PHONE: number;
    pE_ActivityCode?: string;
    pE_Code?: string;
    pE_DEAD_ALIVE?: number;
    pE_NAME?: string;
    PE_REMARKS?: string;
    pE_TaxRegNum?: string;
    peS_Address1?: string;
    peS_Area?: string;
    peS_CityCode?: string;
    peS_Country?: string;
    peS_FPOSTALCODE?: string;
    peS_FSiteGID?: string;
    peS_KindSite?: number;
    peS_STATUS?: number;
    tR_Code?: string;
    tR_GID?: string;
    tR_Name?: string;
    tR_REMARKS?: string;
    tR_StringField5?: string;
    tR_fPersonCodeGID?: string;
};

function isNonEmptyRecord(v: unknown): v is Record<string, unknown> {
    return v !== null && typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length > 0;
}

export default function CustomerLookupModal({
    show,
    onClose,
}: {
    show: boolean;
    onClose: () => void;
}) {
    const dispatch = useAppDispatch();
    const [q, setQ] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [applying, setApplying] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [results, setResults] = React.useState<CustomerSearchResult[]>([]);
    const [hasSearched, setHasSearched] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
        setQ("");
        setResults([]);
        setError(null);
        setHasSearched(false);
        setLoading(false);
        setApplying(false);
    }, [show]);

    async function search() {
        inputRef.current?.blur();
        const query = q.trim();

        setLoading(true);
        setError(null);
        setHasSearched(true);
        try {
            const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}&_ts=${Date.now()}`, {
                cache: "no-store",
                headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.ok) {
                throw new Error(data?.message || "Search failed");
            }

            setResults((data.listCustomers ?? []) as CustomerSearchResult[]);
        } catch (e: any) {
            setError(e?.message || "Search failed");
        } finally {
            setLoading(false);
        }
    }

    async function applyCustomer(c: CustomerSearchResult) {
        setApplying(true);
        let preferredPerson: string | undefined;
        let preferredAddr: string | undefined;
        let shipToFromLast: 0 | 1 | undefined;
        try {
            const res = await fetch("/api/load-last-customer-order-info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_gid: c.tR_GID,
                    customer_amka: c.tR_StringField5 ?? "",
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data?.ok) {
                const sc = data.statusCode as number | undefined;
                const statusOk = sc === undefined || sc === 0 || sc === 200;
                if (statusOk) {
                    const lwo = data.last_web_order;
                    const leo = data.last_erp_order;
                    if (isNonEmptyRecord(lwo)) {
                        const lwoRec = lwo as Record<string, unknown>;
                        const lwoCopy = { ...lwoRec };
                        const lwoPerson = extractPersonErpGID(lwoRec);
                        const lwoAddr = extractAddressErpGID(lwoRec);
                        shipToFromLast = extractShipToOtherAddress(lwoRec);
                        delete lwoCopy.person_ErpGID;
                        delete lwoCopy.address_ErpGID;
                        delete lwoCopy.preselected_person_GID;
                        delete lwoCopy.preselected_address_GID;
                        applyLastOrderData(lwoCopy, dispatch, true);
                        preferredPerson = lwoPerson;
                        preferredAddr = lwoAddr;
                    } else if (isNonEmptyRecord(leo)) {
                        applyLastErpOrderData(leo, dispatch);
                        preferredPerson = String(leo.deliveryPersonGID ?? "").trim() || undefined;
                        preferredAddr = String(leo.deliveryAddressGID ?? "").trim() || undefined;
                    }
                }
            }
        } catch {
            // Continue with selected row only
        } finally {
            setApplying(false);
        }

        dispatch(setDraftProperty({ key: "customer_ErpGID", value: c.tR_GID }));
        dispatch(setDraftProperty({ key: "customer_name", value: c.pE_NAME }));
        dispatch(setDraftProperty({ key: "customer_amka", value: c.tR_StringField5 }));
        dispatch(setDraftProperty({ key: "customer_address", value: c.peS_Address1 }));
        dispatch(setDraftProperty({ key: "customer_city", value: c.peS_CityCode }));
        dispatch(setDraftProperty({ key: "customer_tk", value: c.peS_FPOSTALCODE }));
        dispatch(setDraftProperty({ key: "customer_tel", value: c.telephone1 }));
        dispatch(setDraftProperty({ key: "customer_mobile", value: c.peS_TEL_1 }));
        dispatch(setDraftProperty({ key: "customer_dob", value: "" }));
        dispatch(setDraftProperty({ key: "customer_email", value: "" }));
        dispatch(setDraftProperty({ key: "customer_passport", value: c.taytothta }));
        try {
            await dispatch(
                loadCustomerAddressesAsync({
                    customer_ErpGID: c.tR_GID,
                    customer_name: c.pE_NAME,
                    customer_amka: c.tR_StringField5,
                    customer_address: c.peS_Address1,
                    preferredPersonErpGID: preferredPerson,
                    preferredAddressErpGID: preferredAddr,
                })
            ).unwrap();

            if (shipToFromLast === 1) {
                syncShipToOtherAddressFlags(dispatch, 1);
                applyPersonErpGIDFromLastOrder(dispatch, preferredPerson);
                const prePerson = store.getState().orders.draft.preselected_person_GID;
                if (
                    !store.getState().orders.draft.order.person_ErpGID?.trim() &&
                    prePerson
                ) {
                    dispatch(
                        setDraftProperty({ key: "person_ErpGID", value: prePerson }),
                    );
                }
            } else {
                dispatch(setDraftProperty({ key: "shipTo_other_address", value: 0 }));
                dispatch(setDraftProperty({ key: "shipToOtherAddressBool", value: false }));
                dispatch(setDraftProperty({ key: "has_other_recipient", value: 0 }));
                dispatch(
                    setDraftProperty({ key: "recipient_from_erp_lookup", value: null }),
                );
            }
        } catch {
            if (shipToFromLast === 1) {
                syncShipToOtherAddressFlags(dispatch, 1);
                applyPersonErpGIDFromLastOrder(dispatch, preferredPerson);
            }
        }
        dispatch(setLastOrderInfoCustomerErpGID(c.tR_GID));
        onClose();
    }

    return (
        <Modal dialogClassName="modal-grow-scroll" show={show} onHide={onClose} centered contentClassName="premium-modal">
            <Modal.Header closeButton>
                <Modal.Title className="h6 mb-0">Αναζήτηση ασθενή</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="d-flex gap-2">
                    <input
                        ref={inputRef}
                        className="form-control"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="π.χ. 12345678901 ή Παπαδόπουλος"
                        inputMode="search"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") search();
                        }}
                    />
                    <button type="button" className="btn btn-primary" onClick={search} disabled={q.trim().length < 2 || loading}>
                        <i className="bi bi-search" />
                    </button>
                </div>

                {error ? <div className="alert alert-danger py-2 small mt-3 mb-0">{error}</div> : null}

                <div className="mt-3 modal-results">
                    {loading ? (
                        <AppLoader label="Αναζήτηση…" card={false} />
                    ) : results.length ? (
                        <div className="list-group">
                            {results.map((r, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="list-group-item list-group-item-action"
                                    onClick={() => void applyCustomer(r)}
                                    disabled={applying}
                                >
                                    <div className="fw-semibold">{r.pE_NAME || "—"}</div>
                                    <div className="small text-secondary">AMKA: {r.tR_StringField5 || "—"}</div>
                                    <div className="small text-secondary">
                                        Διέυθυνση: {`${r.peS_CityCode ?? ""} ${r.peS_Address1 ?? ""}`}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : hasSearched ? (
                        <div className="text-secondary small text-center py-3">Δεν υπάρχουν αποτελέσματα.</div>
                    ) : null}
                </div>
                {applying ? (
                    <div className="mt-2 small text-secondary d-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden />
                        Φόρτωση τελευταίας παραγγελίας…
                    </div>
                ) : null}
            </Modal.Body>
        </Modal>
    );
}
