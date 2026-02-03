
const statusB: Record<"0" | "1" | "200" | "500", { name: string; variant: string }> = {
  "0": {name: "Σε Αναμονή", variant: "warning"},
  "1": {name: "Καταχωρήθηκε", variant: "success"},
  "200": {name: "Συγχ. με ERP", variant: "success"},
  "500": {name: "Ακυρώθηκε", variant: "danger"},
};
export function StatusBadge({status}: {status: number;}) {
  const key = String(status) as keyof typeof statusB;
  const variant = statusB[key]?.variant || "secondary";  
  const name = statusB[key]?.name || status;

  return (
    <span
      className={`badge bg-${variant}`}
      style={{ letterSpacing: "0.02em" }}
    >
      {name}
    </span>
  );
}
