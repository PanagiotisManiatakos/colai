import { setDraftProperty } from "@/features/orders/ordersSlice";
import { formatCurrencyGR } from "@/lib/utils/number";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";
import { FormSelect } from "react-bootstrap";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string; }) {
    return (
        <div className="mb-3">
            <label className="form-label fw-semibold">{label}</label>
            {children}
            {hint ? <div className="form-text">{hint}</div> : null}
        </div>
    );
}

export default function CompletionArea() {

    const data = useAppSelector((s) => s.orders.draft.order);
    const dispatch = useAppDispatch()

    React.useEffect(() => {
        if (!data.shipMethodId) dispatch(setDraftProperty({ key: "shipMethodId", value: 5 }))
        if (!data.isTempSave) dispatch(setDraftProperty({ key: "isTempSave", value: 1 }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="app-card p-4">
            <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                <div className="fw-semibold">Checkout</div>
            </div>

            <Field label="Τρόπος αποστολής">
                <FormSelect value={data.shipMethodId ?? 5} onChange={(e) => dispatch(setDraftProperty({ key: "shipMethodId", value: parseInt(e.target.value) }))}>
                    <option value={5} label="Γενική ταχυδρομική" />
                    <option value={6} label="Παραλαβή απο γραφεία" />
                </FormSelect>
            </Field>

            <div className="row g-2">
                <div className="col-6">
                    <Field label="Αξία Υλικών">
                        <input
                            className="form-control"
                            value={formatCurrencyGR(data.kostos)}
                            disabled
                        />
                    </Field>
                </div>
            </div>

            <div className="app-divider my-2" />

            <div className="form-check form-switch mb-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={data.payFullOrDiscount == 2}
                    onChange={(e) => dispatch(setDraftProperty({ key: "payFullOrDiscount", value: e.target.checked ? 2 : 1 }))}
                    id="payFullOrDiscount"
                />
                <label className="form-check-label" htmlFor="payFullOrDiscount">
                    Εφαρμογή έκπτωσης
                </label>
            </div>

            <div className="form-check form-switch mb-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={data.isTempSave == 1}
                    onChange={(e) => dispatch(setDraftProperty({ key: "isTempSave", value: e.target.checked ? 1 : 0 }))}
                    id="isTempSave"
                />
                <label className="form-check-label" htmlFor="isTempSave">
                    Προσωρινή αποθήκευση
                </label>
            </div>

        </div>
    );
}