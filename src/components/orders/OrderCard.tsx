"use client";

import React from "react";
import type { Order } from "@/types/orders";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatUIDate } from "@/lib/utils/date";
import Link from "next/link";
import { Modal, Button } from "react-bootstrap";
import { useAppDispatch } from "@/store/hooks";
import { deleteOrderAsync } from "@/features/orders/ordersSlice";

const ACTION_WIDTH = 88;

export default function OrderCard({
  order,
  onDelete,
}: {
  order: Order;
  onDelete?: (id: number) => void;
}) {
  const canSwipeDelete = order.statusId === 0;

  const dispatch = useAppDispatch()

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

  function blockClickIfSwiping(e: React.SyntheticEvent) {
    if (startRef.current.swiping) {
      e.preventDefault();
      e.stopPropagation();
      startRef.current.swiping = false;
    }
  }

  function onClickDelete() {
    setShowConfirm(true);
  }


  async function confirmDelete() {
    try {
      setDeleting(true);
      await dispatch(deleteOrderAsync({ orderId: order.id, orderUID: order.uid }))

      setShowConfirm(false);
      setX(0);
      setDeleting(false);

    } finally {
    }
  }

  function closeModal() {
    if (deleting) return;

    setShowConfirm(false);

    // close swipe back to normal
    setX(0);
    setDragging(false);
    startRef.current.active = false;
    startRef.current.swiping = false;
  }
  return (
    <>
      <div
        className="swipe-row mb-3"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        style={{ touchAction: canSwipeDelete ? "pan-y" : "auto" }}
      >
        {canSwipeDelete ? (
          <div className="swipe-actions">
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
          style={{ transform: `translate3d(${canSwipeDelete ? x : 0}px, 0, 0)` }}
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
                {order.statusId === 0 ? (
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-fill"
                    onClick={() => void navigator.clipboard?.writeText(order.barcode)}
                  >
                    <i className="bi bi-pencil-fill me-2" />
                    Επεξεργασία
                  </button>
                ) : null}

                <Link href={`/orders/${order.id}?uid=${order.uid}`} className="btn btn-primary flex-fill">
                  <i className="bi bi-eye me-2" />
                  Προβολή
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>

      <Modal
        show={showConfirm}
        onHide={closeModal}
        centered
        backdrop={deleting ? "static" : true}
        keyboard={!deleting}
      >
        <Modal.Header closeButton={!deleting}>
          <Modal.Title className="fw-semibold">Επιβεβαίωση διαγραφής</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 44, height: 44, background: "rgba(220, 53, 69, 0.12)" }}
            >
              <i className="bi bi-exclamation-triangle-fill text-danger" />
            </div>

            <div>
              <div className="fw-semibold mb-1">
                Είστε σίγουροι πως θέλετε να διαγράψετε την παραγγελία;
              </div>
              <div className="text-secondary small">
                Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeModal} disabled={deleting}>
            Ακύρωση
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Διαγραφή…
              </>
            ) : (
              "Διαγραφή"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
