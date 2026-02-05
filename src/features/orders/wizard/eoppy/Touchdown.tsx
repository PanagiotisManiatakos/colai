import { setDraftProperty } from "@/features/orders/ordersSlice";
import { formatCurrencyGR } from "@/lib/utils/number";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";
import { Alert } from "react-bootstrap";

export default function Touchdown() {
    const data = useAppSelector((s) => s.orders.draft.order);
    const dispatch = useAppDispatch()
    const submitState = useAppSelector((s) => s.orders.draft.submitState)

    React.useEffect(() => {
        if (!data.isTempSave) dispatch(setDraftProperty({ key: "isTempSave", value: 1 }))
    }, [])

    return (
        <>
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
                        name="payFullOrDiscount"
                    />
                    <label className="form-check-label" htmlFor="payFullOrDiscount">
                        Προσωρινή αποθήκευση
                    </label>
                </div>

                {/* <div className="app-divider my-2" /> */}
            </div>
            {submitState.error && <Alert className="mt-3" variant="danger">{submitState.error}</Alert>}
        </>
    );
}