"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch } from "@/store/hooks";
import { setDraftProperty } from "@/features/orders/ordersSlice";
import AppLoader from "@/components/ui/AppLoader";

export type DoctorLookupModal = {
    code?: string;
    codE2: number;
    doctoR_CODE?: string;
    doctoR_NAME?: string;
    greeklisH_DOCT_NAME?: number;
    speC_ID?: string;
    eidikotita?: string;
    domI_ID?: string;
    domi?: string;
    gid?: string;
    doctoR_AMKA?: string;
    doctoR_AFM?: string;
};

export default function DoctorLookupModal({
    show,
    onClose,
    isSuggested,
    initialQuery = "",
}: {
    show: boolean;
    isSuggested?: boolean;
    onClose: () => void;
    initialQuery?: string;
}) {
    const dispatch = useAppDispatch();
    const [q, setQ] = React.useState(initialQuery);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [results, setResults] = React.useState<DoctorLookupModal[]>([]);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
        if (show) {
            setQ(initialQuery);
            setResults([]);
            setError(null);
        }
    }, [show, initialQuery]);

    async function search() {
        inputRef.current?.blur();
        const query = q.trim();

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/doctors?q=${encodeURIComponent(query)}`, {
                cache: "no-store",
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.ok) {
                throw new Error(data?.message || "Search failed");
            }

            setResults((data.listDoctors ?? []) as DoctorLookupModal[]);
        } catch (e: any) {
            setError(e?.message || "Search failed");
        } finally {
            setLoading(false);
        }
    }

    function applyDoctor(c: DoctorLookupModal) {
        if (isSuggested) {
            dispatch(setDraftProperty({ key: "doctorSuggested_name", value: c.doctoR_NAME }));
            dispatch(setDraftProperty({ key: "doctorSuggested_amka", value: c.doctoR_AMKA }));
            dispatch(setDraftProperty({ key: "doctorSuggested_afm", value: c.doctoR_AFM }));
            dispatch(setDraftProperty({ key: "doctorSuggested_ErpGID", value: c.gid }));
        } else {
            dispatch(setDraftProperty({ key: "doctor_name", value: c.doctoR_NAME }));
            dispatch(setDraftProperty({ key: "doctor_amka", value: c.doctoR_AMKA }));
            dispatch(setDraftProperty({ key: "doctor_afm", value: c.doctoR_AFM }));
            dispatch(setDraftProperty({ key: "doctor_ErpGID", value: c.gid }));
        }

        onClose();
    }

    return (
        <Modal dialogClassName="modal-grow-scroll" show={show} onHide={onClose} centered contentClassName="premium-modal">
            <Modal.Header closeButton>
                <Modal.Title className="h6 mb-0">Αναζήτηση Ιατρού</Modal.Title>
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
                                    onClick={() => applyDoctor(r)}
                                >
                                    <div className="fw-semibold">{r.doctoR_NAME || "—"}</div>
                                    <div className="small text-secondary">AMKA: {r.doctoR_AMKA || "—"}</div>
                                    <div className="small text-secondary">
                                        Ειδικότητα: {`${r.eidikotita ?? ""}`}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-secondary small text-center py-3">Δεν υπάρχουν αποτελέσματα.</div>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
}
