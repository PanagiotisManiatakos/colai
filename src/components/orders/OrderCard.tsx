"use client";

import React from "react";
import type { Order } from "@/types/orders";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatUIDate } from "@/lib/utils/date";
import Link from "next/link";

const ACTION_WIDTH = 88; // px (must match CSS .swipe-delete width)

export default function OrderCard({
  order,
  onDelete,
}: {
  order: Order;
  onDelete?: (id: number) => void;
}) {
  const [x, setX] = React.useState(0); // 0..-ACTION_WIDTH
  const [dragging, setDragging] = React.useState(false);

  const startRef = React.useRef({ x: 0, y: 0, baseX: 0, active: false, swiping: false });

  function clamp(v: number) {
    return Math.max(-ACTION_WIDTH, Math.min(0, v));
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Only left button / touch
    if (e.pointerType === "mouse" && e.button !== 0) return;

    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      baseX: x,
      active: true,
      swiping: false,
    };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!startRef.current.active) return;

    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    // Decide if it's a horizontal swipe (vs scroll)
    if (!startRef.current.swiping) {
      const isHorizontal = Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      if (!isHorizontal) return;
      startRef.current.swiping = true;
    }

    // Prevent accidental click/toggle while swiping
    e.preventDefault();

    const nextX = clamp(startRef.current.baseX + dx);
    setX(nextX);
  }

  function settle() {
    setDragging(false);
    startRef.current.active = false;

    // Snap open/closed depending on threshold
    const shouldOpen = x < -ACTION_WIDTH * 0.35;
    setX(shouldOpen ? -ACTION_WIDTH : 0);
  }

  function onPointerUp() {
    if (!startRef.current.active) return;
    settle();
  }

  function onPointerCancel() {
    if (!startRef.current.active) return;
    settle();
  }

  // Prevent <summary> click when user is swiping
  function blockClickIfSwiping(e: React.SyntheticEvent) {
    if (startRef.current.swiping) {
      e.preventDefault();
      e.stopPropagation();
      // reset so next tap works
      startRef.current.swiping = false;
    }
  }

  return (
    <div
      className="swipe-row mb-3"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{ touchAction: "pan-y" }}
    >
      <div className="swipe-actions">
        <button
          type="button"
          className="btn btn-danger swipe-delete"
          onClick={() => onDelete?.(order.id)}
          aria-label="Delete order"
        >
          <i className="bi bi-trash3" />
        </button>
      </div>

      <div
        className={`swipe-content ${dragging ? "dragging" : ""}`}
        style={{ transform: `translateX(${x}px)` }}
      >
        <details className="app-card p-3">
          <summary
            className="d-flex align-items-center justify-content-between"
            style={{ listStyle: "none", cursor: "pointer" }}
            onClickCapture={blockClickIfSwiping}
            onPointerUpCapture={blockClickIfSwiping}
          >
            <div className="me-3">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary-subtle text-primary">#{order.id}</span>
                <div className="fw-semibold">{order.barcode}</div>
              </div>
              <div className="text-secondary small mt-1">{order.customer_name}</div>
            </div>
            <div className="text-end">
              <StatusBadge status={order.statusId} />
              <div className="small text-secondary mt-1">Υλικά: {order.countYlika}</div>
            </div>
          </summary>

          <div className="mt-3">
            <div className="app-divider my-2" />

            <div className="row g-2">
              <div className="col-12">
                <div className="small text-secondary">Ημερομηνία Συνταγής</div>
                <div className="fw-medium">{formatUIDate(order.dateOfSyntagi)}</div>
              </div>
              <div className="col-12">
                <div className="small text-secondary">ΑΜΚΑ Πελάτη</div>
                <div className="fw-medium">{order.customer_amka}</div>
              </div>
              <div className="col-12">
                <div className="small text-secondary">Ιατρός</div>
                <div className="fw-medium">{order.doctor_name}</div>
                <div className="text-secondary small">AMKA: {order.doctor_amka}</div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                type="button"
                className="btn btn-outline-secondary flex-fill"
                onClick={() => void navigator.clipboard?.writeText(order.barcode)}
              >
                <i className="bi bi-pencil-fill me-2" />
                Επεξεργασία
              </button>
              <Link href={`/orders/${order.id}?uid=${order.uid}`} className="btn btn-primary flex-fill">
                <i className="bi bi-eye me-2" />
                Προβολή
              </Link>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
