import OrderField from "@/components/ui/OrderField";
import FormErrorsContext from "@/components/ui/FormErrorContect";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";
import DoctorLookupModal from "../modals/DoctorLookupModal";
import type { OrderDoctorAreaProps } from "./componentProps";

export default function OrderDoctorArea({
  errors,
  clearError,
}: OrderDoctorAreaProps) {
  const data = useAppSelector((s) => s.orders.draft.order);
  const customerIsCompletelyNew = useAppSelector(
    (s) => s.orders.draft.customerIsCompletelyNew,
  );
  const lastWebOrderFromLoadInfo = useAppSelector(
    (s) => s.orders.draft.lastWebOrderFromLoadInfo,
  );
  const disableFieldsBelowTypos =
    customerIsCompletelyNew !== true && lastWebOrderFromLoadInfo !== null;
  const dispatch = useAppDispatch();
  const [showLookup, setShowLookup] = React.useState(false);
  const [showSuggestedLookup, setShowSuggestedLookup] = React.useState(false);

  const openDoctorLookup = () => setShowLookup(true);
  const openSuggestedDoctorLookup = () => setShowSuggestedLookup(true);

  return (
    <div className="app-card p-3">
      <FormErrorsContext.Provider value={{ errors: errors ?? {}, clearError }}>
        <div className="d-flex align-items-center border-bottom mb-3 gap-3 pb-3">
          <label className="form-label fw-semibold mb-0 flex-shrink-0">
            Ιατρός συνταγής
          </label>
          <div className="input-group flex-grow-1" style={{ minWidth: 0 }}>
            <input
              type="text"
              readOnly
              className="form-control"
              placeholder="Αναζήτηση..."
              onClick={openDoctorLookup}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openDoctorLookup();
                }
              }}
              aria-label="Αναζήτηση ιατρού"
              style={{ cursor: "pointer" }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={openDoctorLookup}
              aria-label="Αναζήτηση"
            >
              <i className="bi bi-search" />
            </button>
          </div>
        </div>

        <DoctorLookupModal
          show={showLookup}
          onClose={() => setShowLookup(false)}
        />

        <OrderField label="Ονοματεπώνυμο">
          <input
            className="form-control"
            name="doctor_name"
            value={data.doctor_name ?? ""}
            onChange={(e) =>
              dispatch(
                setDraftProperty({ key: "doctor_name", value: e.target.value }),
              )
            }
          />
        </OrderField>
        <div className="row g-2">
          <div className="col-7">
            <OrderField label="ΑΜΚΑ">
              <input
                className="form-control"
                name="doctor_amka"
                inputMode="numeric"
                value={data.doctor_amka ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "doctor_amka",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>

          <div className="col-5">
            <OrderField label="ΑΦΜ">
              <input
                className="form-control"
                name="doctor_afm"
                inputMode="numeric"
                value={data.doctor_afm ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "doctor_afm",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>
        </div>

        <OrderField label="Υγεινομική δομή">
          <input
            className="form-control"
            name="doctor_Domi"
            value={data.doctor_Domi ?? ""}
            onChange={(e) =>
              dispatch(
                setDraftProperty({ key: "doctor_Domi", value: e.target.value }),
              )
            }
          />
        </OrderField>

        <OrderField label="Τύπος">
          <input
            className="form-control"
            name="doctor_DomiTypos"
            value={data.doctor_DomiTypos ?? ""}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "doctor_DomiTypos",
                  value: e.target.value,
                }),
              )
            }
          />
        </OrderField>

        <fieldset disabled={disableFieldsBelowTypos}>
          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              name="has_suggested_doctor"
              id="has_suggested_doctor_0"
              type="radio"
              checked={data.has_suggested_doctor == 0}
              onChange={() => {
                dispatch(
                  setDraftProperty({ key: "has_suggested_doctor", value: 0 }),
                );
                dispatch(
                  setDraftProperty({
                    key: "hasOtherSystinonIatroBool",
                    value: false,
                  }),
                );
              }}
            />
            <label
              className="form-check-label"
              htmlFor="has_suggested_doctor_0"
            >
              Χωρίς συστήνων ιατρό
            </label>
          </div>

          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              name="has_suggested_doctor"
              id="has_suggested_doctor_2"
              type="radio"
              checked={data.has_suggested_doctor == 1}
              onChange={() => {
                dispatch(
                  setDraftProperty({ key: "has_suggested_doctor", value: 1 }),
                );
                dispatch(
                  setDraftProperty({
                    key: "hasOtherSystinonIatroBool",
                    value: false,
                  }),
                );
              }}
            />
            <label
              className="form-check-label"
              htmlFor="has_suggested_doctor_2"
            >
              Ο ίδιος
            </label>
          </div>

          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              name="has_suggested_doctor"
              id="has_suggested_doctor_3"
              type="radio"
              checked={data.has_suggested_doctor == 2}
              onChange={() => {
                dispatch(
                  setDraftProperty({ key: "has_suggested_doctor", value: 2 }),
                );
                dispatch(
                  setDraftProperty({
                    key: "hasOtherSystinonIatroBool",
                    value: true,
                  }),
                );
              }}
            />
            <label
              className="form-check-label"
              htmlFor="has_suggested_doctor_3"
            >
              Άλλος συστήνων ιατρός
            </label>
          </div>

          {data.has_suggested_doctor == 2 && (
            <>
              <div className="d-flex align-items-center border-bottom mb-3 gap-3 pb-3">
                <label className="form-label fw-semibold mb-0 flex-shrink-0">
                  Συστήνων ιατρός
                </label>
                <div className="input-group flex-grow-1" style={{ minWidth: 0 }}>
                  <input
                    type="text"
                    readOnly
                    className="form-control"
                    placeholder="Αναζήτηση..."
                    onClick={openSuggestedDoctorLookup}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openSuggestedDoctorLookup();
                      }
                    }}
                    aria-label="Αναζήτηση συστήνοντος ιατρού"
                    style={{ cursor: "pointer" }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openSuggestedDoctorLookup}
                    aria-label="Αναζήτηση"
                  >
                    <i className="bi bi-search" />
                  </button>
                </div>
              </div>

              <DoctorLookupModal
                show={showSuggestedLookup}
                isSuggested
                onClose={() => setShowSuggestedLookup(false)}
              />
              <OrderField label="Ονοματεπώνυμο">
                <input
                  className="form-control"
                  name="doctorSuggested_name"
                  value={data.doctorSuggested_name ?? ""}
                  onChange={(e) =>
                    dispatch(
                      setDraftProperty({
                        key: "doctorSuggested_name",
                        value: e.target.value,
                      }),
                    )
                  }
                />
              </OrderField>
              <div className="row g-2">
                <div className="col-7">
                  <OrderField label="ΑΜΚΑ">
                    <input
                      className="form-control"
                      name="doctorSuggested_amka"
                      inputMode="numeric"
                      value={data.doctorSuggested_amka ?? ""}
                      onChange={(e) =>
                        dispatch(
                          setDraftProperty({
                            key: "doctorSuggested_amka",
                            value: e.target.value,
                          }),
                        )
                      }
                    />
                  </OrderField>
                </div>
                <div className="col-5">
                  <OrderField label="ΑΦΜ">
                    <input
                      className="form-control"
                      name="doctorSuggested_afm"
                      inputMode="numeric"
                      value={data.doctorSuggested_afm ?? ""}
                      onChange={(e) =>
                        dispatch(
                          setDraftProperty({
                            key: "doctorSuggested_afm",
                            value: e.target.value,
                          }),
                        )
                      }
                    />
                  </OrderField>
                </div>
              </div>
            </>
          )}
        </fieldset>
      </FormErrorsContext.Provider>
    </div>
  );
}
