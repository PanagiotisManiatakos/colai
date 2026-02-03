"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useAppDispatch } from "@/store/hooks";
import { submitDraft } from "@/features/orders/ordersSlice";
import OrderCustomerArea from "./OrderCustomerArea";
import OrderDoctorArea from "./OrderDoctorArea";
import MaterialsArea from "./MaterialsArea";
import CompletionArea from "./CompletionArea";
import GnomateuseisArea from "./GnomateuseisArea";
import SyntagiArea from "./SyntagiArea";
import SymmetoxiArea from "./SymmetoxiArea";
import SynenaiseisArea from "./SynenaiseisArea";

const steps = ["Γνωματεύσεις", "Ασθενής", "Ιατρός", "Υλικά", "Συνταγη", "Συμμετοχή", "Συνέναιση", "Checkout"] as const;

export default function OrderEoppyWizard() {
  const dispatch = useAppDispatch();
  const [step, setStep] = React.useState(0);

  const effectiveSteps = React.useMemo(() => [...steps], []);
  const maxStep = effectiveSteps.length - 1; // FIX: last valid index

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
    <div className="d-flex flex-column h-100" style={{ minHeight: 0 }}>
      {/* fixed top */}
      <div style={{ flex: "0 0 auto" }}>
        <StepIndicator steps={effectiveSteps as unknown as string[]} current={step} setStep={setStep} />
      </div>

      {/* scrollable middle */}
      <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
        {currentLabel === "Γνωματεύσεις" ? <GnomateuseisArea /> : null}
        {currentLabel === "Ασθενής" ? <OrderCustomerArea /> : null}
        {currentLabel === "Ιατρός" ? <OrderDoctorArea /> : null}
        {currentLabel === "Υλικά" ? <MaterialsArea /> : null}
        {currentLabel === "Συνταγη" ? <SyntagiArea /> : null}
        {currentLabel === "Συμμετοχή" ? <SymmetoxiArea /> : null}
        {currentLabel === "Συνέναιση" ? <SynenaiseisArea /> : null}
        {currentLabel === "Checkout" ? <CompletionArea /> : null}
      </div>

      {/* fixed bottom */}
      <div className="pt-3" style={{ flex: "0 0 auto" }}>
        <div className="d-flex gap-2">
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
    </div>
  );
}