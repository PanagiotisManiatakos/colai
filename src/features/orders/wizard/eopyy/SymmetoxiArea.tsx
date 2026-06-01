import { setDraftProperty } from "@/store/orders/ordersSlice";
import { formatCurrencyGR } from "@/lib/utils/number";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { FormSelect } from "react-bootstrap";
import { useEffect } from "react";
import FormErrorsContext from "@/components/ui/FormErrorContect";
import OrderField from "@/components/ui/OrderField";
import OrderSwitchField from "@/components/ui/OrdeSwitchField";
import type { SymmetoxiAreaProps } from "./componentProps";

const SymmetoxiArea = ({ errors, clearError }: SymmetoxiAreaProps) => {
  const data = useAppSelector((s) => s.orders.draft.order);
  const dispatch = useAppDispatch();
  const discountReasons = useAppSelector(
    (s) => s.orders.draft.list_DiscountReasons,
  );

  const posoSymetoxis =
    (Number(data.kostos ?? 0) * Number(data.symmPercentage ?? 0)) / 100;
  const maxPosoKostousGiaSymmetoxi = data.maxPosoKostousGiaSymmetoxi ?? 0;
  const symmetoxiEoppy =
    data.kostos > maxPosoKostousGiaSymmetoxi
      ? (Number(data.maxPosoKostousGiaSymmetoxi ?? 0) *
          Number(data.symmPercentage ?? 0)) /
        100
      : posoSymetoxis;
  const ypervasiPlafon =
    (data.kostos ?? 0) - (data.maxPosoKostousGiaSymmetoxi ?? 0);
  const finalAmount = Number(
    String(data.posoDiscounted ?? 0)
      .replaceAll(".", "")
      .replaceAll(",", "."),
  );
  const isFinalAmountZero =
    data.payFullOrDiscount == 2 &&
    Number.isFinite(finalAmount) &&
    finalAmount === 0;

  useEffect(() => {
    if (data.eopyyVerifyNoParticipation == 1) {
      if (data.hasConfirmedMidenikiPliromi !== true) {
        dispatch(
          setDraftProperty({
            key: "hasConfirmedMidenikiPliromi",
            value: true,
          }),
        );
      }
      return;
    }

    if (!isFinalAmountZero && data.hasConfirmedMidenikiPliromi != null) {
      dispatch(
        setDraftProperty({
          key: "hasConfirmedMidenikiPliromi",
          value: null,
        }),
      );
    }
  }, [
    data.eopyyVerifyNoParticipation,
    data.hasConfirmedMidenikiPliromi,
    dispatch,
    isFinalAmountZero,
  ]);

  useEffect(() => {
    if (data.eopyyVerifyNoParticipation == 1) return;

    if (isFinalAmountZero && data.hasConfirmedMidenikiPliromi == null) {
      dispatch(
        setDraftProperty({
          key: "hasConfirmedMidenikiPliromi",
          value: false,
        }),
      );
    }
  }, [
    data.eopyyVerifyNoParticipation,
    data.hasConfirmedMidenikiPliromi,
    dispatch,
    isFinalAmountZero,
  ]);

  return (
    <div className="app-card p-3">
      <FormErrorsContext.Provider value={{ errors: errors ?? {}, clearError }}>
        <div
          style={{ height: 51 }}
          className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2"
        >
          <div className="fw-semibold">Συμμετοχή</div>
        </div>

        <OrderField label="%">
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
                dispatch(
                  setDraftProperty({ key: "symmPercentage", value: null }),
                );
                return;
              }

              let n = Number(raw);
              if (Number.isNaN(n)) return;

              n = Math.max(0, Math.min(100, n));

              dispatch(setDraftProperty({ key: "symmPercentage", value: n }));
            }}
          />
        </OrderField>

        <div className="row g-2">
          <div className="col-6">
            <OrderField label="Αξία υλικών">
              <input
                className="form-control"
                name="kostos"
                inputMode="numeric"
                disabled
                readOnly
                value={formatCurrencyGR(data.kostos ?? "")}
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="Συμμετοχή ΕΟΠΥΥ">
              <input
                className="form-control"
                name="posoSymmetoxisOld"
                inputMode="numeric"
                disabled
                readOnly
                value={formatCurrencyGR(symmetoxiEoppy)}
              />
            </OrderField>
          </div>
        </div>

        {data.eidos_Egkrisis == 1 && (
          <>
            <div className="row g-2">
              <div className="col-6">
                <OrderField label="Πλαφόν">
                  <input
                    className="form-control"
                    name="maxPosoKostousGiaSymmetoxi"
                    inputMode="numeric"
                    disabled
                    readOnly
                    value={formatCurrencyGR(
                      data.maxPosoKostousGiaSymmetoxi ?? 0,
                    )}
                  />
                </OrderField>
              </div>

              <div className="col-6">
                <OrderField label="Υπέρβαση πλαφόν">
                  <input
                    className="form-control"
                    name="ypervasiPlafon"
                    inputMode="numeric"
                    disabled
                    readOnly
                    value={formatCurrencyGR(
                      ypervasiPlafon > 0 ? ypervasiPlafon : 0,
                    )}
                  />
                </OrderField>
              </div>
            </div>
            <div className="col-6">
              <OrderField label="Πληρωτέο">
                <input
                  className="form-control"
                  name="posoSymmetoxis"
                  inputMode="numeric"
                  disabled
                  readOnly
                  value={formatCurrencyGR(data.posoSymmetoxis ?? 0)}
                />
              </OrderField>
            </div>
          </>
        )}

        {data.posoSymmetoxis > 0 && (
          <>
            <div className="form-check form-switch switch-lg mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={data.payFullOrDiscount == 1}
                onChange={(e) => {
                  dispatch(
                    setDraftProperty({
                      key: "payFullOrDiscount",
                      value: e.target.checked ? 1 : 2,
                    }),
                  );
                  if (!e.target.checked) {
                    dispatch(
                      setDraftProperty({
                        key: "discount_reason_id",
                        value: discountReasons?.[0]?.value,
                      }),
                    );
                    dispatch(
                      setDraftProperty({
                        key: "posoDiscounted",
                        value: formatCurrencyGR(data.posoSymmetoxis ?? 0),
                      }),
                    );
                  } else {
                    dispatch(
                      setDraftProperty({
                        key: "discount_reason_id",
                        value: null,
                      }),
                    );
                    dispatch(
                      setDraftProperty({ key: "posoDiscounted", value: null }),
                    );
                    dispatch(
                      setDraftProperty({
                        key: "hasConfirmedMidenikiPliromi",
                        value: null,
                      }),
                    );
                  }
                }}
                id="payFullOrDiscount"
              />
              <label className="form-check-label" htmlFor="payFullOrDiscount">
                Επιβεβαίωση συνολικού ποσού
              </label>
            </div>
            <div className="form-check form-switch switch-lg mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={data.payFullOrDiscount == 2}
                onChange={(e) => {
                  dispatch(
                    setDraftProperty({
                      key: "payFullOrDiscount",
                      value: e.target.checked ? 2 : 1,
                    }),
                  );
                  if (e.target.checked) {
                    dispatch(
                      setDraftProperty({
                        key: "discount_reason_id",
                        value: discountReasons?.[0]?.value,
                      }),
                    );
                    dispatch(
                      setDraftProperty({
                        key: "posoDiscounted",
                        value: formatCurrencyGR(data.posoSymmetoxis ?? 0),
                      }),
                    );
                  } else {
                    dispatch(
                      setDraftProperty({
                        key: "discount_reason_id",
                        value: null,
                      }),
                    );
                    dispatch(
                      setDraftProperty({ key: "posoDiscounted", value: null }),
                    );
                    dispatch(
                      setDraftProperty({
                        key: "hasConfirmedMidenikiPliromi",
                        value: null,
                      }),
                    );
                  }
                }}
                id="payFullOrDiscount"
              />
              <label className="form-check-label" htmlFor="payFullOrDiscount">
                Εφαρμογή έκπτωσης
              </label>
            </div>
          </>
        )}
        {!(data.posoSymmetoxis > 0) && (
          <OrderSwitchField
            name="eopyyVerifyNoParticipation"
            id="eopyyVerifyNoParticipation"
            label="Επιβεβαίωση μηδενικής πληρωμής"
            checked={data.eopyyVerifyNoParticipation == 1}
            onChange={(checked) => {
              dispatch(
                setDraftProperty({
                  key: "eopyyVerifyNoParticipation",
                  value: checked ? 1 : 0,
                }),
              );
              dispatch(
                setDraftProperty({
                  key: "hasConfirmedMidenikiPliromi",
                  value: checked ? true : null,
                }),
              );
              !data.eidos_Egkrisis &&
                dispatch(setDraftProperty({ key: "eidos_Egkrisis", value: 1 }));
            }}
          />
        )}
        {data.payFullOrDiscount == 2 && (
          <>
            <div className="app-divider my-2" />
            <OrderField label="Λόγος έκπτωσης">
              <FormSelect
                name=""
                value={data.discount_reason_id}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "discount_reason_id",
                      value: e.target.value,
                    }),
                  )
                }
              >
                {discountReasons.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.text}
                  </option>
                ))}
              </FormSelect>
            </OrderField>
            <OrderField label="Τελικό ποσό">
              <input
                className="form-control"
                name="posoDiscounted"
                inputMode="decimal"
                value={data.posoDiscounted ?? 0}
                onChange={(e) => {
                  const raw = e.target.value
                    .replaceAll(".", "")
                    .replaceAll(",", ".");
                  const maxAllowed = data.posoSymmetoxis ?? 0;

                  if (raw === "") {
                    dispatch(
                      setDraftProperty({ key: "posoDiscounted", value: "" }),
                    );
                    return;
                  }

                  if (parseFloat(raw) <= maxAllowed) {
                    dispatch(
                      setDraftProperty({
                        key: "posoDiscounted",
                        value: raw.replace(".", ","),
                      }),
                    );
                  }
                }}
                onBlur={(e) => {
                  dispatch(
                    setDraftProperty({
                      key: "posoDiscounted",
                      value: formatCurrencyGR(
                        e.target.value.replaceAll(".", "").replaceAll(",", "."),
                      ),
                    }),
                  );
                }}
              />
            </OrderField>
            {isFinalAmountZero && (
              <OrderSwitchField
                name="hasConfirmedMidenikiPliromi"
                id="hasConfirmedMidenikiPliromi"
                label="Επιβεβαίωση μηδενικής πληρωμής"
                checked={Boolean(data.hasConfirmedMidenikiPliromi)}
                onChange={(checked) => {
                  dispatch(
                    setDraftProperty({
                      key: "hasConfirmedMidenikiPliromi",
                      value: checked,
                    }),
                  );
                }}
              />
            )}
          </>
        )}
      </FormErrorsContext.Provider>
    </div>
  );
};

export default SymmetoxiArea;
