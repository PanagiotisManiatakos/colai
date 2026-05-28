import type { DraftState } from "@/store/orders/ordersSlice";
import type { Order } from "@/types/orders";

export function isCustomerProsEbs(
  draft: Pick<DraftState, "customerProsEbs">,
): boolean {
  return draft.customerProsEbs === true;
}

export function isCustomerSelectedFromList(
  draft: Pick<DraftState, "customerSelectedFromList">,
): boolean {
  return draft.customerSelectedFromList === true;
}

export function shouldShowSynainesiStep(
  draft: Pick<DraftState, "customerProsEbs" | "lastOrderInfoCustomerErpGID">,
  order: Pick<Order, "customer_ErpGID" | "person_erpid" | "aiCalculated">,
): boolean {
  if (isCustomerProsEbs(draft)) return false;

  if (order.aiCalculated) {
    return !String(order.person_erpid ?? "").trim();
  }

  return (
    !String(order.customer_ErpGID ?? "").trim() ||
    !String(draft.lastOrderInfoCustomerErpGID ?? "").trim()
  );
}

export function formatLastCustomerWebOrderRow(lwo: Record<string, unknown>) {
  const name = String(lwo.customer_name ?? "").trim() || "—";
  const amka = String(lwo.customer_amka ?? "").trim() || "—";
  const city = String(lwo.customer_city ?? "").trim();
  const address = String(lwo.customer_address ?? "").trim();
  const addressLine = [city, address].filter(Boolean).join(" ") || "—";
  return { name, amka, addressLine };
}
