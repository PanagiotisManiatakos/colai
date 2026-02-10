import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";
import DoctorLookupModal from "../modals/DoctorLookupModal";

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
    const [showSuggestedLookup, setShowSuggestedLookup] = React.useState(false);


    return (
        <div className="app-card p-4">
            <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                <div className="fw-semibold">Ιατρός</div>

                <button
                    type="button"
                    className="btn-icon-pill"
                    aria-label="Αναζήτηση"
                    onClick={() => setShowLookup(true)}
                >
                    <i className="bi bi-search" />
                </button>
            </div>

            <DoctorLookupModal
                show={showLookup}
                onClose={() => setShowLookup(false)}
                initialQuery={data.doctor_amka ?? data.doctor_name ?? ""}
            />

            <Field label="Ονοματεπώνυμο">
                <input
                    className="form-control"
                    name="doctor_name"
                    value={data.doctor_name ?? ""}
                    onChange={(e) => dispatch(setDraftProperty({ key: "doctor_name", value: e.target.value }))}
                />
            </Field>
            <div className="row g-2">
                <div className="col-7">
                    <Field label="ΑΜΚΑ">
                        <input
                            className="form-control"
                            name="doctor_amka"
                            inputMode="numeric"
                            value={data.doctor_amka ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "doctor_amka", value: e.target.value }))}
                        />
                    </Field>
                </div>

                <div className="col-5">
                    <Field label="ΑΦΜ">
                        <input
                            className="form-control"
                            name="doctor_afm"
                            inputMode="numeric"
                            value={data.doctor_afm ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "doctor_afm", value: e.target.value }))}
                        />
                    </Field>
                </div>
            </div>

            <Field label="Υγεινομική δομή">
                <input
                    className="form-control"
                    name="doctor_Domi"
                    value={data.doctor_Domi ?? ""}
                    onChange={(e) => dispatch(setDraftProperty({ key: "doctor_Domi", value: e.target.value }))}
                />
            </Field>

            <Field label="Τύπος">
                <input
                    className="form-control"
                    name="doctor_DomiTypos"
                    value={data.doctor_DomiTypos ?? ""}
                    onChange={(e) => dispatch(setDraftProperty({ key: "doctor_DomiTypos", value: e.target.value }))}
                />
            </Field>


            <div className="form-check form-switch mb-2 switch-lg">
                <input
                    className="form-check-input"
                    name="has_suggested_doctor"
                    type="checkbox"
                    checked={data.has_suggested_doctor == 1}
                    onChange={(e) => dispatch(setDraftProperty({ key: "has_suggested_doctor", value: e.target.checked ? 1 : 0 }))}
                />
                <label className="form-check-label" htmlFor="has_suggested_doctor">
                    Έχω συστήνων ιατρό
                </label>
            </div>

            {data.has_suggested_doctor == 1 &&

                <>
                    <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                        <div className="fw-semibold">Συστήνων ιατρός</div>

                        {data.has_suggested_doctor == 1 &&
                            <button
                                type="button"
                                className="btn-icon-pill"
                                aria-label="Αναζήτηση"
                                onClick={() => setShowSuggestedLookup(true)}
                            >
                                <i className="bi bi-search" />
                            </button>}
                    </div>

                    <DoctorLookupModal
                        show={showSuggestedLookup}
                        isSuggested
                        onClose={() => setShowSuggestedLookup(false)}
                        initialQuery={data.doctorSuggested_amka ?? data.doctorSuggested_name ?? ""}
                    />
                    <Field label="Ονοματεπώνυμο">
                        <input
                            className="form-control"
                            name="doctorSuggested_name"
                            value={data.doctorSuggested_name ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "doctorSuggested_name", value: e.target.value }))}
                        />
                    </Field>
                    <div className="row g-2">
                        <div className="col-7">

                            <Field label="ΑΜΚΑ">
                                <input
                                    className="form-control"
                                    name="doctorSuggested_amka"
                                    value={data.doctorSuggested_amka ?? ""}
                                    onChange={(e) => dispatch(setDraftProperty({ key: "doctorSuggested_amka", value: e.target.value }))}
                                />
                            </Field>
                        </div>
                        <div className="col-5">

                            <Field label="ΑΦΜ">
                                <input
                                    className="form-control"
                                    name="doctorSuggested_afm"
                                    value={data.doctorSuggested_afm ?? ""}
                                    onChange={(e) => dispatch(setDraftProperty({ key: "doctorSuggested_afm", value: e.target.value }))}
                                />
                            </Field>
                        </div>
                    </div>
                </>
            }
        </div>
    );
}