import { setDraftProperty } from '@/store/orders/ordersSlice';
import { formatCurrencyGR } from '@/lib/utils/number';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import React from 'react'
import { FormSelect } from 'react-bootstrap';

type Props = {
    errors?: Record<string, string | boolean>;
    clearError?: (field: string) => void;
};

type ErrorCtx = {
    errors: Record<string, string | boolean>;
    clearError?: (field: string) => void;
};

const FormErrorsContext = React.createContext<ErrorCtx>({ errors: {} });

function mergeClassName(a?: string, b?: string) {
    return [a, b].filter(Boolean).join(" ");
}

function Field({ label, children, hint }: { label?: string; children: React.ReactNode; hint?: string }) {
    const { errors, clearError } = React.useContext(FormErrorsContext);

    const childIsEl = React.isValidElement(children);
    const name = childIsEl ? (children.props as any)?.name : undefined;
    const error = name ? errors[name] : undefined;

    const enhancedChild = childIsEl
        ? React.cloneElement(children as any, {
            className: mergeClassName((children.props as any).className, error ? "is-invalid" : ""),
            "aria-invalid": !!error,

            onChange: (...args: any[]) => {
                (children.props as any)?.onChange?.(...args);
                if (name && error && clearError) clearError(name);
            },
            onBlur: (...args: any[]) => {
                (children.props as any)?.onBlur?.(...args);
                if (name && error && clearError) clearError(name);
            },
        })
        : children;

    return (
        <div className={label ? "mb-3" : ""}>
            {label && <label className="form-label fw-semibold">{label}</label>}
            {enhancedChild}
            {error ? <div className="invalid-feedback d-block">{error}</div> : hint ? <div className="form-text">{hint}</div> : null}
        </div>
    );
}

function SwitchField({
    name,
    id,
    label,
    checked,
    onChange,
}: {
    name: string;
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    const { errors, clearError } = React.useContext(FormErrorsContext);
    const error = errors[name];

    return (
        <div className="form-check form-switch mb-2 switch-lg">
            <input
                className={mergeClassName("form-check-input", error ? "is-invalid" : "")}
                type="checkbox"
                name={name}
                id={id}
                checked={!!checked}
                aria-invalid={!!error}
                onChange={(e) => {
                    onChange(e.target.checked);
                    if (error && clearError) clearError(name);
                }}
            />
            <label className="form-check-label" htmlFor={id}>
                {label}
            </label>

            {error && error !== true ? <div className="invalid-feedback d-block">{error}</div> : null}
        </div>
    );
}

const SymmetoxiArea = ({ errors, clearError }: Props) => {
    const data = useAppSelector((s) => s.orders.draft.order);
    const dispatch = useAppDispatch()
    const discountReasons = useAppSelector(s => s.orders.draft.list_DiscountReasons)
    return (
        <div className="app-card p-4">
            <FormErrorsContext.Provider value={{ errors: errors ?? {}, clearError }}>
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


                {data.symmPercentage > 0 && <>
                    <div className="form-check form-switch mb-2 switch-lg">

                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={data.payFullOrDiscount == 1}
                            onChange={(e) => {
                                dispatch(setDraftProperty({ key: "payFullOrDiscount", value: e.target.checked ? 1 : 2 }))
                                if (!e.target.checked) {
                                    dispatch(setDraftProperty({ key: "discount_reason_id", value: discountReasons?.[0]?.value }))
                                    dispatch(setDraftProperty({ key: "posoDiscounted", value: formatCurrencyGR((data.kostos ?? 0) * (data.symmPercentage ?? 0) / 100) }))
                                } else {
                                    dispatch(setDraftProperty({ key: "discount_reason_id", value: null }))
                                    dispatch(setDraftProperty({ key: "posoDiscounted", value: null }))
                                }
                            }
                            }
                            id="payFullOrDiscount"
                        />
                        <label className="form-check-label" htmlFor="payFullOrDiscount">
                            Επιβεβαίωση συνολικού ποσού
                        </label>
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
                                    dispatch(setDraftProperty({ key: "posoDiscounted", value: null }))
                                }
                            }
                            }
                            id="payFullOrDiscount"
                        />
                        <label className="form-check-label" htmlFor="payFullOrDiscount">
                            Εφαρμογή έκπτωσης
                        </label>
                    </div>
                </>
                }
                {!(data.symmPercentage > 0) && <SwitchField
                    name="EopyyVerifyNoParticipation"
                    id="EopyyVerifyNoParticipation"
                    label="Επιβεβαίωση μηδενικής συμμετοχής"
                    checked={data.EopyyVerifyNoParticipation == 1}
                    onChange={(checked) =>
                        dispatch(setDraftProperty({ key: "EopyyVerifyNoParticipation", value: checked ? 1 : 0 }))
                    }
                />}
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
            </FormErrorsContext.Provider>
        </div>
    )
}

export default SymmetoxiArea