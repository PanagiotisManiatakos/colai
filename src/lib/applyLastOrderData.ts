import type { AppDispatch } from "@/store/store";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import type { Order } from "@/types/orders";

const KEY_MAP: Record<string, keyof Order> = {
  customer_Notes: "customer_notes",
  recipient_Notes: "recipient_Notes",
  recipientNotes: "recipient_Notes",
  preselected_address_GID: "address_ErpGID",
  address_GID: "address_ErpGID",
  preselected_person_GID: "person_ErpGID",
  person_GID: "person_ErpGID",
  hasOtherRecipient: "has_other_recipient",
  Has_Other_Recipient: "has_other_recipient",
  shipToOtherAddress: "shipTo_other_address",
  ShipTo_Other_Address: "shipTo_other_address",
  recipientRelationId: "recipient_relation_id",
  recipientReasonId: "recipient_reason_id",
};

const EXCLUDE_KEYS = new Set<string>([
  "id",
  "uid",
  "dateIn",
  "dateUpdated",
  "dateErpLinked",
  "seller_GID",
  "sellerPerson_GID",
  "sellerName",
  "sellerCode",
  "sellerComments",
  "erpId",
]);

/** Fields that must be 0 or 1 for checkbox/switch UI */
const ZERO_ONE_FIELDS = new Set<string>([
  "has_other_recipient",
  "shipTo_other_address",
  "deliverySunday",
  "deliveryMorning",
  "shipToOtherAddressBool",
]);

export function normalizeZeroOne(value: unknown): 0 | 1 {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value ? 1 : 0;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string") return value === "1" || value.toLowerCase() === "true" ? 1 : 0;
  return !!value ? 1 : 0;
}

/** Keys allowed when applying lastCustomerWebOrder only (Ασθενής + Ιατρός steps) */
export const LAST_CUSTOMER_WEB_ORDER_ALLOW_KEYS = new Set<string>([
  "customer_amka", "customer_passport", "customer_name", "customer_address", "customer_city",
  "customer_tk", "customer_tel", "customer_mobile", "customer_mobile2", "customer_email", "customer_dob", "customer_notes", "customer_ErpGID",
  "customer_other_address", "customer_other_city", "customer_other_tk", "shipTo_other_address",
  "has_other_recipient", "recipient_relation_id", "recipient_reason_id", "recipient_name",
  "recipient_amka", "recipient_afm", "recipient_tel", "recipient_mobile", "recipient_mobile2", "recipient_passport", "recipient_address",
  "recipient_city", "recipient_tk", "recipient_ErpGID", "recipient_Notes",
  "person_ErpGID", "address_ErpGID", "preselected_person_GID", "preselected_address_GID",
  "doctor_amka", "doctor_name", "doctor_afm", "doctor_Domi", "doctor_DomiTypos", "doctor_ErpGID",
  "doctorSuggested_amka", "doctorSuggested_name", "doctorSuggested_afm", "doctorSuggested_ErpGID",
  "has_suggested_doctor", "hasOtherSystinonIatroBool",
]);

/**
 * Overwrites draft order with values from lastOrderData (from last_order_info or lastCustomerWebOrder).
 * Skips null/undefined and excluded keys.
 * When restrictToCustomerAndDoctor is true, only Ασθενής and Ιατρός fields are applied (e.g. for lastCustomerWebOrder).
 */
export function applyLastOrderData(
  lastOrderData: Record<string, unknown>,
  dispatch: AppDispatch,
  restrictToCustomerAndDoctor?: boolean
): void {
  for (const [key, value] of Object.entries(lastOrderData)) {
    const orderKey = (KEY_MAP[key] ?? key) as keyof Order;
    if (EXCLUDE_KEYS.has(orderKey)) continue;
    if (restrictToCustomerAndDoctor && !LAST_CUSTOMER_WEB_ORDER_ALLOW_KEYS.has(orderKey)) continue;
    const normalized = ZERO_ONE_FIELDS.has(orderKey) ? normalizeZeroOne(value) : value;
    if (normalized === null || normalized === undefined) continue;
    dispatch(setDraftProperty({ key: orderKey, value: normalized }));
  }
}
