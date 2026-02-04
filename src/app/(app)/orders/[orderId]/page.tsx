"use client";

import React from "react";
import { Alert, FormSelect } from "react-bootstrap";
import { useRouter } from "next/navigation";

import { PlatformCard } from "@/components/ui/PlatformCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deletedDraftTemplate, editDraftAsync, setDraftProperty } from "@/features/orders/ordersSlice";

export default function OrderStartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const type = useAppSelector((state) => state.orders.draft.order?.type);
  const groupid = useAppSelector((state) => state.orders.draft.order?.groupid);
  const editState = useAppSelector((state) => state.orders.draft.editState);

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!groupid) dispatch(setDraftProperty({ key: "groupid", value: 4 }));
  }, [dispatch, groupid]);

  React.useEffect(() => {
    if (type) setError(null);
  }, [type]);

  React.useEffect(() => {
    if (editState.error) setError(editState.error);
  }, [editState.error]);

  const handleContinue = async () => {
    if (!type) {
      setError("Παρακαλώ επίλεξε πλατφόρμα για να συνεχίσεις.");
      return;
    }

    setError(null);

    try {
      const response = await dispatch(editDraftAsync({ catid: 4, typeid: type })).unwrap();
      router.push(`/orders/0/${encodeURIComponent(type)}/new?uid=${response.data.order.uid}`);
    } catch (e: any) {
      setError(e?.message || "Κάτι πήγε στραβά.");
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <h1 className="h5 fw-semibold mb-1">Επιλογή πλατφόρμας</h1>
        <p className="text-secondary small mb-0">Διάλεξε ροή εργασίας για να ξεκινήσεις.</p>
      </div>

      <div className="app-card p-3">
        <label className="form-label small text-secondary mb-2">Κατηγορία</label>
        <FormSelect value={groupid} onChange={(e) => dispatch(setDraftProperty({ key: "groupid", value: Number(e.target.value) }))} aria-label="Κατηγορία">
          <option value="4">WC</option>
        </FormSelect>
      </div>

      <div className="d-flex flex-column gap-2">
        <PlatformCard title="ΕΟΠΥΥ" type="eoppy" description="Ανέβασε παραπεμπτικό/γνωμάτευση" icon="bi-cloud-upload" />
        <PlatformCard title="Λιανικής" type="retail" description="Συμπλήρωσε στοιχεία" icon="bi-ui-checks" />
      </div>

      {error ? (
        <Alert variant="danger" className="mb-0">
          {error}
        </Alert>
      ) : null}

      <div className="d-flex gap-2 pt-1">
        <button
          type="button"
          className="btn btn-outline-secondary flex-fill"
          onClick={() => {
            router.replace("/orders");
            dispatch(deletedDraftTemplate());
          }}
          disabled={editState.loading}
        >
          Άκυρο
        </button>

        <button type="button" className="btn btn-primary flex-fill" onClick={handleContinue} disabled={editState.loading}>
          {editState.loading ? "Φόρτωση…" : "Επόμενο"}
        </button>
      </div>
    </div>
  );
}
