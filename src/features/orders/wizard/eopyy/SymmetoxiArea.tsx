import { setDraftProperty } from '@/store/orders/ordersSlice';
import { formatCurrencyGR } from '@/lib/utils/number';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import React from 'react'
import { FormSelect } from 'react-bootstrap';

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
    const discountReasons = useAppSelector(s => s.orders.draft.list_DiscountReasons)
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
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={data.symmPercentage ?? ""}
                    onChange={(e) => {
                        const raw = e.target.value;

                        if (raw === "") {
                            dispatch(setDraftProperty({ key: "symmPercentage", value: null }));
                            return;
                        }

                        let n = Number(raw);
                        if (Number.isNaN(n)) return;

                        n = Math.max(0, Math.min(100, n));

                        dispatch(setDraftProperty({ key: "symmPercentage", value: n }));
                    }}
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
                            value={formatCurrencyGR(data.kostos ?? "")}
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
                            value={formatCurrencyGR((data.kostos ?? 0) * (data.symmPercentage ?? 0) / 100)}
                        />
                    </Field>
                </div>
            </div>


            <div className="form-check form-switch mb-2 switch-lg">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={data.payFullOrDiscount == 2}
                    onChange={(e) => {
                        dispatch(setDraftProperty({ key: "payFullOrDiscount", value: e.target.checked ? 2 : 1 }))
                        if (e.target.checked) {
                            dispatch(setDraftProperty({ key: "discount_reason_id", value: discountReasons?.[0]?.value }))
                            dispatch(setDraftProperty({ key: "posoDiscounted", value: formatCurrencyGR((data.kostos ?? 0) * (data.symmPercentage ?? 0) / 100) }))
                        } else {
                            dispatch(setDraftProperty({ key: "discount_reason_id", value: null }))
                            dispatch(setDraftProperty({ key: "posoDiscounted", value: 0 }))
                        }
                    }
                    }
                    id="payFullOrDiscount"
                />
                <label className="form-check-label" htmlFor="payFullOrDiscount">
                    Εφαρμογή έκπτωσης
                </label>
            </div>
            {data.payFullOrDiscount == 2 && <>
                <div className="app-divider my-2" />
                <Field label="Λόγος έκπτωσης">
                    <FormSelect name="" value={data.discount_reason_id} onChange={(e) => dispatch(setDraftProperty({ key: "discount_reason_id", value: e.target.value }))}>
                        {discountReasons.map(d => <option key={d.value} value={d.value}>{d.text}</option>)}
                    </FormSelect>
                </Field>
                <Field label="Τελικό ποσό">
                    <input
                        className="form-control"
                        name="posoDiscounted"
                        inputMode="decimal"
                        value={data.posoDiscounted ?? 0}
                        onChange={(e) => {
                            const raw = e.target.value.replaceAll(".", "").replaceAll(",", ".");
                            const maxAllowed = ((Number(data.kostos ?? 0) * Number(data.symmPercentage ?? 0)) / 100) || 0;

                            if (raw === "") {
                                dispatch(setDraftProperty({ key: "posoDiscounted", value: "" }));
                                return;
                            }

                            if (parseFloat(raw) <= maxAllowed) {
                                dispatch(setDraftProperty({ key: "posoDiscounted", value: raw.replace(".", ",") }));
                            }
                        }}
                        onBlur={(e) => {
                            dispatch(setDraftProperty({ key: "posoDiscounted", value: formatCurrencyGR(e.target.value.replaceAll(".", "").replaceAll(",", ".")) }))
                        }}
                    />
                </Field>
            </>}
        </div>
    )
}

export default SymmetoxiArea