"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import DiscountRequestCard from "@/components/orders/DiscountRequestCard";
import { SearchBar } from "@/components/ui/SearchBar";
//import { approveDiscount, denyDiscount } from "@/features/orders/ordersSlice";

export default function DiscountRequestsPage() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector((s) => s.orders.discountRequests);
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return requests;
    return requests.filter((r) =>
      [
        r.id.toString(),
        r.recipeNo,
        r.clientName,
        r.clientAmka,
        r.doctorName,
        r.doctorAmka,
        r.status,
        r.requestedPrice.toString(),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [requests, q]);

  return (
    <div>
      <div className="app-card p-3 mb-3">
        <SearchBar value={q} onChange={setQ} placeholder="Αναζήτηση αιτήματος…" />
      </div>

      {filtered.length ? (
        filtered.map((r) => (
          <DiscountRequestCard
            key={r.id}
            request={r}
            // onApprove={() => dispatch(approveDiscount(r.id))}
            // onDeny={() => dispatch(denyDiscount(r.id))}
          />
        ))
      ) : (
        <div className="app-card p-4 text-center text-secondary">
          Δεν υπάρχουν αιτήματα.
        </div>
      )}
    </div>
  );
}
