
const statusB = {
  "0": {name: "Σε Αναμονή", variant: "warning"},
  "1": {name: "Καταχωρήθηκε", variant: "success"},
  "200": {name: "Συγχ. με ERP", variant: "success"},
  "500": {name: "Ακυρώθηκε", variant: "danger"},
}
export function StatusBadge({status}: {status: number;}) {
  const variant = statusB[status]?.variant || "secondary";  
  const name = statusB[status]?.name || status;

  return (
    <span
      className={`badge bg-${variant}`}
      style={{ letterSpacing: "0.02em" }}
    >
      {name}
    </span>
  );
}
