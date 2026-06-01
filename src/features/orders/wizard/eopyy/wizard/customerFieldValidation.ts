import { isBlank } from "@/lib/utils/string";
import type { Order } from "@/types/orders";
import type { StepKey, WizardIssue } from "./types";

const REQUIRED_CUSTOMER_FIELDS = [
  { field: "customer_name", message: "Συμπληρώστε ονοματεπώνυμο" },
  { field: "customer_passport", message: "Συμπληρώστε ΑΤ/Διαβατήριο" },
  { field: "customer_amka", message: "Συμπληρώστε ΑΜΚΑ" },
  { field: "customer_mobile", message: "Συμπληρώστε κινητό" },
  { field: "customer_address", message: "Συμπληρώστε διεύθυνση" },
  { field: "customer_city", message: "Συμπληρώστε πόλη" },
  { field: "customer_tk", message: "Συμπληρώστε ΤΚ" },
] as const satisfies ReadonlyArray<{
  field: keyof Order;
  message: string;
}>;

export const CUSTOMER_TOUCHDOWN_ONLY_FIELDS = new Set<string>(
  REQUIRED_CUSTOMER_FIELDS.map(({ field }) => field),
);

export function isCustomerTouchdownOnlyField(field: string): boolean {
  return CUSTOMER_TOUCHDOWN_ONLY_FIELDS.has(field);
}

export function getCustomerFieldWizardIssues(draftOrder: Order): WizardIssue[] {
  return REQUIRED_CUSTOMER_FIELDS.filter(({ field }) =>
    isBlank(draftOrder[field] as string | null | undefined),
  ).map(({ field, message }) => ({
    step: "customer" as StepKey,
    field,
    message,
    error: message,
  }));
}

export function hasCustomerFieldErrors(draftOrder: Order): boolean {
  return getCustomerFieldWizardIssues(draftOrder).length > 0;
}
