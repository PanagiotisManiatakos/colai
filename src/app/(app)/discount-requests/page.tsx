"use client";

import React from "react";

import DiscountRequestCard from "@/features/orders/components/DiscountRequestCard";
import { useAppSelector } from "@/store/hooks";
import { SearchBar } from "@/components/ui/SearchBar";

export default function DiscountRequestsPage() {
  const requests = useAppSelector((s) => s.orders.discountRequests);
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return requests;

    return requests.filter((r) =>
      [
        String(r.id),
        r.barcode,
        r.customer_name,
        r.customer_amka,
        r.doctor_name,
        r.doctor_amka,
        r.status,
        String(r.requestedPrice),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [requests, q]);

  return (
    <div className="d-flex flex-column gap-2">
      <div className="app-card p-2 mb-3">
        <SearchBar placeholder="Αναζήτηση αιτήματος…" value={q} onChange={setQ} />
      </div>

      {filtered.length ? (
        <div className="d-flex flex-column gap-2">
          {filtered.map((r) => (
            <DiscountRequestCard key={r.id} request={r} />
          ))}
        </div>
      ) : (
        <div className="app-card p-4 text-center text-secondary">Δεν υπάρχουν αιτήματα.</div>
      )}
    </div>
  );
}
