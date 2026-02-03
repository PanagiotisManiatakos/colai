import { setDraftProperty } from "@/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";

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

    return (
        <div className="app-card p-4">
            <div style={{ height: 51 }} className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                <div className="fw-semibold">Checkout</div>
            </div>

            <div className="row g-2">
                <div className="col-6">
                    <Field label="Αξία Υλικών">
                        <input
                            className="form-control"
                            value={data.kostos ?? ""}
                            disabled
                        />
                    </Field>
                </div>
                <div className="col-6">
                    <Field label="Ποσό Πληρωμής">
                        <input
                            className="form-control"
                            value={data.posoSymmetoxis ?? ""}
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

        </div>
    );
}