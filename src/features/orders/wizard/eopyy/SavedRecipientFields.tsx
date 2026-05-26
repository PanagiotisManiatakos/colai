"use client";

import OrderField from "@/components/ui/OrderField";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import { OrderListOfAddressPersons } from "@/types/orders";
import React from "react";
import { FormSelect } from "react-bootstrap";

type RecipientSelection = {
  person_ErpGID: string | null;
  address_ErpGID: string | null;
};

export function resolveSavedRecipientSelection(
  listAddressesPersons: OrderListOfAddressPersons[],
  {
    personErpGID,
    addressErpGID,
    preselectedPerson,
    preselectedAddress,
  }: {
    personErpGID?: string | null;
    addressErpGID?: string | null;
    preselectedPerson?: string | null;
    preselectedAddress?: string | null;
  },
): RecipientSelection {
  const personInList = (pid?: string | null) =>
    !!pid && listAddressesPersons.some((p) => p.person_ErpGID == pid);

  const addressForPerson = (
    pid: string,
    ...preferredAddresses: Array<string | null | undefined>
  ) => {
    const addresses =
      listAddressesPersons.find((p) => p.person_ErpGID == pid)?.addresses ?? [];
    for (const preferred of preferredAddresses) {
      if (
        preferred &&
        addresses.some((a) => a.address_ErpGID == preferred)
      ) {
        return preferred;
      }
    }
    return addresses[0]?.address_ErpGID ?? null;
  };

  const person =
    (personErpGID && personInList(personErpGID) ? personErpGID : null) ??
    (preselectedPerson && personInList(preselectedPerson)
      ? preselectedPerson
      : null) ??
    listAddressesPersons[0]?.person_ErpGID ??
    null;

  const address = person
    ? addressForPerson(person, addressErpGID, preselectedAddress)
    : null;

  return { person_ErpGID: person, address_ErpGID: address };
}

export default function SavedRecipientFields() {
  const data = useAppSelector((s) => s.orders.draft.order);
  const dispatch = useAppDispatch();
  const listAddressesPersons = useAppSelector(
    (s) => s.orders.draft.list_AddressesPersons,
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

  if (listAddressesPersons.length === 0) return null;

  return (
    <>
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

      {data.shipTo_other_address != 1 &&
        data.person_ErpGID &&
        data.person_ErpGID != "" &&
        selectedPersonAddresses.length > 0 && (
          <OrderField label="Αποθηκευμένη διεύθυνση">
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
        )}
    </>
  );
}
