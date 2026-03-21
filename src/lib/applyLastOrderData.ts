import type { AppDispatch } from "@/store/store";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import type { Order } from "@/types/orders";

const KEY_MAP: Record<string, keyof Order> = {
  customer_Notes: "customer_notes",
  preselected_address_GID: "address_ErpGID",
  address_GID: "address_ErpGID",
  preselected_person_GID: "person_ErpGID",
  person_GID: "person_ErpGID",
};

const EXCLUDE_KEYS = new Set<string>([
  "id",
  "uid",
  "dateIn",
  "dateUpdated",
  "dateErpLinked",
]);

/**
 * Overwrites draft order with values from lastOrderData (from last_order_info or lastCustomerWebOrder).
 * Skips null/undefined and excluded keys.
 */
export function applyLastOrderData(
  lastOrderData: Record<string, unknown>,
  dispatch: AppDispatch
): void {
  for (const [key, value] of Object.entries(lastOrderData)) {
    if (value === null || value === undefined) continue;
    const orderKey = (KEY_MAP[key] ?? key) as keyof Order;
    if (EXCLUDE_KEYS.has(orderKey)) continue;
    dispatch(setDraftProperty({ key: orderKey, value }));
  }
}
