import { setDraftProperty } from '@/features/orders/ordersSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import React from 'react'

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

const SymmetoxiArea = () => {
    const data = useAppSelector((s) => s.orders.draft.order);
    const dispatch = useAppDispatch()
    return (
        <div className="app-card p-4">
            <div style={{ height: 51 }} className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                <div className="fw-semibold">Συμμετοχή</div>

            </div>

            <Field label="%">
                <input
                    className="form-control"
                    name="symmPercentage"
                    inputMode="numeric"
                    value={data.symmPercentage ?? ""}
                    onChange={(e) => dispatch(setDraftProperty({ key: "symmPercentage", value: e.target.value }))}
                />
            </Field>

            <div className="row g-2">
                <div className="col-6">
                    <Field label="Αξία υλικών">
                        <input
                            className="form-control"
                            name="kostos"
                            inputMode="numeric"
                            disabled
                            readOnly
                            value={data.kostos ?? ""}
                        />
                    </Field>
                </div>
                <div className="col-6">
                    <Field label="Συμμετοχή ασθενή">
                        <input
                            className="form-control"
                            name="posoSymmetoxis"
                            inputMode="numeric"
                            disabled
                            readOnly
                            value={data.posoSymmetoxis ?? ""}
                        />
                    </Field>
                </div>
            </div>
        </div>
    )
}

export default SymmetoxiArea