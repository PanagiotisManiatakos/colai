import OrderField from "@/components/ui/OrderField";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import React from "react";

export default function UpdateRecipientArea() {
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.orders.draft.order);
  const listAddressesPersons = useAppSelector(
    (s) => s.orders.draft.list_AddressesPersons,
  );
  const selectedPerson = React.useMemo(
    () =>
      listAddressesPersons.find((p) => p.person_ErpGID == data.person_ErpGID) ??
      null,
    [listAddressesPersons, data.person_ErpGID],
  );
  const pickPersonString = React.useCallback(
    (preferredValue?: string | null, ...fallbackValues: unknown[]) => {
      if (preferredValue != null && String(preferredValue).trim() !== "") {
        return String(preferredValue);
      }
      for (const fallback of fallbackValues) {
        if (fallback != null && String(fallback).trim() !== "") {
          return String(fallback);
        }
      }
      return "";
    },
    [],
  );
  const isSamePersonAndCustomerAmka =
    String(data.customer_amka ?? "").trim() !== "" &&
    String(data.customer_amka ?? "").trim() ===
      String(selectedPerson?.personAMKA ?? "").trim();

  /** Lookup-selected recipient may match customer AMKA but still needs ΑΦΜ on this step. */
  const showAfmField =
    !isSamePersonAndCustomerAmka || data.recipient_from_erp_lookup == 1;

  const initialValues = React.useMemo(
    () => ({
      amka: pickPersonString(
        selectedPerson?.personAMKA,
        data.recipient_amka,
        data.customer_amka,
      ),
      afm: pickPersonString(
        selectedPerson?.personVatNumber,
        data.recipient_afm,
        data.customer_afm,
      ),
      passport: pickPersonString(
        selectedPerson?.personIDCode,
        selectedPerson?.personPassport,
        data.recipient_passport,
        data.customer_passport,
      ),
      // Κινητό: prefill from addresses when API returns it (same source as personIDCode); until then empty.
      mobile: "",
    }),
    [
      data.customer_afm,
      data.customer_amka,
      data.customer_passport,
      data.recipient_afm,
      data.recipient_amka,
      data.recipient_passport,
      pickPersonString,
      selectedPerson?.personAMKA,
      selectedPerson?.personIDCode,
      selectedPerson?.personPassport,
      selectedPerson?.personVatNumber,
    ],
  );

  /** After Αποθήκευση, overrides live on the draft order; remount must rehydrate from those, not only CRM/person defaults. */
  const seedValues = React.useMemo(() => {
    if (data.shouldUpdateRecipientInfos != 1) return initialValues;
    const afmFromDraft =
      data.updateRecipient_afm != null &&
      String(data.updateRecipient_afm).trim() !== ""
        ? String(data.updateRecipient_afm)
        : initialValues.afm;
    const passportFromDraft =
      data.updateRecipient_passport !== undefined &&
      data.updateRecipient_passport !== null
        ? String(data.updateRecipient_passport)
        : initialValues.passport;
    const mobileFromDraft =
      data.updateRecipient_mobile != null &&
      String(data.updateRecipient_mobile).trim() !== ""
        ? String(data.updateRecipient_mobile)
        : "";
    return {
      amka: initialValues.amka,
      afm: afmFromDraft,
      passport: passportFromDraft,
      mobile: mobileFromDraft,
    };
  }, [
    data.shouldUpdateRecipientInfos,
    data.updateRecipient_afm,
    data.updateRecipient_passport,
    data.updateRecipient_mobile,
    initialValues,
  ]);
  const [afmValue, setAfmValue] = React.useState("");
  const [passportValue, setPassportValue] = React.useState("");
  const [mobileValue, setMobileValue] = React.useState("");
  const [savedValues, setSavedValues] = React.useState({
    afm: "",
    passport: "",
    mobile: "",
  });
  const [isSaveFeedbackActive, setIsSaveFeedbackActive] = React.useState(false);

  React.useEffect(() => {
    dispatch(setDraftProperty({ key: "updateRecipient_amka", value: null }));
  }, [dispatch, initialValues.amka]);

  React.useEffect(() => {
    setAfmValue(seedValues.afm);
    setPassportValue(seedValues.passport);
    setMobileValue(seedValues.mobile);
    setSavedValues({
      afm: seedValues.afm,
      passport: seedValues.passport,
      mobile: seedValues.mobile,
    });
  }, [seedValues.afm, seedValues.mobile, seedValues.passport]);

  React.useEffect(() => {
    if (data.shouldUpdateRecipientInfos == 1) return;
    dispatch(setDraftProperty({ key: "shouldUpdateRecipientInfos", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_afm", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_passport", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_mobile", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_address", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_tk", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_amka", value: null }));
  }, [data.shouldUpdateRecipientInfos, dispatch]);

  const isDirty =
    (showAfmField && afmValue !== savedValues.afm) ||
    passportValue !== savedValues.passport ||
    mobileValue !== savedValues.mobile;

  const handleSave = () => {
    dispatch(setDraftProperty({ key: "shouldUpdateRecipientInfos", value: 1 }));
    dispatch(
      setDraftProperty({
        key: "updateRecipient_afm",
        value: showAfmField ? afmValue : null,
      }),
    );
    dispatch(
      setDraftProperty({
        key: "updateRecipient_passport",
        value: passportValue,
      }),
    );
    dispatch(
      setDraftProperty({
        key: "updateRecipient_mobile",
        value: mobileValue.trim() === "" ? null : mobileValue,
      }),
    );
    dispatch(setDraftProperty({ key: "updateRecipient_address", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_tk", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_amka", value: null }));
    setSavedValues({
      afm: afmValue,
      passport: passportValue,
      mobile: mobileValue,
    });
    setIsSaveFeedbackActive(true);
  };

  React.useEffect(() => {
    if (!isSaveFeedbackActive) return;
    const timer = window.setTimeout(() => {
      setIsSaveFeedbackActive(false);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [isSaveFeedbackActive]);

  return (
    <div className="app-card p-4">
      <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
        <div className="fw-semibold">
          Επικαιροποίηση στοιχείων παραλήπτη
          {selectedPerson?.personName
            ? ` - ${selectedPerson.personName}`
            : String(data.recipient_name ?? "").trim() !== ""
              ? ` - ${String(data.recipient_name).trim()}`
              : ""}
        </div>
      </div>

      {!showAfmField ? (
        <>
          <div className="row g-2">
            <div className="col-12">
              <OrderField label="ΑΜΚΑ">
                <input
                  className="form-control"
                  name="updateRecipient_amka"
                  inputMode="numeric"
                  disabled
                  value={initialValues.amka}
                  readOnly
                />
              </OrderField>
            </div>
          </div>
          <div className="row g-2">
            <div className="col-6">
              <OrderField label="ΑΤ/Διαβατήριο">
                <input
                  className="form-control"
                  name="updateRecipient_passport"
                  value={passportValue}
                  onChange={(e) => setPassportValue(e.target.value)}
                />
              </OrderField>
            </div>
            <div className="col-6">
              <OrderField label="Κινητό">
                <input
                  className="form-control"
                  name="updateRecipient_mobile"
                  inputMode="tel"
                  value={mobileValue}
                  onChange={(e) => setMobileValue(e.target.value)}
                />
              </OrderField>
            </div>
          </div>
        </>
      ) : (
        <div className="row g-2">
          <div className="col-6">
            <OrderField label="ΑΜΚΑ">
              <input
                className="form-control"
                name="updateRecipient_amka"
                inputMode="numeric"
                disabled
                value={initialValues.amka}
                readOnly
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="ΑΦΜ">
              <input
                className="form-control"
                name="updateRecipient_afm"
                inputMode="numeric"
                value={afmValue}
                onChange={(e) => setAfmValue(e.target.value)}
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="ΑΤ/Διαβατήριο">
              <input
                className="form-control"
                name="updateRecipient_passport"
                value={passportValue}
                onChange={(e) => setPassportValue(e.target.value)}
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="Κινητό">
              <input
                className="form-control"
                name="updateRecipient_mobile"
                inputMode="tel"
                value={mobileValue}
                onChange={(e) => setMobileValue(e.target.value)}
              />
            </OrderField>
          </div>
        </div>
      )}
      <div className="d-flex justify-content-end mt-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!isDirty || isSaveFeedbackActive}
        >
          {isSaveFeedbackActive ? "Αποθηκεύτηκε" : "Αποθήκευση"}
        </button>
      </div>
    </div>
  );
}
