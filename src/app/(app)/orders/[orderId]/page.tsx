"use client";

import { PlatformCard } from "@/components/ui/PlatformCard";
import { deletedDraftTemplate, editDraftAsync, setDraftProperty } from "@/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import React from "react";
import { Alert, FormSelect } from "react-bootstrap";

export default function NewOrderPage() {
    const router = useRouter();
    const type = useAppSelector((state: any) => state.orders.draft.order?.type);
    const groupid = useAppSelector((state: any) => state.orders.draft.order?.groupid);
    const loading = useAppSelector((state: any) => state.orders.draft.editState.loading);
    const reduxError = useAppSelector((state: any) => state.orders.draft.editState.error);
    const [bLoading, setLoading] = React.useState(false)

    const [error, setError] = React.useState<string | null>(null);
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        if (!groupid) dispatch(setDraftProperty({ key: "groupid", value: 4 }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (type) setError(null);
    }, [type]);

    React.useEffect(() => {
        if (reduxError) setError(reduxError);
    }, [reduxError]);

    const handleContinue = async () => {
        if (!type) return setError("Παρακαλώ επίλεξε πλατφόρμα για να συνεχίσεις.");
        setError(null);

        try {
            const response = await dispatch(editDraftAsync({ catid: 4, typeid: type })).unwrap();
            router.push(`/orders/0/${encodeURIComponent(type)}/new?uid=${response.data.order.uid}`);
        } catch (e: any) {
            setError(e?.message || "Κάτι πήγε στραβά.");
        }
    };

    React.useEffect(() => {
        if (loading) setLoading(true);
    }, [loading])

    return (
        <div className="d-flex flex-column h-100" style={{ minHeight: 0 }}>
            <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
                <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <h1 className="h5 fw-semibold mb-1">Επιλογή πλατφόρμας</h1>
                            <p className="text-secondary small mb-0">Διάλεξε ροή εργασίας για να ξεκινήσεις.</p>
                        </div>
                    </div>
                </div>

                <div className="app-card p-3 mb-3">
                    <label className="form-label small text-secondary mb-2">Κατηγορία</label>
                    <FormSelect
                        value={groupid}
                        onChange={(e) => dispatch(setDraftProperty({ key: "groupid", value: Number(e.target.value) }))}
                        aria-label="Κατηγορία"
                    >
                        <option value="4">WC</option>
                    </FormSelect>
                </div>

                <PlatformCard title="ΕΟΠΥΥ" type="eoppy" description="Ανέβασε παραπεμπτικό/γνωμάτευση" icon="bi-cloud-upload" />
                <PlatformCard title="Λιανικής" type="retail" description="Συμπλήρωσε στοιχεία" icon="bi-ui-checks" />

                <Alert variant="danger" className={`mt-3 w-100 ${error ? "" : "d-none"}`}>
                    {error}
                </Alert>

                {/* add a little bottom padding so last content isn’t hidden behind buttons */}
                <div style={{ height: 12 }} />
            </div>

            {/* FIXED BOTTOM BUTTONS */}
            <div className="pb-3 pt-1" style={{ flex: "0 0 auto" }}>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary flex-fill"
                        onClick={() => {
                            router.replace('/orders');
                            dispatch(deletedDraftTemplate());
                        }}
                        disabled={loading}
                    >
                        Άκυρο
                    </button>

                    <button type="button" className="btn btn-primary flex-fill" onClick={handleContinue} disabled={loading}>
                        {bLoading ? "Φόρτωση…" : "Επόμενο"}
                    </button>
                </div>
            </div>
        </div>
    );
}
