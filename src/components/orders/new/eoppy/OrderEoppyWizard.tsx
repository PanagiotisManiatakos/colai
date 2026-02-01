"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useAppDispatch } from "@/store/hooks";
import { submitDraft } from "@/features/orders/ordersSlice";
import OrderRetailCustomerArea from "./OrderRetailCustomerArea";
import OrderDoctorArea from "./OrderDoctorArea";
import MaterialsArea from "./MaterialsArea";
import CompletionArea from "./CompletionArea";
import GnomateuseisArea from "./GnomateuseisArea";

const steps = ["Γνωματεύσεις", "Ασθενής", "Ιατρός", "Υλικά", "Checkout"] as const;

export default function OrderEoppyWizard() {
  const dispatch = useAppDispatch();


  const [step, setStep] = React.useState(0);

  const effectiveSteps = React.useMemo(() => {
    return [...steps];
  }, []);

  const maxStep = effectiveSteps.length;

  function goNext() {
    setStep((s) => Math.min(s + 1, maxStep));
  }

  function goPrev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function onSave() {
    dispatch(submitDraft());
    alert("Saved (demo). Draft submitted.");
  }

  const currentLabel = effectiveSteps[step];

  return (
    <div>
      <StepIndicator steps={effectiveSteps as unknown as string[]} current={step} setStep={setStep} />

      {currentLabel === "Γνωματεύσεις" ? <GnomateuseisArea /> : null}

      {currentLabel === "Ασθενής" ? <OrderRetailCustomerArea /> : null}

      {currentLabel === "Ιατρός" ? <OrderDoctorArea /> : null}

      {currentLabel === "Υλικά" ? <MaterialsArea /> : null}

      {currentLabel === "Checkout" ? <CompletionArea /> : null}

      <div className="d-flex gap-2 mt-3">
        <button
          type="button"
          className="btn btn-outline-secondary flex-fill"
          onClick={goPrev}
          disabled={step === 0}
        >
          <i className="bi bi-chevron-left me-2" />
          Back
        </button>

        {step < maxStep ? (
          <button type="button" className="btn btn-primary flex-fill" onClick={goNext}>
            Next
            <i className="bi bi-chevron-right ms-2" />
          </button>
        ) : (
          <button type="button" className="btn btn-success flex-fill" onClick={onSave}>
            <i className="bi bi-check2-circle me-2" />
            Save
          </button>
        )}
      </div>
    </div>
  );
}