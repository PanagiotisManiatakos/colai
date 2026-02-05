"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addDraftYliko, fetchOrders, loadCustomerAddressesAsync, setAIMaterials, setDraftProperty, submitDraftAsync } from "@/features/orders/ordersSlice";
import OrderCustomerArea from "./OrderCustomerArea";
import OrderDoctorArea from "./OrderDoctorArea";
import MaterialsArea from "./MaterialsArea";
import Touchdown from "./Touchdown";
import GnomateuseisArea from "./GnomateuseisArea";
import SyntagiArea from "./SyntagiArea";
import SymmetoxiArea from "./SymmetoxiArea";
import SynenaiseisArea from "./SynenaiseisArea";
import { useRouter } from "next/navigation";
import RunAiButton from "./RunAIButton";
import AIMaterials from "./AIMaterials";
import { AIMaterials as AIMaterialsType } from "@/types/orders";

const steps = ["Γνωματεύσεις", "Ασθενής", "Ιατρός", "Υλικά", "Συνταγη", "Συμμετοχή", "Συνάινεση", "Touchdown"] as const;
type AiStatus = "idle" | "running" | "done" | "error";

type StepKey =
  | "gnomateuseis"
  | "customer"
  | "doctor"
  | "aiMaterials"
  | "materials"
  | "syntagi"
  | "symmetoxi"
  | "synenaiseis"
  | "touchdown";

type StepDef = {
  key: StepKey;
  label: string;
  show?: boolean;              // condition
  render: () => React.ReactNode;
};

function hasAnyValue(obj: Record<string, any>): boolean {
  return Object.values(obj).some((v) => v !== null && v !== "");
}

