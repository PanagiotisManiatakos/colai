// Touchdown.tsx
"use client";

import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";
import { Alert } from "react-bootstrap";

type WizardIssueLike = { step: string; field: string; message: string | boolean };

type Props = {
    issues?: WizardIssueLike[];
    onGoToIssue?: (it: WizardIssueLike) => void;
    stepLabels?: Record<string, string>;
};

export default function Touchdown({ issues = [], onGoToIssue, stepLabels }: Props) {
    const data = useAppSelector((s) => s.orders.draft.order);
    const dispatch = useAppDispatch();
    const submitState = useAppSelector((s) => s.orders.draft.submitState);

    React.useEffect(() => {
        if (!data.isTempSave) dispatch(setDraftProperty({ key: "isTempSave", value: 0 }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const uniqueIssues = React.useMemo(() => {
        const seen = new Set<string>();
        return issues.filter((x) => {
            if (seen.has(x.field)) return false;
            seen.add(x.field);
            return true;
        });
    }, [issues]);

    const msgText = (m: string | boolean, fallbackField: string) => typeof m === "string" ? m : `Υποχρεωτικό πεδίο: ${fallbackField}`;

    return (
        <>
            {uniqueIssues.length > 0 && (
                <div className="app-card p-3 border border-danger-subtle mb-3">
                    <div className="d-flex align-items-start gap-3">
                        <div
                            className="d-flex align-items-center justify-content-center rounded-circle border"
                            style={{ width: 38, height: 38 }}
                            aria-hidden
                        >
                            <i className="bi bi-exclamation-triangle text-danger fs-5" />
                        </div>
                        <div className="d-flex align-items-center justify-content-between gap-2">
                            <div className="fw-semibold">Ελλείψεις πριν την αποθήκευση</div>
                            <span className="badge text-bg-danger">{uniqueIssues.length}</span>
                        </div>
                    </div>

                    <div className="flex-grow-1">

                        <div className="text-body-secondary small mt-1">
                            Πάτησε σε μια γραμμή για να μεταφερθείς στο αντίστοιχο πεδίο.
                        </div>

                        <div className="mt-3 d-flex flex-column gap-2">
                            {uniqueIssues.map((it, idx) => {
                                const stepPrefix = stepLabels?.[it.step] ? `${stepLabels[it.step]} · ` : "";
                                const text = msgText(it.message, it.field);

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => onGoToIssue?.(it)}
                                        className="btn w-100 text-start border"
                                        style={{ borderRadius: 12 }}
                                    >
                                        <div className="d-flex align-items-start gap-2">
                                            <i className="bi bi-arrow-return-right text-danger mt-1" />
                                            <div className="flex-grow-1">
                                                <div className="small text-body-secondary">{stepPrefix}{it.field}</div>
                                                <div className="fw-semibold">{text}</div>
                                            </div>
                                            <i className="bi bi-chevron-right text-body-secondary mt-1" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            )}

            <div className="app-card p-4">
                <div style={{ height: 51 }} className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                    <div className="fw-semibold">Touchdown</div>
                </div>

                <div className="form-check form-switch mb-2 switch-lg">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={data.isTempSave == 1}
                        onChange={(e) => dispatch(setDraftProperty({ key: "isTempSave", value: e.target.checked ? 1 : 0 }))}
                        name="isTempSave"
                    />
                    <label className="form-check-label" htmlFor="isTempSave">
                        Προσωρινή αποθήκευση
                    </label>
                </div>
            </div>

            {submitState.error && <Alert className="mt-3" variant="danger">{submitState.error}</Alert>}
        </>
    );
}
