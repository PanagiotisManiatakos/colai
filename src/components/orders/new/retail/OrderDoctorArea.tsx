import { setDraftProperty } from "@/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";
import DoctorLookupModal from "../DoctorLookupModal";

function Field({ label, children, hint }: {
    label: string;
    children: React.ReactNode;
    hint?: string;
}) {
    return (
        <div className="mb-3">
            <label className="form-label fw-semibold">{label}</label>
            {children}
            {hint ? <div className="form-text">{hint}</div> : null}
        </div>
    );
}

export default function OrderDoctorArea() {
    const data = useAppSelector((s) => s.orders.draft.order);
    const dispatch = useAppDispatch()
    const [showLookup, setShowLookup] = React.useState(false);

    const handleSearchClick = () => {
        // open search modal / navigate to search page
        setShowLookup(true);
    }

    return (
        <div className="app-card p-4">
            <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                <div className="fw-semibold">Ιατρός</div>

                {data.has_suggested_doctor == 1 &&
                    <button
                        type="button"
                        className="btn-icon-pill"
                        aria-label="Αναζήτηση"
                        onClick={handleSearchClick}
                    >
                        <i className="bi bi-search" />
                    </button>}
            </div>

            <DoctorLookupModal
                show={showLookup}
                isSuggested
                onClose={() => setShowLookup(false)}
                initialQuery={data.doctorSuggested_amka ?? data.doctorSuggested_name ?? ""}
            />


            <div className="form-check form-switch mb-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={data.has_suggested_doctor == 1}
                    onChange={(e) => dispatch(setDraftProperty({ key: "has_suggested_doctor", value: e.target.checked ? 1 : 0 }))}
                    id="has_suggested_doctor"
                />
                <label className="form-check-label" htmlFor="has_suggested_doctor">
                    Έχω συστήνων ιατρό
                </label>
            </div>

            {data.has_suggested_doctor == 1 &&

                <>
                    <Field label="ΑΜΚΑ Ιατρού">
                        <input
                            className="form-control"
                            value={data.doctorSuggested_amka ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "doctorSuggested_amka", value: e.target.value }))}
                        />
                    </Field>
                    <Field label="Ονοματεπώνυμο">
                        <input
                            className="form-control"
                            value={data.doctorSuggested_name ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "doctorSuggested_name", value: e.target.value }))}
                        />
                    </Field>
                    <Field label="ΑΦΜ">
                        <input
                            className="form-control"
                            value={data.doctorSuggested_afm ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "doctorSuggested_afm", value: e.target.value }))}
                        />
                    </Field>
                </>
            }
        </div>
    );
}