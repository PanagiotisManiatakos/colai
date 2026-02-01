"use client";

import React from "react";
import type { DiscountRequest } from "@/types/orders";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function DiscountRequestCard({
  request,
  // onApprove,
  // onDeny,
}: {
  request: DiscountRequest;
  // onApprove: () => void;
  // onDeny: () => void;
}) {
  const isPending = request.status === "ΕΚΚΡΕΜΕΙ";

  return (
    <details className="app-card p-3 mb-3">
      <summary
        className="d-flex align-items-center justify-content-between"
        style={{ listStyle: "none", cursor: "pointer" }}
      >
        <div className="me-3">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary">#{request.id}</span>
            <div className="fw-semibold">{request.recipeNo}</div>
          </div>
          <div className="text-secondary small mt-1">{request.clientName}</div>
        </div>

        <div className="text-end">
          <StatusBadge status={request.status} />
          <div className="small text-secondary mt-1">
            €{request.requestedPrice.toFixed(2)}
          </div>
        </div>
      </summary>

      <div className="mt-3">
        <div className="app-divider my-2" />

        <div className="row g-2">
          <div className="col-12">
            <div className="small text-secondary">Ημερομηνία Συνταγής</div>
            <div className="fw-medium">{request.dateCreated}</div>
          </div>
          <div className="col-12">
            <div className="small text-secondary">Ημερομηνία Υποβολής</div>
            <div className="fw-medium">{request.dateSubmitted}</div>
          </div>
          <div className="col-12">
            <div className="small text-secondary">ΑΜΚΑ Πελάτη</div>
            <div className="fw-medium">{request.clientAmka}</div>
          </div>
          <div className="col-12">
            <div className="small text-secondary">Ιατρός</div>
            <div className="fw-medium">{request.doctorName}</div>
            <div className="text-secondary small">AMKA: {request.doctorAmka}</div>
          </div>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary flex-fill"
            onClick={() => void navigator.clipboard?.writeText(request.recipeNo)}
          >
            <i className="bi bi-clipboard me-2" />
            Copy
          </button>

          <button
            type="button"
            className="btn btn-success flex-fill"
            // onClick={onApprove}
            disabled={!isPending}
          >
            <i className="bi bi-check2 me-2" />
            Approve
          </button>

          <button
            type="button"
            className="btn btn-outline-danger flex-fill"
            // onClick={onDeny}
            disabled={!isPending}
          >
            <i className="bi bi-x-lg me-2" />
            Deny
          </button>
        </div>
      </div>
    </details>
  );
}
