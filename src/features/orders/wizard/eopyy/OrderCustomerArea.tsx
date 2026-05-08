import {
  loadCustomerAddressesAsync,
  setDraftProperty,
} from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CustomerLookupModal from "../modals/CustomerLookupModal";
import ErpContactsLookupModal from "../modals/ErpContactsLookupModal";
import React from "react";
import { FormSelect } from "react-bootstrap";
import FormErrorsContext from "@/components/ui/FormErrorContect";
import OrderField from "@/components/ui/OrderField";
import OtpInput from "@/components/ui/OTPInput";

type Props = {
  errors?: Record<string, string | boolean>;
  clearError?: (field: string) => void;
};

export default function OrderCustomerArea({ errors, clearError }: Props) {
  const data = useAppSelector((s) => s.orders.draft.order);
  const dispatch = useAppDispatch();
  const [showLookup, setShowLookup] = React.useState(false);
  const [showErpContactsLookup, setShowErpContactsLookup] =
    React.useState(false);
  const listTropoiApostolis = useAppSelector(
    (s) => s.orders.draft.list_TroposApostolis,
  );
  const listReceiptientReasons = useAppSelector(
    (s) => s.orders.draft.list_LogosParalipti,
  );
  const listRelationIDs = useAppSelector(
    (s) => s.orders.draft.list_SygeniaParalipti,
  );
  const listAddressesPersons = useAppSelector(
    (s) => s.orders.draft.list_AddressesPersons,
  );
  const preselected_person_GID = useAppSelector(
    (s) => s.orders.draft.preselected_person_GID,
  );
  const preselected_address_GID = useAppSelector(
    (s) => s.orders.draft.preselected_address_GID,
  );

  const selectedPerson = React.useMemo(
    () =>
      listAddressesPersons.find((p) => p.person_ErpGID == data.person_ErpGID) ??
      null,
    [listAddressesPersons, data.person_ErpGID],
  );
  const selectedPersonAddresses = React.useMemo(() => {
    return selectedPerson?.addresses ?? [];
  }, [selectedPerson]);
  const selectedAddress = React.useMemo(() => {
    if (!selectedPersonAddresses.length) return null;
    return (
      selectedPersonAddresses.find(
        (a) => a.address_ErpGID == data.address_ErpGID,
      ) ?? selectedPersonAddresses[0]
    );
  }, [selectedPersonAddresses, data.address_ErpGID]);

  React.useEffect(() => {
    if (!selectedAddress) return;
    const addressObj = selectedAddress as Record<string, any>;
    const pickString = (...keys: string[]) => {
      for (const key of keys) {
        const raw = addressObj[key];
        if (raw != null && String(raw).trim() !== "") return String(raw);
      }
      return "";
    };
    const pickPersonString = (
      preferredValue?: string | null,
      ...fallbackKeys: string[]
    ) => {
      if (preferredValue != null && String(preferredValue).trim() !== "") {
        return String(preferredValue);
      }
      for (const key of fallbackKeys) {
        const raw = addressObj[key];
        if (raw != null && String(raw).trim() !== "") return String(raw);
      }
      return "";
    };

    dispatch(
      setDraftProperty({
        key: "updateRecipient_amka",
        value: pickPersonString(
          selectedPerson?.personAMKA,
          "recipient_amka",
          "amka",
          "customer_amka",
        ),
      }),
    );
    dispatch(
      setDraftProperty({
        key: "updateRecipient_afm",
        value: pickPersonString(
          selectedPerson?.personVatNumber,
          "recipient_afm",
          "afm",
          "customer_afm",
        ),
      }),
    );
    dispatch(
      setDraftProperty({
        key: "updateRecipient_passport",
        value: pickPersonString(
          selectedPerson?.personPassport,
          "recipient_passport",
          "passport",
          "customer_passport",
        ),
      }),
    );
    dispatch(
      setDraftProperty({
        key: "updateRecipient_address",
        value: pickString("recipient_address", "address"),
      }),
    );
    dispatch(
      setDraftProperty({
        key: "updateRecipient_tk",
        value: pickString("recipient_tk", "tk"),
      }),
    );
    dispatch(
      setDraftProperty({
        key: "updateRecipient_mobile",
        value: pickPersonString(
          selectedPerson?.personMobile,
          "recipient_mobile",
          "mobile",
          "customer_mobile",
        ),
      }),
    );
  }, [selectedAddress, selectedPerson, dispatch]);

  const handleDateInput = (value: string) => {
    if (value.length == 1 && parseInt(value) > 3) return;
    if (value.length == 2 && parseInt(value) > 31) return;

    if (value.length == 5 && parseInt(value.substring(3, 5)) > 12) return;

    if (value.length === 2 || value.length === 5) {
      if (data.customer_dob && data.customer_dob.length < value.length) {
        value += "/";
      }
    }

    if (value.length === 4) {
      if (
        data.customer_dob &&
        data.customer_dob.length < value.length &&
        parseInt(value.substring(3, 4)) > 1
      ) {
        value = value.substring(0, 2) + "/0" + value.substring(3, 4) + "/";
      }
    }
    dispatch(setDraftProperty({ key: "customer_dob", value: value }));
  };

  const handleSearchClick = () => {
    // open search modal / navigate to search page
    setShowLookup(true);
  };

  React.useEffect(() => {
    if (!data.shipMethodId)
      dispatch(setDraftProperty({ key: "shipMethodId", value: 5 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** After refresh: if address list is empty but draft has customer from localStorage, load addresses for «Θα παραδοθεί σε». */
  React.useEffect(() => {
    const gid = data.customer_ErpGID?.toString().trim();
    const amka = data.customer_amka?.trim();
    if (!gid || !amka || listAddressesPersons.length > 0) return;
    void dispatch(
      loadCustomerAddressesAsync({
        customer_ErpGID: data.customer_ErpGID,
        customer_amka: data.customer_amka ?? "",
        customer_name: data.customer_name ?? "",
        customer_address: data.customer_address ?? "",
      }),
    );
  }, [
    dispatch,
    data.customer_ErpGID,
    data.customer_amka,
    data.customer_name,
    data.customer_address,
    listAddressesPersons.length,
  ]);
  return (
    <div className="app-card p-4">
      <FormErrorsContext.Provider value={{ errors: errors ?? {}, clearError }}>
        <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
          <div className="d-flex justify-content-start align-items-center flex-row gap-2">
            <div className="fw-semibold">OTP</div>
            <OrderField>
              <OtpInput
                name="customer_tel_otp"
                length={6}
                value={data.customer_tel_otp ?? ""}
                onChange={(otp) =>
                  dispatch(
                    setDraftProperty({ key: "customer_tel_otp", value: otp }),
                  )
                }
              />
            </OrderField>
          </div>

          <button
            type="button"
            className="btn-icon-pill"
            aria-label="Αναζήτηση"
            onClick={handleSearchClick}
          >
            <i className="bi bi-search" />
          </button>
        </div>

        <CustomerLookupModal
          show={showLookup}
          onClose={() => setShowLookup(false)}
          initialQuery={data.customer_amka ?? data.customer_name ?? ""}
        />

        <OrderField label={`Ονοματεπώνυμο`}>
          <input
            className="form-control"
            name="customer_name"
            value={data.customer_name ?? ""}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "customer_name",
                  value: e.target.value,
                }),
              )
            }
          />
          <span></span>
        </OrderField>

        <div className="row g-2">
          <div className="col-6">
            <OrderField label="ΑΜΚΑ">
              <input
                className="form-control"
                name="customer_amka"
                inputMode="numeric"
                value={data.customer_amka ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_amka",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="Ημ/νία Γέννησης" hint="π.χ. 31/12/1990">
              <input
                className="form-control"
                name="customer_dob"
                inputMode="numeric"
                value={data.customer_dob ?? ""}
                onChange={(e) => handleDateInput(e.target.value)}
              />
            </OrderField>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <OrderField label="Κινητό">
              <input
                className="form-control"
                name="customer_mobile"
                inputMode="tel"
                value={data.customer_mobile ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_mobile",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="Κινητό 2">
              <input
                className="form-control"
                name="customer_mobile2"
                inputMode="tel"
                value={data.customer_mobile2 ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_mobile2",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>
        </div>
        <div className="row g-2">
          <div className="col-6">
            <OrderField label="Τηλέφωνο">
              <input
                className="form-control"
                name="customer_tel"
                inputMode="tel"
                value={data.customer_tel ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_tel",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="Email">
              <input
                className="form-control"
                name="customer_email"
                inputMode="email"
                value={data.customer_email ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_email",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>
        </div>

        <OrderField label="Διεύθυνση">
          <input
            className="form-control"
            name="customer_address"
            value={data.customer_address ?? ""}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "customer_address",
                  value: e.target.value,
                }),
              )
            }
          />
        </OrderField>

        <div className="row g-2">
          <div className="col-6">
            <OrderField label="Πόλη">
              <input
                className="form-control"
                name="customer_city"
                value={data.customer_city ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_city",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="ΤΚ">
              <input
                className="form-control"
                name="customer_tk"
                inputMode="numeric"
                value={data.customer_tk ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_tk",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>
        </div>

        <OrderField label="Σχόλια">
          <textarea
            className="form-control"
            name="customer_notes"
            rows={6}
            value={data.customer_notes ?? ""}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "customer_notes",
                  value: e.target.value,
                }),
              )
            }
          />
        </OrderField>

        <hr className="app-divider my-2" />

        <OrderField label="Αποστολή">
          <FormSelect
            name="shipMethodId"
            value={data.shipMethodId ?? ""}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "shipMethodId",
                  value: e.target.value,
                }),
              )
            }
          >
            {listTropoiApostolis.map((x) => (
              <option key={x.value} value={x.value}>
                {x.text}
              </option>
            ))}
          </FormSelect>
        </OrderField>

        <div className="form-check form-switch switch-lg mb-2">
          <input
            className="form-check-input"
            name="deliverySunday"
            type="checkbox"
            checked={data.deliverySunday == 1}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "deliverySunday",
                  value: e.target.checked ? 1 : 0,
                }),
              )
            }
            id="deliverySunday"
          />
          <label className="form-check-label" htmlFor="deliverySunday">
            Παράδοση Σάββατο
          </label>
        </div>

        <div className="form-check form-switch switch-lg mb-2">
          <input
            className="form-check-input"
            name="deliveryMorning"
            type="checkbox"
            checked={data.deliveryMorning == 1}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "deliveryMorning",
                  value: e.target.checked ? 1 : 0,
                }),
              )
            }
            id="deliveryMorning"
          />
          <label className="form-check-label" htmlFor="deliveryMorning">
            Πρωινή παράδοση
          </label>
        </div>

        {data.shipTo_other_address != 1 && (
          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              name="has_other_recipient"
              type="checkbox"
              checked={data.has_other_recipient == 1}
              onChange={(e) => {
                const val = e.target.checked ? 1 : 0;
                dispatch(
                  setDraftProperty({ key: "has_other_recipient", value: val }),
                );
                if (val === 1) {
                  dispatch(
                    setDraftProperty({ key: "person_ErpGID", value: null }),
                  );
                  dispatch(
                    setDraftProperty({ key: "address_ErpGID", value: null }),
                  );
                  dispatch(
                    setDraftProperty({ key: "shipTo_other_address", value: 0 }),
                  );
                  dispatch(
                    setDraftProperty({
                      key: "shipToOtherAddressBool",
                      value: false,
                    }),
                  );
                } else {
                  dispatch(
                    setDraftProperty({
                      key: "person_ErpGID",
                      value: preselected_person_GID,
                    }),
                  );
                  dispatch(
                    setDraftProperty({
                      key: "address_ErpGID",
                      value: preselected_address_GID,
                    }),
                  );
                }
              }}
              id="has_other_recipient"
            />
            <label className="form-check-label" htmlFor="has_other_recipient">
              Παραλαβή από νέο πρόσωπο
            </label>
          </div>
        )}

        {data.has_other_recipient == 1 && (
          <>
            <div className="d-flex align-items-center justify-content-between pb-2">
              <div className="fw-semibold">Αναζήτηση σε πελατολόγιο</div>
              <button
                type="button"
                className="btn-icon-pill"
                aria-label="Αναζήτηση σε πελατολόγιο"
                onClick={() => setShowErpContactsLookup(true)}
              >
                <i className="bi bi-search" />
              </button>
            </div>

            <ErpContactsLookupModal
              show={showErpContactsLookup}
              onClose={() => setShowErpContactsLookup(false)}
              initialQuery={data.recipient_name ?? data.recipient_amka ?? ""}
              person_GID={
                preselected_person_GID ??
                data.customer_ErpGID ??
                listAddressesPersons?.[0]?.person_ErpGID ??
                ""
              }
              address_GID={
                preselected_address_GID ??
                data.address_ErpGID ??
                listAddressesPersons?.[0]?.addresses?.[0]?.address_ErpGID ??
                ""
              }
            />
          </>
        )}

        {data.has_other_recipient != 1 && listAddressesPersons.length > 0 && (
          <OrderField label="Θα παραδοθεί σε">
            <FormSelect
              name="person_ErpGID"
              value={data.person_ErpGID ?? ""}
              onChange={(e) => {
                dispatch(
                  setDraftProperty({
                    key: "person_ErpGID",
                    value: e.target.value,
                  }),
                );
                if (data.shipTo_other_address != 1) {
                  dispatch(
                    setDraftProperty({
                      key: "address_ErpGID",
                      value:
                        listAddressesPersons.find(
                          (p) => p.person_ErpGID == e.target.value,
                        )?.addresses?.[0]?.address_ErpGID ?? null,
                    }),
                  );
                }
              }}
            >
              {listAddressesPersons.map((x) => (
                <option key={x.person_ErpGID} value={x.person_ErpGID}>
                  {x.personName}
                </option>
              ))}
            </FormSelect>
          </OrderField>
        )}

        {!data.shipToOtherAddressBool &&
          data.shipTo_other_address != 1 &&
          listAddressesPersons.length > 0 &&
          data.person_ErpGID &&
          data.person_ErpGID != "" &&
          selectedPersonAddresses.length > 0 && (
            <>
              <OrderField label="Αποθηκευμένη διέυθυνση">
                <FormSelect
                  name="address_ErpGID"
                  value={data.address_ErpGID ?? ""}
                  onChange={(e) =>
                    dispatch(
                      setDraftProperty({
                        key: "address_ErpGID",
                        value: e.target.value,
                      }),
                    )
                  }
                >
                  {selectedPersonAddresses.map((a) => (
                    <option
                      key={a.address_ErpGID}
                      value={a.address_ErpGID}
                    >{`${a.address}, ${a.city}, ${a.tk}`}</option>
                  ))}
                </FormSelect>
              </OrderField>
              <div className="form-check form-switch switch-lg mb-2">
                <input
                  className="form-check-input"
                  name="shouldUpdateRecipientInfos"
                  type="checkbox"
                  checked={data.shouldUpdateRecipientInfos == 1}
                  onChange={(e) =>
                    dispatch(
                      setDraftProperty({
                        key: "shouldUpdateRecipientInfos",
                        value: e.target.checked ? 1 : 0,
                      }),
                    )
                  }
                  id="shouldUpdateRecipientInfos"
                />
                <label
                  className="form-check-label"
                  htmlFor="shouldUpdateRecipientInfos"
                >
                  Επικαιροποίηση στοιχείων
                </label>
              </div>
              {data.shouldUpdateRecipientInfos == 1 && (
                <>
                  <div className="row g-2">
                    <div className="col-6">
                      <OrderField label="ΑΜΚΑ">
                        <input
                          className="form-control"
                          name="updateRecipient_amka"
                          inputMode="numeric"
                          value={data.updateRecipient_amka ?? ""}
                          onChange={(e) =>
                            dispatch(
                              setDraftProperty({
                                key: "updateRecipient_amka",
                                value: e.target.value,
                              }),
                            )
                          }
                        />
                      </OrderField>
                    </div>
                    <div className="col-6">
                      <OrderField label="ΑΦΜ">
                        <input
                          className="form-control"
                          name="updateRecipient_afm"
                          inputMode="numeric"
                          value={data.updateRecipient_afm ?? ""}
                          onChange={(e) =>
                            dispatch(
                              setDraftProperty({
                                key: "updateRecipient_afm",
                                value: e.target.value,
                              }),
                            )
                          }
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
                          value={data.updateRecipient_passport ?? ""}
                          onChange={(e) =>
                            dispatch(
                              setDraftProperty({
                                key: "updateRecipient_passport",
                                value: e.target.value,
                              }),
                            )
                          }
                        />
                      </OrderField>
                    </div>
                    <div className="col-6">
                      <OrderField label="Κινητό">
                        <input
                          className="form-control"
                          name="updateRecipient_mobile"
                          inputMode="tel"
                          value={data.updateRecipient_mobile ?? ""}
                          onChange={(e) =>
                            dispatch(
                              setDraftProperty({
                                key: "updateRecipient_mobile",
                                value: e.target.value,
                              }),
                            )
                          }
                        />
                      </OrderField>
                    </div>
                  </div>
                  <OrderField label="Διεύθυνση">
                    <input
                      className="form-control"
                      name="updateRecipient_address"
                      value={data.updateRecipient_address ?? ""}
                      onChange={(e) =>
                        dispatch(
                          setDraftProperty({
                            key: "updateRecipient_address",
                            value: e.target.value,
                          }),
                        )
                      }
                    />
                  </OrderField>
                  <OrderField label="ΤΚ">
                    <input
                      className="form-control"
                      name="updateRecipient_tk"
                      inputMode="numeric"
                      value={data.updateRecipient_tk ?? ""}
                      onChange={(e) =>
                        dispatch(
                          setDraftProperty({
                            key: "updateRecipient_tk",
                            value: e.target.value,
                          }),
                        )
                      }
                    />
                  </OrderField>
                </>
              )}
            </>
          )}

        {data.has_other_recipient == 1 && (
          <>
            <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
              <div className="fw-semibold">Στοιχεία Παραλήπτη</div>
            </div>

            <OrderField label="Αιτία παραλαβής">
              <FormSelect
                name="recipient_reason_id"
                value={data.recipient_reason_id ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "recipient_reason_id",
                      value: e.target.value,
                    }),
                  )
                }
              >
                <option value=""></option>
                {listReceiptientReasons.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.text}
                  </option>
                ))}
              </FormSelect>
            </OrderField>
            <OrderField label="Σχέση">
              <FormSelect
                name="recipient_relation_id"
                value={data.recipient_relation_id ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "recipient_relation_id",
                      value: e.target.value,
                    }),
                  )
                }
              >
                <option value=""></option>
                {listRelationIDs.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.text}
                  </option>
                ))}
              </FormSelect>
            </OrderField>
            <OrderField label="Ονοματεπώνυμο ">
              <input
                className="form-control"
                name="recipient_name"
                value={data.recipient_name ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "recipient_name",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
            <div className="row g-2">
              <div className="col-6">
                <OrderField label="ΑΜΚΑ ">
                  <input
                    className="form-control"
                    name="recipient_amka"
                    type="numeric"
                    value={data.recipient_amka ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "recipient_amka",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
              </div>
              <div className="col-6">
                <OrderField label="ΑΦΜ ">
                  <input
                    className="form-control"
                    name="recipient_afm"
                    type="numeric"
                    value={data.recipient_afm ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "recipient_afm",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
              </div>
            </div>
            <div className="row g-2">
              <div className="col-6">
                <OrderField label="Κινητό">
                  <input
                    className="form-control"
                    name="recipient_mobile"
                    inputMode="tel"
                    value={data.recipient_mobile ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "recipient_mobile",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
              </div>
              <div className="col-6">
                <OrderField label="Κινητό 2">
                  <input
                    className="form-control"
                    name="recipient_mobile2"
                    inputMode="tel"
                    value={data.recipient_mobile2 ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "recipient_mobile2",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
              </div>
            </div>
            <div className="row g-2">
              <div className="col-6">
                <OrderField label="Τηλέφωνο">
                  <input
                    className="form-control"
                    inputMode="tel"
                    name="recipient_tel"
                    value={data.recipient_tel ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "recipient_tel",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
              </div>
              <div className="col-6">
                <OrderField label="ΑΤ/Διαβατήριο">
                  <input
                    className="form-control"
                    type="numeric"
                    name="recipient_passport"
                    value={data.recipient_passport ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "recipient_passport",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
              </div>
            </div>
            <OrderField label="Διεύθυνση">
              <input
                className="form-control"
                name="recipient_address"
                value={data.recipient_address ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "recipient_address",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
            <div className="row g-2">
              <div className="col-6">
                <OrderField label="Πόλη ">
                  <input
                    className="form-control"
                    name="recipient_city"
                    value={data.recipient_city ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "recipient_city",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
              </div>
              <div className="col-6">
                <OrderField label="ΤΚ">
                  <input
                    className="form-control"
                    name="recipient_tk"
                    inputMode="numeric"
                    value={data.recipient_tk ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "recipient_tk",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
              </div>
            </div>
            <OrderField label="Σχόλια">
              <textarea
                className="form-control"
                name="recipient_Notes"
                rows={6}
                value={data.recipient_Notes ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "recipient_Notes",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </>
        )}

        {data.has_other_recipient != 1 && (
          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              name="shipTo_other_address"
              type="checkbox"
              checked={data.shipTo_other_address == 1}
              onChange={(e) => {
                const checked = e.target.checked;
                dispatch(
                  setDraftProperty({
                    key: "shipTo_other_address",
                    value: checked ? 1 : 0,
                  }),
                );
                dispatch(
                  setDraftProperty({
                    key: "shipToOtherAddressBool",
                    value: checked,
                  }),
                );
                if (checked) {
                  dispatch(
                    setDraftProperty({ key: "address_ErpGID", value: null }),
                  );
                  dispatch(
                    setDraftProperty({ key: "has_other_recipient", value: 0 }),
                  );
                  dispatch(
                    setDraftProperty({
                      key: "person_ErpGID",
                      value: preselected_person_GID,
                    }),
                  );
                } else if (data.person_ErpGID && data.person_ErpGID != "") {
                  dispatch(
                    setDraftProperty({
                      key: "address_ErpGID",
                      value:
                        listAddressesPersons.find(
                          (x) => x.person_ErpGID == data.person_ErpGID,
                        )?.addresses?.[0]?.address_ErpGID ?? null,
                    }),
                  );
                }
              }}
              id="shipTo_other_address"
            />
            <label className="form-check-label" htmlFor="shipTo_other_address">
              Παράδοση σε νέα διεύθυνση
            </label>
          </div>
        )}

        {data.shipTo_other_address == 1 && (
          <>
            <div className="mt-3">
              <OrderField label="Διεύθυνση παράδοσης">
                <input
                  className="form-control"
                  name="customer_other_address"
                  value={data.customer_other_address ?? ""}
                  onChange={(e) =>
                    dispatch(
                      setDraftProperty({
                        key: "customer_other_address",
                        value: e.target.value,
                      }),
                    )
                  }
                />
              </OrderField>
            </div>
            <div className="row g-2">
              <div className="col-6">
                <OrderField label="Πόλη ">
                  <input
                    className="form-control"
                    name="customer_other_city"
                    value={data.customer_other_city ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "customer_other_city",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
              </div>
              <div className="col-6">
                <OrderField label="ΤΚ">
                  <input
                    className="form-control"
                    name="customer_other_tk"
                    inputMode="numeric"
                    value={data.customer_other_tk ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "customer_other_tk",
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
      </FormErrorsContext.Provider>
    </div>
  );
}
