"use client";

import React from "react";
import { DiscountRequest } from "@/types/discoutRequest";
import { DiscountRequestStatusBadge } from "@/components/ui/DiscountRequestStatusBadge";
import { formatUIDate } from "@/lib/utils/date";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatCurrencyGR } from "@/lib/utils/number";

const ACTION_WIDTH = 88;

export default function DiscountRequestCard({ request, canSwipeDelete = false }: { request: DiscountRequest; canSwipeDelete?: boolean }) {
  const isPending = request.statusId === 1;
  const userCanMakeAction = useAppSelector((s) => s.discountRequests.userCanMakeAction)
  const dispatch = useAppDispatch();

  const [x, setX] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);

  const [showConfirm, setShowConfirm] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const startRef = React.useRef({
    x: 0,
    y: 0,
    baseX: 0,
    active: false,
    swiping: false,
  });

  React.useEffect(() => {
    if (!canSwipeDelete) {
      setX(0);
      setDragging(false);
      startRef.current.active = false;
      startRef.current.swiping = false;
    }
  }, [canSwipeDelete]);

  function clamp(v: number) {
    return Math.max(-ACTION_WIDTH, Math.min(0, v));
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!canSwipeDelete) return;
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
    if (!canSwipeDelete) return;
    if (!startRef.current.active) return;

    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    if (!startRef.current.swiping) {
      const isHorizontal = Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      if (!isHorizontal) return;
      startRef.current.swiping = true;
    }

    e.preventDefault();

    const nextX = clamp(startRef.current.baseX + dx);
    setX(Math.round(nextX));
  }

  function settle() {
    setDragging(false);
    startRef.current.active = false;

    const shouldOpen = x < -ACTION_WIDTH * 0.35;
    setX(shouldOpen ? -ACTION_WIDTH : 0);
  }

  function onPointerUp() {
    if (!canSwipeDelete) return;
    if (!startRef.current.active) return;
    settle();
  }

  function onPointerCancel() {
    if (!canSwipeDelete) return;
    if (!startRef.current.active) return;
    settle();
  }

  function onClickDelete() {
    setShowConfirm(true);
  }

  const reveal = canSwipeDelete ? Math.min(1, Math.max(0, -x / ACTION_WIDTH)) : 0;

  return (
    <div
      className="swipe-row mb-3"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{ touchAction: canSwipeDelete ? "pan-y" : "auto" }}
    >
      {canSwipeDelete ? (
        <div
          className="swipe-actions"
          style={{
            opacity: reveal,
            transform: `translateX(${(1 - reveal) * 12}px)`,
            pointerEvents: reveal > 0.02 ? "auto" : "none",
            transition: dragging ? "none" : "opacity 140ms ease, transform 140ms ease",
          }}
        >
          <button
            type="button"
            className="btn btn-danger swipe-delete"
            onClick={onClickDelete}
            aria-label="Delete order"
          >
            <i className="bi bi-trash3" />
          </button>
        </div>
      ) : null}

      <div
        className={`swipe-content ${dragging ? "dragging" : ""}`}
        style={{
          transform: `translate3d(${canSwipeDelete ? x : 0}px, 0, 0)`,
          position: "relative",
          zIndex: 1,
        }}
      >
        <details className="app-card p-3">
          <summary
            className="d-flex align-items-center justify-content-between"
            style={{ listStyle: "none", cursor: "pointer" }}
          >
            <div className="me-3">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary-subtle text-primary">#{request.id}</span>
                <div className="fw-semibold">{request.barcode}</div>
              </div>
              <div className="text-secondary small mt-1">{request.customer_name}</div>
            </div>

            <div className="text-end">
              <DiscountRequestStatusBadge status={request.statusId} />
              <div className="small text-secondary mt-1">
                {formatCurrencyGR(request.posoDiscounted)}€
              </div>
            </div>
          </summary>

          <div className="mt-3">
            <div className="app-divider my-2" />

            <div className="row g-2">
              <div className="col-12">
                <div className="small text-secondary">Ημερομηνία Συνταγής</div>
                <div className="fw-medium">{formatUIDate(request.dateOfSyntagi)}</div>
              </div>
              <div className="col-12">
                <div className="small text-secondary">Ημερομηνία Υποβολής</div>
                <div className="fw-medium">{formatUIDate(request.dateIn)}</div>
              </div>
              <div className="col-12">
                <div className="small text-secondary">ΑΜΚΑ Πελάτη</div>
                <div className="fw-medium">{request.customer_amka}</div>
              </div>
              <div className="col-12">
                <div className="small text-secondary">Ιατρός</div>
                <div className="fw-medium">{request.doctor_name}</div>
                <div className="text-secondary small">{request.doctor_amka}</div>
              </div>
            </div>

            {userCanMakeAction &&

              <div className="d-flex gap-2 mt-3">
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
            }
          </div>
        </details>
      </div>
    </div>
  );
}
