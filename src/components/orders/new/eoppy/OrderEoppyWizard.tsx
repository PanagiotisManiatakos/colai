"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useAppDispatch } from "@/store/hooks";
import { fetchOrders, submitDraft, submitDraftAsync } from "@/features/orders/ordersSlice";
import OrderCustomerArea from "./OrderCustomerArea";
import OrderDoctorArea from "./OrderDoctorArea";
import MaterialsArea from "./MaterialsArea";
import Touchdown from "./Touchdown";
import GnomateuseisArea from "./GnomateuseisArea";
import SyntagiArea from "./SyntagiArea";
import SymmetoxiArea from "./SymmetoxiArea";
import SynenaiseisArea from "./SynenaiseisArea";
import { useRouter } from "next/navigation";

const steps = ["Γνωματεύσεις", "Ασθενής", "Ιατρός", "Υλικά", "Συνταγη", "Συμμετοχή", "Συνάινεση", "Touchdown"] as const;

export default function OrderEoppyWizard() {
  const dispatch = useAppDispatch();
  const [step, setStep] = React.useState(0);
  const router = useRouter()

  const effectiveSteps = React.useMemo(() => [...steps], []);
  const maxStep = effectiveSteps.length - 1; // FIX: last valid index

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
    } catch (e: any) {
      console.error(e);
    }
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
        {currentLabel === "Γνωματεύσεις" ? <GnomateuseisArea goTo={(x: number) => setStep(x)} /> : null}
        {currentLabel === "Ασθενής" ? <OrderCustomerArea /> : null}
        {currentLabel === "Ιατρός" ? <OrderDoctorArea /> : null}
        {currentLabel === "Υλικά" ? <MaterialsArea /> : null}
        {currentLabel === "Συνταγη" ? <SyntagiArea /> : null}
        {currentLabel === "Συμμετοχή" ? <SymmetoxiArea /> : null}
        {currentLabel === "Συνάινεση" ? <SynenaiseisArea /> : null}
        {currentLabel === "Touchdown" ? <Touchdown /> : null}
      </div>

      {/* fixed bottom */}
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