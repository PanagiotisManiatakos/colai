"use client";

import type { Order } from "@/types/orders";
import React from "react";

export default function OrderDetailsViewCustomerInfo({ order }: { order: Order; }) {
  const [customerOpen, setCustomerOpen] = React.useState(true);

  return (

    <div className="app-card p-0">
      <div onClick={() => setCustomerOpen(x => !x)}
        className="fw-semibold text-light" style={{
          backgroundColor: order.customer_ErpGID ? "var(--bs-success)" : "var(--bs-danger)",
          padding: "0.5rem",
          borderRadius: "0.5rem"
        }}>
        Στοιχεία Πελάτη/Ασθενή
        {order.customer_ErpGID ? <i className="bi bi-check-lg ms-2"></i> : <i className="bi bi-ban ms-2"></i>}
      </div>

      {customerOpen &&
        <div className="p-3 row g-2">
          <div className="col-12">
            <div className="small text-secondary">Ονοματεπώνυμο</div>
            <div className="fw-medium">{order.customer_name}</div>
          </div>


          <div className="col-6">
            <div className="small text-secondary">ΑΜΚΑ</div>
            <div className="fw-medium">{order.customer_amka}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">Ημ/νία γέννησης</div>
            <div className="fw-medium">{order.customer_dob}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">Διεύθυνση</div>
            <div className="fw-medium">{order.customer_address}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">Πόλη</div>
            <div className="fw-medium">{order.customer_city}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">ΤΚ</div>
            <div className="fw-medium">{order.customer_tk}</div>
          </div>
          <div className="col-6">  </div>

          <div className="col-6">
            <div className="small text-secondary">Τηλέφωνο</div>
            <div className="fw-medium">{order.customer_tel}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">Email</div>
            <div className="fw-medium">{order.customer_email}</div>
          </div>

        </div>
      }
    </div>


  );
}
