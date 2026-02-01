"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch } from "@/store/hooks";
import { addDraftYliko, setDraftProperty } from "@/features/orders/ordersSlice";
import AppLoader from "@/components/ui/AppLoader";

export type MaterialsLookupModal = {
    erp_code?: string;
    erp_eoppyprice: number;
    erp_gid?: string;
    erp_name?: string;
    erp_price?: number;
};

export default function MaterialsLookupModal({
    show,
    onClose,
    initialQuery = "",
}: {
    show: boolean;
    onClose: () => void;
    initialQuery?: string;
}) {
    const dispatch = useAppDispatch();
    const [q, setQ] = React.useState(initialQuery);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [results, setResults] = React.useState<MaterialsLookupModal[]>([]);

    React.useEffect(() => {
        if (show) {
            setQ(initialQuery);
            setResults([]);
            setError(null);
        }
    }, [show, initialQuery]);

    async function search() {
        const query = q.trim();
        if (query.length < 2) return;

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`, {
                cache: "no-store",
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.ok) {
                throw new Error(data?.message || "Search failed");
            }

            setResults((data.items ?? []) as MaterialsLookupModal[]);
        } catch (e: any) {
            setError(e?.message || "Search failed");
        } finally {
            setLoading(false);
        }
    }

    function applyProduct(c: MaterialsLookupModal) {
        dispatch(addDraftYliko({
            erpGid: c.erp_gid || "",
            aiMatchedErpGid: c.erp_gid || "",
            gid: c.erp_gid || "",
            erp_code: c.erp_code || "",
            erpCode: c.erp_code || "",
            erp_name: c.erp_name || "",
            erpName: c.erp_name || "",
            erp_price: c.erp_price || 0,
            erp_eoppyprice: c.erp_eoppyprice || 0,
            qty: 1,
            total_price: c.erp_price || 0,
            total_eoppyprice: c.erp_eoppyprice || 0,
        }));

        onClose();
    }

    return (
        <Modal show={show} onHide={onClose} centered contentClassName="premium-modal">
            <Modal.Header closeButton>
                <Modal.Title className="h6 mb-0">Αναζήτηση Υλικών</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="app-card p-3">
                    <label className="form-label small text-secondary mb-2">
                        Αναζήτησε με Κωδικό / Περιγραφή
                    </label>

                    <div className="d-flex gap-2">
                        <input
                            className="form-control"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
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
                </div>

                <div className="mt-3">
                    {loading ? (
                        <AppLoader label="Αναζήτηση…" card={false} />
                    ) : results.length ? (
                        <div className="mt-3 modal-results-scroll">
                            {loading ? (
                                <AppLoader label="Αναζήτηση…" card={false} />
                            ) : results.length ? (
                                <div className="list-group">
                                    {results.map((r, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            className="list-group-item list-group-item-action"
                                            onClick={() => applyProduct(r)}
                                        >
                                            <div className="fw-semibold">{r.erp_name || "—"}</div>
                                            <div className="small text-secondary">Κωδικός: {r.erp_code || "—"}</div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-secondary small text-center py-3">Δεν υπάρχουν αποτελέσματα.</div>
                            )}
                        </div>
                    ) : (
                        <div className="text-secondary small text-center py-3">Δεν υπάρχουν αποτελέσματα.</div>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
}
