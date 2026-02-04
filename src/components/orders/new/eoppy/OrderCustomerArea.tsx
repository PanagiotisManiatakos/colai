import { setDraftProperty } from "@/features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CustomerLookupModal from "../CustomerLookupModal";
import React from "react";
import { FormSelect } from "react-bootstrap";

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

export default function OrderCustomerArea() {
    const data = useAppSelector((s) => s.orders.draft.order);
    const dispatch = useAppDispatch()
    const [showLookup, setShowLookup] = React.useState(false);
    const listTropoiApostolis = useAppSelector(s => s.orders.draft.list_TroposApostolis)
    const listReceiptientReasons = useAppSelector(s => s.orders.draft.list_LogosParalipti)
    const listRelationIDs = useAppSelector(s => s.orders.draft.list_SygeniaParalipti)
    const listAddressesPersons = useAppSelector(s => s.orders.draft.list_AddressesPersons)
    const preselected_person_GID = useAppSelector(s => s.orders.draft.preselected_person_GID)
    const preselected_address_GID = useAppSelector(s => s.orders.draft.preselected_address_GID)

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
            if (data.customer_dob && data.customer_dob.length < value.length && parseInt(value.substring(3, 4)) > 1) {
                value = value.substring(0, 2) + "/0" + value.substring(3, 4) + "/";
            }
        }
        dispatch(setDraftProperty({ key: "customer_dob", value: value }));
    }

    const handleSearchClick = () => {
        // open search modal / navigate to search page
        setShowLookup(true);
    }

    React.useEffect(() => {
        if (!data.shipMethodId) dispatch(setDraftProperty({ key: "shipMethodId", value: 5 }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="app-card p-4">
            <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                <div className="fw-semibold">Στοιχεία ασθενή</div>

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

            <Field label="Ονοματεπώνυμο">
                <input
                    className="form-control"
                    name="customer_name"
                    value={data.customer_name ?? ""}
                    onChange={(e) => dispatch(setDraftProperty({ key: "customer_name", value: e.target.value }))}
                />
            </Field>

            <div className="row g-2">
                <div className="col-7">
                    <Field label="ΑΜΚΑ">
                        <input
                            className="form-control"
                            name="customer_amka"
                            inputMode="numeric"
                            value={data.customer_amka ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "customer_amka", value: e.target.value }))}
                        />
                    </Field>
                </div>
                <div className="col-5">
                    <Field label="Ημ/νία Γέννησης" hint="π.χ. 31/12/1990">
                        <input
                            className="form-control"
                            name="customer_dob"
                            inputMode="numeric"
                            value={data.customer_dob ?? ""}
                            onChange={(e) => handleDateInput(e.target.value)}
                        />
                    </Field>
                </div>
            </div>

            <div className="row g-2">
                <div className="col-7">
                    <Field label="Τηλέφωνο">
                        <input
                            className="form-control"
                            name="customer_tel"
                            inputMode="tel"
                            value={data.customer_tel ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "customer_tel", value: e.target.value }))}
                        />
                    </Field>
                </div>
                <div className="col-5">
                    <Field label="Email">
                        <input
                            className="form-control"
                            name="customer_email"
                            inputMode="email"
                            value={data.customer_email ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "customer_email", value: e.target.value }))}
                        />
                    </Field>
                </div>
            </div>

            <Field label="Διεύθυνση">
                <input
                    className="form-control"
                    name="customer_address"
                    value={data.customer_address ?? ""}
                    onChange={(e) => dispatch(setDraftProperty({ key: "customer_address", value: e.target.value }))}
                />
            </Field>

            <div className="row g-2">
                <div className="col-8">
                    <Field label="Πόλη">
                        <input
                            className="form-control"
                            name="customer_city"
                            value={data.customer_city ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "customer_city", value: e.target.value }))}
                        />
                    </Field>
                </div>
                <div className="col-4">
                    <Field label="ΤΚ">
                        <input
                            className="form-control"
                            name="customer_tk"
                            inputMode="numeric"
                            value={data.customer_tk ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "customer_tk", value: e.target.value }))}
                        />
                    </Field>
                </div>
            </div>

            <div className="app-divider my-2" />

            <Field label="Αποστολή">
                <FormSelect name="shipMethodId" value={data.shipMethodId ?? ""} onChange={(e) => dispatch(setDraftProperty({ key: "shipMethodId", value: e.target.value }))}>
                    {listTropoiApostolis.map((x) => <option key={x.value} value={x.value}>{x.text}</option>)}
                </FormSelect>
            </Field>

            <div className="form-check form-switch mb-2">
                <input
                    className="form-check-input"
                    name="deliverySunday"
                    type="checkbox"
                    checked={data.deliverySunday == 1}
                    onChange={(e) => dispatch(setDraftProperty({ key: "deliverySunday", value: e.target.checked ? 1 : 0 }))}
                    id="deliverySunday"
                />
                <label className="form-check-label" htmlFor="deliverySunday">
                    Παράδοση Σάββατο
                </label>
            </div>

            <div className="form-check form-switch mb-2">
                <input
                    className="form-check-input"
                    name="deliveryMorning"
                    type="checkbox"
                    checked={data.deliveryMorning == 1}
                    onChange={(e) => dispatch(setDraftProperty({ key: "deliveryMorning", value: e.target.checked ? 1 : 0 }))}
                    id="deliveryMorning"
                />
                <label className="form-check-label" htmlFor="deliveryMorning">
                    Πρωινή Παράδοση
                </label>
            </div>

            {!data.shipToOtherAddressBool && listAddressesPersons.length > 0 && (
                <Field label="Θα παραδοθεί σε">
                    <FormSelect name="person_ErpGID" value={data.person_ErpGID ?? ""} onChange={(e) => {
                        dispatch(setDraftProperty({ key: "person_ErpGID", value: e.target.value }))
                        if (data.shipTo_other_address != 1) {
                            dispatch(setDraftProperty({ key: "address_ErpGID", value: listAddressesPersons.find(p => p.person_ErpGID == e.target.value)?.addresses?.[0]?.address_ErpGID ?? null }))
                        }
                    }
                    }>
                        {listAddressesPersons.map((x) => <option key={x.person_ErpGID} value={x.person_ErpGID}>{x.personName}</option>)}
                    </FormSelect>
                </Field>)}

            {!data.shipToOtherAddressBool &&
                data.shipTo_other_address != 1 &&
                listAddressesPersons.length > 0 &&
                data.person_ErpGID &&
                data.person_ErpGID != "" &&
                listAddressesPersons.some((x) => x.person_ErpGID == data.person_ErpGID && (x.addresses.length > 0)) &&
                (
                    <Field label="Αποθηκευμένη διέυθυνση">
                        <FormSelect name="address_ErpGID" value={data.address_ErpGID ?? ""} onChange={(e) => dispatch(setDraftProperty({ key: "address_ErpGID", value: e.target.value }))}>
                            {listAddressesPersons.map((x) => {
                                if (x.person_ErpGID == data.person_ErpGID) {
                                    return x.addresses.map((a) => <option key={a.address_ErpGID} value={a.address_ErpGID}>{`${a.address}, ${a.city}, ${a.tk}`}</option>)
                                }
                            })}
                        </FormSelect>
                    </Field>
                )}


            <div className="form-check form-switch mb-2">
                <input
                    className="form-check-input"
                    name="hasOtherRecipientBool"
                    type="checkbox"
                    checked={data.hasOtherRecipientBool}
                    onChange={(e) => {
                        dispatch(setDraftProperty({ key: "hasOtherRecipientBool", value: e.target.checked }))
                        dispatch(setDraftProperty({ key: "person_ErpGID", value: e.target.checked ? null : preselected_person_GID }))
                        dispatch(setDraftProperty({ key: "address_ErpGID", value: e.target.checked ? null : preselected_address_GID }))
                    }
                    }
                    id="hasOtherRecipientBool"
                />
                <label className="form-check-label" htmlFor="hasOtherRecipientBool">
                    Θα παραλάβει άλλος
                </label>
            </div>

            {data.hasOtherRecipientBool &&
                <>
                    <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                        <div className="fw-semibold">Στοιχεία Παραλήπτη</div>
                    </div>

                    <Field label="Αιτία παραλαβής">
                        <FormSelect name="recipient_reason_id" value={data.recipient_reason_id ?? ""} onChange={e => dispatch(setDraftProperty({ key: "recipient_reason_id", value: e.target.value }))}>
                            <option value=""></option>
                            {listReceiptientReasons.map((x) => <option key={x.value} value={x.value}>{x.text}</option>)}
                        </FormSelect>
                    </Field>
                    <Field label="Σχέση">
                        <FormSelect name="recipient_relation_id" value={data.recipient_relation_id ?? ""} onChange={e => dispatch(setDraftProperty({ key: "recipient_relation_id", value: e.target.value }))}>
                            <option value=""></option>
                            {listRelationIDs.map((x) => <option key={x.value} value={x.value}>{x.text}</option>)}
                        </FormSelect>
                    </Field>
                    <Field label="Ονοματεπώνυμο ">
                        <input
                            className="form-control"
                            name="recipient_name"
                            value={data.recipient_name ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "recipient_name", value: e.target.value }))}
                        />
                    </Field>
                    <div className="row g-2">
                        <div className="col-7">
                            <Field label="ΑΜΚΑ ">
                                <input
                                    className="form-control"
                                    name="recipient_amka"
                                    type="numeric"
                                    value={data.recipient_amka ?? ""}
                                    onChange={(e) => dispatch(setDraftProperty({ key: "recipient_amka", value: e.target.value }))}
                                />
                            </Field>
                        </div>
                        <div className="col-5">
                            <Field label="ΑΦΜ ">
                                <input
                                    className="form-control"
                                    name="recipient_afm"
                                    type="numeric"
                                    value={data.recipient_afm ?? ""}
                                    onChange={(e) => dispatch(setDraftProperty({ key: "recipient_afm", value: e.target.value }))}
                                />
                            </Field>
                        </div>
                    </div>
                    <div className="row g-2">
                        <div className="col-7">
                            <Field label="Τηλέφωνο">
                                <input
                                    className="form-control"
                                    inputMode="tel"
                                    name="recipient_tel"
                                    value={data.recipient_tel ?? ""}
                                    onChange={(e) => dispatch(setDraftProperty({ key: "recipient_tel", value: e.target.value }))}
                                />
                            </Field>
                        </div>
                        <div className="col-5">
                            <Field label="ΑΤ/Διαβατήριο">
                                <input
                                    className="form-control"
                                    type="numeric"
                                    name="recipient_passport"
                                    value={data.recipient_passport ?? ""}
                                    onChange={(e) => dispatch(setDraftProperty({ key: "recipient_passport", value: e.target.value }))}
                                />
                            </Field>
                        </div>
                    </div>
                    <Field label="Διεύθυνση">
                        <input
                            className="form-control"
                            name="recipient_address"
                            value={data.recipient_address ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "recipient_address", value: e.target.value }))}
                        />
                    </Field>
                    <div className="row g-2">
                        <div className="col-8">
                            <Field label="Πόλη ">
                                <input
                                    className="form-control"
                                    name="recipient_city"
                                    value={data.recipient_city ?? ""}
                                    onChange={(e) => dispatch(setDraftProperty({ key: "recipient_city", value: e.target.value }))}
                                />
                            </Field>
                        </div>
                        <div className="col-4">
                            <Field label="ΤΚ">
                                <input
                                    className="form-control"
                                    name="recipient_tk"
                                    inputMode="numeric"
                                    value={data.recipient_tk ?? ""}
                                    onChange={(e) => dispatch(setDraftProperty({ key: "recipient_tk", value: e.target.value }))}
                                />
                            </Field>
                        </div>
                    </div>
                </>
            }

            <div className="form-check form-switch mb-2">
                <input
                    className="form-check-input"
                    name="shipTo_other_address"
                    type="checkbox"
                    checked={data.shipTo_other_address == 1}
                    onChange={(e) => {
                        dispatch(setDraftProperty({ key: "shipTo_other_address", value: e.target.checked ? 1 : 0 }))
                        if (e.target.checked) {
                            dispatch(setDraftProperty({ key: "address_ErpGID", value: null }))
                        } else if (data.person_ErpGID && data.person_ErpGID != "") {
                            dispatch(setDraftProperty({ key: "address_ErpGID", value: listAddressesPersons.find(x => x.person_ErpGID == data.person_ErpGID)?.addresses?.[0]?.address_ErpGID ?? null }))
                        }
                    }
                    }
                    id="shipTo_other_address"
                />
                <label className="form-check-label" htmlFor="shipTo_other_address">
                    Θα παραδοθεί σε άλλη διέυθυνση
                </label>
            </div>

            {data.shipTo_other_address == 1 &&
                <>
                    <div className="mt-3">
                        <Field label="Διεύθυνση παράδοσης">
                            <input
                                className="form-control"
                                name="customer_other_address"
                                value={data.customer_other_address ?? ""}
                                onChange={(e) => dispatch(setDraftProperty({ key: "customer_other_address", value: e.target.value }))}
                            />
                        </Field>
                    </div>
                    <div className="row g-2">
                        <div className="col-8">
                            <Field label="Πόλη ">
                                <input
                                    className="form-control"
                                    name="customer_other_city"
                                    value={data.customer_other_city ?? ""}
                                    onChange={(e) => dispatch(setDraftProperty({ key: "customer_other_city", value: e.target.value }))}
                                />
                            </Field>
                        </div>
                        <div className="col-4">
                            <Field label="ΤΚ">
                                <input
                                    className="form-control"
                                    name="customer_other_tk"
                                    inputMode="numeric"
                                    value={data.customer_other_tk ?? ""}
                                    onChange={(e) => dispatch(setDraftProperty({ key: "customer_other_tk", value: e.target.value }))}
                                />
                            </Field>
                        </div>
                    </div>
                </>
            }

        </div>
    );
}