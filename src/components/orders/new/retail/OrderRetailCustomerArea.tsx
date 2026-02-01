import { setDraftProperty } from "@/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CustomerLookupModal from "../CustomerLookupModal";
import React from "react";

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

export default function OrderRetailCustomerArea() {
    const data = useAppSelector((s) => s.orders.draft.order);
    const dispatch = useAppDispatch()
    const [showLookup, setShowLookup] = React.useState(false);

    const handleDateInput = (value: string) => {
        if (value.length == 1 && parseInt(value) > 3) return;
        if (value.length == 2 && parseInt(value) > 31) return;

        if (value.length == 5 && parseInt(value.substring(3, 5)) > 12) return;

        if (value.length === 2 || value.length === 5) {
            if (data.customer_dob && data.customer_dob.length < value.length) {
                value += "/";
            }
        }

        if (value.length === 4) {
            if (data.customer_dob && data.customer_dob.length < value.length && parseInt(value.substring(3, 4)) > 1) {
                value = value.substring(0, 2) + "/0" + value.substring(3, 4) + "/";
            }
        }
        dispatch(setDraftProperty({ key: "customer_dob", value: value }));
    }

    const handleSearchClick = () => {
        // open search modal / navigate to search page
        setShowLookup(true);
    }

    return (
        <div className="app-card p-4">
            <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                <div className="fw-semibold">Στοιχεία ασθενή</div>

                <button
                    type="button"
                    className="btn-icon-pill"
                    aria-label="Αναζήτηση"
                    onClick={handleSearchClick}
                >
                    <i className="bi bi-search" />
                </button>
            </div>

            <CustomerLookupModal
                show={showLookup}
                onClose={() => setShowLookup(false)}
                initialQuery={data.customer_amka ?? data.customer_name ?? ""}
            />

            <Field label="Ονοματεπώνυμο">
                <input
                    className="form-control"
                    value={data.customer_name ?? ""}
                    onChange={(e) => dispatch(setDraftProperty({ key: "customer_name", value: e.target.value }))}
                />
            </Field>

            <div className="row g-2">
                <div className="col-7">
                    <Field label="ΑΜΚΑ">
                        <input
                            className="form-control"
                            inputMode="numeric"
                            value={data.customer_amka ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "customer_amka", value: e.target.value }))}
                        />
                    </Field>
                </div>
                <div className="col-5">
                    <Field label="Ημ/νία Γέννησης" hint="π.χ. 31/12/1990">
                        <input
                            className="form-control"
                            inputMode="numeric"
                            value={data.customer_dob ?? ""}
                            onChange={(e) => handleDateInput(e.target.value)}
                        />
                    </Field>
                </div>
            </div>

            <div className="row g-2">
                <div className="col-7">
                    <Field label="Τηλέφωνο">
                        <input
                            className="form-control"
                            inputMode="tel"
                            value={data.customer_tel ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "customer_tel", value: e.target.value }))}
                        />
                    </Field>
                </div>
                <div className="col-5">
                    <Field label="Email">
                        <input
                            className="form-control"
                            inputMode="email"
                            value={data.customer_email ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "customer_email", value: e.target.value }))}
                        />
                    </Field>
                </div>
            </div>

            <Field label="Διεύθυνση">
                <input
                    className="form-control"
                    value={data.customer_address ?? ""}
                    onChange={(e) => dispatch(setDraftProperty({ key: "customer_address", value: e.target.value }))}
                />
            </Field>

            <div className="row g-2">
                <div className="col-8">
                    <Field label="Πόλη">
                        <input
                            className="form-control"
                            value={data.customer_city ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "customer_city", value: e.target.value }))}
                        />
                    </Field>
                </div>
                <div className="col-4">
                    <Field label="ΤΚ">
                        <input
                            className="form-control"
                            inputMode="numeric"
                            value={data.customer_tk ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "customer_tk", value: e.target.value }))}
                        />
                    </Field>
                </div>
            </div>

            <div className="app-divider my-2" />

            <div className="form-check form-switch mb-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={data.deliverySunday == 1}
                    onChange={(e) => dispatch(setDraftProperty({ key: "deliverySunday", value: e.target.checked ? 1 : 0 }))}
                    id="deliverySunday"
                />
                <label className="form-check-label" htmlFor="deliverySunday">
                    Παράδοση Σάββατο
                </label>
            </div>

            <div className="form-check form-switch mb-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={data.deliveryMorning == 1}
                    onChange={(e) => dispatch(setDraftProperty({ key: "deliveryMorning", value: e.target.checked ? 1 : 0 }))}
                    id="deliveryMorning"
                />
                <label className="form-check-label" htmlFor="deliveryMorning">
                    Πρωινή Παράδοση
                </label>
            </div>

            <div className="form-check form-switch mb-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={data.shipTo_other_address == 1}
                    onChange={(e) => dispatch(setDraftProperty({ key: "shipTo_other_address", value: e.target.checked ? 1 : 0 }))}
                    id="shipTo_other_address"
                />
                <label className="form-check-label" htmlFor="shipTo_other_address">
                    Θα παραδοθεί σε άλλη διέυθυνση
                </label>
            </div>

            {data.shipTo_other_address == 1 &&
                <>
                    <div className="mt-3">
                        <Field label="Διεύθυνση παράδοσης">
                            <input
                                className="form-control"
                                value={data.customer_other_address ?? ""}
                                onChange={(e) => dispatch(setDraftProperty({ key: "customer_other_address", value: e.target.value }))}
                            />
                        </Field>
                    </div>
                    <div className="row g-2">
                        <div className="col-8">
                            <Field label="Πόλη ">
                                <input
                                    className="form-control"
                                    value={data.customer_other_city ?? ""}
                                    onChange={(e) => dispatch(setDraftProperty({ key: "customer_other_city", value: e.target.value }))}
                                />
                            </Field>
                        </div>
                        <div className="col-4">
                            <Field label="ΤΚ">
                                <input
                                    className="form-control"
                                    inputMode="numeric"
                                    value={data.customer_other_tk ?? ""}
                                    onChange={(e) => dispatch(setDraftProperty({ key: "customer_other_tk", value: e.target.value }))}
                                />
                            </Field>
                        </div>
                    </div>
                </>
            }
        </div>
    );
}