export default function OrderEoppyWizard() {
  const dispatch = useAppDispatch();
  const [step, setStep] = React.useState(0);
  const router = useRouter()
  const [aiStatus, setAiStatus] = React.useState<AiStatus>("idle");
  const [aiMessage, setAiMessage] = React.useState<string | null>(null);

  const files = useAppSelector((s: any) => s.orders?.draft?.files) ?? [];
  const hasFiles = files.some((o: any) => o?.document_category === "recipe");
  const orderUid = useAppSelector((s: any) => s.orders?.draft?.order?.uid);
  const group_EOPPY_id = useAppSelector((s: any) => s.orders?.draft?.order?.group_EOPPY_id);
  const submitState = useAppSelector((s) => s.orders.draft.submitState)
  const shouldShowAiMaterials = useAppSelector(s => s.orders.draft.ai_ylika);

  const stepDefs: StepDef[] = [
    { key: "gnomateuseis", label: "Γνωματεύσεις", render: () => <GnomateuseisArea aiMessage={aiMessage} aiStatus={aiStatus} /> },
    { key: "customer", label: "Ασθενής", render: () => <OrderCustomerArea /> },
    { key: "doctor", label: "Ιατρός", render: () => <OrderDoctorArea /> },
    { key: "aiMaterials", label: "ΑΙ επιλογές", show: shouldShowAiMaterials.length > 0, render: () => <AIMaterials /> },
    { key: "materials", label: "Υλικά", render: () => <MaterialsArea /> },
    { key: "syntagi", label: "Συνταγη", render: () => <SyntagiArea /> },
    { key: "symmetoxi", label: "Συμμετοχή", render: () => <SymmetoxiArea /> },
    { key: "synenaiseis", label: "Συνάινεση", render: () => <SynenaiseisArea /> },
    { key: "touchdown", label: "Touchdown", render: () => <Touchdown /> },
  ];


  const effectiveSteps = stepDefs.filter((s) => s.show !== false);

  const labels = effectiveSteps.map(s => s.label);
  const maxStep = effectiveSteps.length - 1;
  const current = effectiveSteps[step];

  React.useEffect(() => {
    setStep(s => Math.min(s, Math.max(0, effectiveSteps.length - 1)));
  }, [effectiveSteps.length]);

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
        router.replace("/orders");
        await dispatch(fetchOrders({ force: true }));
      } else {
        console.log(result)
      }
    } catch (e: any) {
      console.error(e);
    }
  }

  async function runAi() {
    setAiStatus("running");
    setAiMessage(null);

    const controller = new AbortController();
    const t = window.setTimeout(() => controller.abort(), 240000); // 4 min

    try {
      const res = await fetch("/api/orders/runai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_uid: orderUid,
          catid: group_EOPPY_id,
          aiclient: "auto"
        }),
        signal: controller.signal,
      });

      const response = await res.json().catch(() => ({}));
      if (!res.ok || response?.ok === false || response?.result === false) {
        throw new Error(response?.message || "AI request failed");
      }
      const data = response.data
      if (data.isSuccess) {
        dispatch(setDraftProperty({ key: "aiCalculated", value: true }))
        dispatch(setDraftProperty({ key: "hasAnoia", value: data.jsonDoc.hasAnoia }));
        data.jsonDoc.customer_erpid && dispatch(loadCustomerAddressesAsync({ customer_ErpGID: data.jsonDoc.customer_erpid, customer_name: data.jsonDoc.onomateponymo_eksetazomenou, customer_amka: data.jsonDoc.amka_eksetazomenou, customer_address: data.jsonDoc.diefthinsi_eksetazomenou }));

        // CUSTOMER
        data.jsonDoc.amka_eksetazomenou && dispatch(setDraftProperty({ key: "customer_amka", value: data.jsonDoc.amka_eksetazomenou }))
        data.jsonDoc.onomateponymo_eksetazomenou && dispatch(setDraftProperty({ key: "customer_name", value: data.jsonDoc.onomateponymo_eksetazomenou }))
        data.jsonDoc.diefthinsi_eksetazomenou && dispatch(setDraftProperty({ key: "customer_address", value: data.jsonDoc.diefthinsi_eksetazomenou }))
        data.jsonDoc.poli_eksetazomenou && dispatch(setDraftProperty({ key: "customer_city", value: data.jsonDoc.poli_eksetazomenou }))
        data.jsonDoc.tk_eksetazomenou && dispatch(setDraftProperty({ key: "customer_tk", value: data.jsonDoc.tk_eksetazomenou }))
        data.jsonDoc.tilefono_eksetazomenou && dispatch(setDraftProperty({ key: "customer_tel", value: data.jsonDoc.tilefono_eksetazomenou }))
        data.jsonDoc.email_eksetazomenou && dispatch(setDraftProperty({ key: "customer_email", value: data.jsonDoc.email_eksetazomenou }))
        data.jsonDoc.imerominia_gennisis && dispatch(setDraftProperty({ key: "customer_dob", value: data.jsonDoc.imerominia_gennisis }))
        data.jsonDoc.otp && dispatch(setDraftProperty({ key: "customer_tel_otp", value: data.jsonDoc.otp }))
        data.jsonDoc.customer_erpid && dispatch(setDraftProperty({ key: "customer_ErpGID", value: data.jsonDoc.customer_erpid }))
        //DOCTOR
        const doctor = data.jsonDoc.iatros
        doctor.amka_iatrou && dispatch(setDraftProperty({ key: "doctor_amka", value: doctor.amka_iatrou }))
        doctor.onomateponymo_iatrou && dispatch(setDraftProperty({ key: "doctor_name", value: doctor.onomateponymo_iatrou }))
        doctor.afm_iatrou && dispatch(setDraftProperty({ key: "doctor_afm", value: doctor.afm_iatrou }))
        doctor.doctor_erpid && dispatch(setDraftProperty({ key: "doctor_ErpGID", value: doctor.doctor_erpid }))
        doctor.typos_domis && dispatch(setDraftProperty({ key: "doctor_DomiTypos", value: doctor.typos_domis }))
        doctor.ygeionomiki_domi && dispatch(setDraftProperty({ key: "doctor_Domi", value: doctor.ygeionomiki_domi }))
        //SUGGESTED DOCTOR
        const suggestedDoctor = data.jsonDoc.systinon_iatros
        const hasSuggestedDoctor = hasAnyValue(suggestedDoctor);
        hasSuggestedDoctor && dispatch(setDraftProperty({ key: "hasOtherSystinonIatroBool", value: hasSuggestedDoctor }))
        hasSuggestedDoctor && dispatch(setDraftProperty({ key: "has_suggested_doctor", value: hasSuggestedDoctor ? 1 : 0 }))
        if (hasSuggestedDoctor) {
          suggestedDoctor.amka_iatrou && dispatch(setDraftProperty({ key: "doctorSuggested_amka", value: suggestedDoctor.amka_iatrou }))
          suggestedDoctor.onomateponymo_iatrou && dispatch(setDraftProperty({ key: "doctorSuggested_name", value: suggestedDoctor.onomateponymo_iatrou }))
          suggestedDoctor.afm_iatrou && dispatch(setDraftProperty({ key: "doctorSuggested_afm", value: suggestedDoctor.afm_iatrou }))
          suggestedDoctor.doctor_erpid && dispatch(setDraftProperty({ key: "doctorSuggested_ErpGID", value: suggestedDoctor.doctor_erpid }))
        }
        //GNOMATEVSI
        const gnomatevsi = data.jsonDoc.gnomateusi
        data.jsonDoc.barcode && dispatch(setDraftProperty({ key: "barcode", value: data.jsonDoc.barcode }))
        gnomatevsi.imerominia_gnomateusis && dispatch(setDraftProperty({ key: "dateOfSyntagi", value: gnomatevsi.imerominia_gnomateusis }))
        gnomatevsi.diarkeia_isxyos_apo && dispatch(setDraftProperty({ key: "dateIsxyeiApo", value: gnomatevsi.diarkeia_isxyos_apo }))
        gnomatevsi.diarkeia_isxyos_eos && dispatch(setDraftProperty({ key: "dateIsxyeiEos", value: gnomatevsi.diarkeia_isxyos_eos }))
        gnomatevsi.katigoria_paroxis && dispatch(setDraftProperty({ key: "katigoriaParoxis", value: gnomatevsi.katigoria_paroxis }))
        gnomatevsi.eidos_egkrisis && dispatch(setDraftProperty({ key: "eidos_Egkrisis", value: gnomatevsi.eidos_egkrisis }))
        dispatch(setDraftProperty({ key: "symmPercentage", value: gnomatevsi.symmetoxi_percentage }))
        gnomatevsi.diagnosi1_gid && dispatch(setDraftProperty({ key: "diagnosi1_GID", value: gnomatevsi.diagnosi1_gid }))
        gnomatevsi.kodikos_diagnosis && dispatch(setDraftProperty({ key: "eoppy_Diagnosi_Code", value: gnomatevsi.kodikos_diagnosis }))
        gnomatevsi.perigrafi_diagnosis && dispatch(setDraftProperty({ key: "eoppy_Diagnosi_Name", value: gnomatevsi.perigrafi_diagnosis }))
        gnomatevsi.diagnosi2_gid && dispatch(setDraftProperty({ key: "diagnosi2_GID", value: gnomatevsi.diagnosi2_gid }))
        gnomatevsi.kodikos_diagnosis2 && dispatch(setDraftProperty({ key: "eoppy_Diagnosi2_Code", value: gnomatevsi.kodikos_diagnosis2 }))
        gnomatevsi.perigrafi_diagnosis2 && dispatch(setDraftProperty({ key: "eoppy_Diagnosi2_Name", value: gnomatevsi.perigrafi_diagnosis2 }))
        //AI MATERIALS
        const aiMaterials = data.jsonDoc.ylika
        const uniqueAiMaterials: AIMaterialsType[] = aiMaterials.filter((x: AIMaterialsType) => x.erp_products.length == 1)
        const nonUniqueAiMaterials: AIMaterialsType[] = aiMaterials.filter((x: AIMaterialsType) => x.erp_products.length > 1)

        for (let i = 0; i < uniqueAiMaterials.length; i++) {
          dispatch(addDraftYliko({
            erpGid: uniqueAiMaterials[i].erp_products[0].erp_gid || "",
            aiMatchedErpGid: uniqueAiMaterials[i].erp_products[0].erp_gid || "",
            gid: uniqueAiMaterials[i].erp_products[0].erp_gid || "",
            erp_code: uniqueAiMaterials[i].erp_products[0].erp_code || "",
            erpCode: uniqueAiMaterials[i].erp_products[0].erp_code || "",
            erp_name: uniqueAiMaterials[i].erp_products[0].erp_name || "",
            erpName: uniqueAiMaterials[i].erp_products[0].erp_name || "",
            erp_price: uniqueAiMaterials[i].erp_products[0].erp_price || 0,
            erp_eoppyprice: uniqueAiMaterials[i].erp_products[0].erp_eoppyprice || 0,
            qty: uniqueAiMaterials[i].synoliki_posotita_eidous,
            total_price: uniqueAiMaterials[i].erp_products[0].erp_price || 0,
            total_eoppyprice: uniqueAiMaterials[i].erp_products[0].erp_eoppyprice || 0,
          }))
        }

        dispatch(setAIMaterials(nonUniqueAiMaterials))
      }

      setAiStatus("done");
      setStep(1)
    } catch (e: any) {
      setAiStatus("error");
      setAiMessage(e?.name === "AbortError" ? "AI request timed out." : (e?.message || "AI request failed"));
    } finally {
      window.clearTimeout(t);
    }
  }

  return (
    <div className="d-flex flex-column h-100" style={{ minHeight: 0 }}>
      {/* fixed top */}
      <div style={{ flex: "0 0 auto" }}>
        <StepIndicator steps={labels} current={step} setStep={setStep} />
      </div>

      <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
        {current?.render()}
      </div>

      {/* fixed bottom */}
      <div className="pb-0 pt-1" style={{ flex: "0 0 auto" }}>
        <div className="d-flex gap-2">
          {step > 0 &&
            <button
              type="button"
              className="btn btn-outline-secondary flex-fill"
              onClick={goPrev}
              disabled={step === 0}
            >
              <i className="bi bi-chevron-left me-2" />
              Πίσω
            </button>
          }

          {step == 0 && <RunAiButton
            running={aiStatus === "running"}
            disabled={!hasFiles}
            onClick={runAi}
            label="Run AI"
          />}

          {step < maxStep && step > 0 &&
            <button type="button" className="btn btn-primary flex-fill" onClick={goNext}>
              Επόμενο
              <i className="bi bi-chevron-right ms-2" />
            </button>}

          {step == maxStep &&
            <button type="button" disabled={submitState.loading} className="btn btn-success flex-fill" onClick={onSave}>
              <i className="bi bi-check2-circle me-2" />
              {submitState.loading ? "Αποθήκευση..." : "Αποθήκευση"}
            </button>}
        </div>
      </div>
    </div>
  );
}