"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrders, submitDraftAsync } from "@/features/orders/ordersSlice";
import OrderRetailCustomerArea from "./OrderRetailCustomerArea";
import OrderDoctorArea from "./OrderDoctorArea";
import MaterialsArea from "./MaterialsArea";
import CompletionArea from "./CompletionArea";
import { useRouter } from "next/navigation";

const steps = ["Ασθενής", "Ιατρός", "Υλικά", "Checkout"] as const;

export default function OrderRetailWizard() {
  const dispatch = useAppDispatch();
  const router = useRouter()

  const [step, setStep] = React.useState(0);
  const loading = useAppSelector(state => state.orders.draft.submitState.loading)

  const effectiveSteps = React.useMemo(() => {
    return [...steps];
  }, []);

  const maxStep = effectiveSteps.length - 1;

  function goNext() {
    setStep((s) => Math.min(s + 1, maxStep));
  }

  function goPrev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSave() {
    try {
      const result = await dispatch(submitDraftAsync()).unwrap();
      if (result.result) {
        await dispatch(fetchOrders({ force: true }));
        router.replace("/orders");
      } else {
        console.log(result)
      }
      // optional: redirect to orders list
      // router.replace("/orders");
    } catch (e: any) {
      // submitError already set in redux, but keep this for immediate UX if you want
      console.error(e);
    }
  }

  const currentLabel = effectiveSteps[step];

  return (
    <div className="d-flex flex-column h-100" style={{ minHeight: 0 }}>
      <div style={{ flex: "0 0 auto" }}>
        <StepIndicator steps={effectiveSteps as unknown as string[]} current={step} setStep={setStep} />
      </div>
      <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
        {currentLabel === "Ασθενής" ? <OrderRetailCustomerArea /> : null}
        {currentLabel === "Ιατρός" ? <OrderDoctorArea /> : null}
        {currentLabel === "Υλικά" ? <MaterialsArea /> : null}
        {currentLabel === "Checkout" ? <CompletionArea /> : null}
      </div>

      <div className="pb-3 pt-1" style={{ flex: "0 0 auto" }}>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary flex-fill"
            onClick={goPrev}
            disabled={step === 0}
          >
            <i className="bi bi-chevron-left me-2" />
            Πίσω
          </button>

          {step < maxStep ? (
            <button type="button" className="btn btn-primary flex-fill" onClick={goNext}>
              Επόμενο
              <i className="bi bi-chevron-right ms-2" />
            </button>
          ) : (
            <button type="button" className="btn btn-success flex-fill" onClick={onSave}>
              <i className="bi bi-check2-circle me-2" />
              Αποθήκευση
            </button>
          )}
        </div>
      </div>
    </div>
  );
}