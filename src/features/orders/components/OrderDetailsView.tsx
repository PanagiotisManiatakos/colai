"use client";

import type { Order } from "@/types/orders";
import { formatUIDate } from "@/lib/utils/date";
import { StatusBadge } from "@/components/ui/StatusBadge";
import OrderDetailsViewCustomerInfo from "../view/OrderDetailsViewCustomerInfo";
import OrderDetailsViewDoctorInfo from "../view/OrderDetailsViewDoctorInfo";

export default function OrderDetailsView({ order, mode, value, }: {
  order: Order;
  mode: "view" | "edit";
  value: Partial<Order>;
}) {
  return (
    <div className="d-flex flex-column gap-3">
      <div className="app-card p-3">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="fw-semibold">{order.barcode}</div>
            <div className="small text-secondary mt-1">
              #{order.id} • {formatUIDate(order.dateIn)} • {order.customer_name}
            </div>
          </div>
          <div className="text-end">
            <StatusBadge status={order.statusId} />
            <div className="small text-secondary mt-1">Υλικά: {order.countYlika}</div>
          </div>
        </div>
      </div>

      <OrderDetailsViewCustomerInfo order={order} />

      <OrderDetailsViewDoctorInfo order={order} />

      <div className="app-card p-3">
        <div className="fw-semibold mb-2">Σχόλια</div>
        <textarea
          className="form-control"
          rows={3}
          readOnly={true}
          value={(value.sellerComments ?? order.sellerComments) || ""}
        />
      </div>

      <div className="app-card p-3" style={{ marginBottom: 14 }}>
        <div className="fw-semibold mb-2">Παράδοση</div>

        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            readOnly={true}
            checked={Boolean((value.deliveryMorning ?? order.deliveryMorning) ? 1 : 0)}
            id="deliveryMorning"
          />
          <label className="form-check-label" htmlFor="deliveryMorning">
            Παράδοση πρωί
          </label>
        </div>

        <div className="form-check form-switch mt-2">
          <input
            className="form-check-input"
            type="checkbox"
            readOnly={true}
            checked={Boolean((value.deliverySunday ?? order.deliverySunday) ? 1 : 0)}
            id="deliverySunday"
          />
          <label className="form-check-label" htmlFor="deliverySunday">
            Παράδοση Κυριακή
          </label>
        </div>
      </div>
    </div>
  );
}
