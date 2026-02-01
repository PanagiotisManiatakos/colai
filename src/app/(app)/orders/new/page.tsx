"use client"


import { PlatformCard } from "@/components/ui/PlatformCard";
import { deletedDraftTemplate, editDraftAsync, setDraftProperty } from "@/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import React from "react";
import { Alert, FormSelect } from "react-bootstrap";

export default function NewOrderPage() {
  const router = useRouter();
  const type = useAppSelector((state) => state.orders.draft.order?.type);
  const loading = useAppSelector((state) => state.orders.draft.editState.loading);
  const reduxError = useAppSelector((state) => state.orders.draft.editState.error);
  const [error, setError] = React.useState<string | null>(null);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(setDraftProperty({ key: "groupid", value: 4 }));
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
      await dispatch(editDraftAsync()).unwrap();
      router.push(`/orders/new/${encodeURIComponent(type)}`);
    } catch (e: any) {
      setError(e?.message || "Κάτι πήγε στραβά.");
    }

    //router.push(`/orders/new/${encodeURIComponent(type as string)}`);
  }
  return (
    <div>
      <div className="mb-3">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h1 className="h5 fw-semibold mb-1">Επιλογή πλατφόρμας</h1>
            <p className="text-secondary small mb-0">
              Διάλεξε ροή εργασίας για να ξεκινήσεις.
            </p>
          </div>
        </div>
      </div>

      <div className="app-card p-3 mb-3">
        <label className="form-label small text-secondary mb-2">Κατηγορία</label>
        <FormSelect defaultValue={1} onChange={(e) => dispatch(setDraftProperty({ key: "groupid", value: e.target?.value }))} aria-label="Κατηγορία">
          <option value="4">WC</option>
        </FormSelect>
      </div>



      <PlatformCard
        title="ΕΟΠΥΥ"
        type="eoppy"
        description="Ανέβασε παραπεμπτικό/γνωμάτευση"
        icon="bi-cloud-upload"
      />

      <PlatformCard
        title="Λιανικής"
        type="retail"
        description="Συμπλήρωσε στοιχεία"
        icon="bi-ui-checks"
      />

      <div className="d-flex gap-2 mt-3">
        <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => {
          router.back();
          dispatch(deletedDraftTemplate());
        }}>
          Άκυρο
        </button>

        <button type="button" className="btn btn-primary flex-fill" onClick={handleContinue} disabled={loading}
        >
          {loading ? (
            <span className="d-inline-flex align-items-center gap-2">
              Φόρτωση…
            </span>
          ) : (
            "Επόμενο"
          )}
        </button>

      </div>

      <Alert variant="danger" className={`mt-3 w-100 ${error ? "" : "d-none"}`}>
        {error}
      </Alert>
    </div>
  );
}
