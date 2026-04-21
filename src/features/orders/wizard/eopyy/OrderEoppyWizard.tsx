"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addDraftYliko, fetchOrders, loadCustomerAddressesAsync, setAIMaterials, setDraftFiles, setDraftProperty, setDraftYlika, setLastOrderInfoCustomerErpGID, submitDraftAsync } from "@/store/orders/ordersSlice";
import { store } from "@/store/store";
import { applyLastOrderData, normalizeZeroOne } from "@/lib/applyLastOrderData";
import OrderCustomerArea from "./OrderCustomerArea";
import OrderDoctorArea from "./OrderDoctorArea";
import MaterialsArea from "./MaterialsArea";
import Touchdown from "./Touchdown";
import GnomateuseisArea from "./GnomateuseisArea";
import SyntagiArea from "./SyntagiArea";
import SymmetoxiArea from "./SymmetoxiArea";
import SynenaiseisArea from "./SynenaiseisArea";
import { useRouter } from "next/navigation";
import AIMaterials from "./AIMaterials";
import { AIMaterials as AIMaterialsType } from "@/types/orders";
import YpervasiPlafonArea from "./YpervasiPlafonArea";

type AiStatus = "idle" | "running" | "done" | "error";
type AiClient = "Claude" | "Gemini";
type WizardIssue = { step: StepKey; field: string; message: string | boolean; error: string | null };

const isBlank = (v: any) => v == null || String(v).trim() === "";
const onlyDigits = (s: string) => s.replace(/\D/g, "");

type StepKey =
  | "gnomateuseis"
  | "customer"
  | "doctor"
  | "aiMaterials"
  | "materials"
  | "syntagi"
  | "ypervasiPlafon"
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
  const [showAiClientRetry, setShowAiClientRetry] = React.useState(false);
  const [issues, setIssues] = React.useState<WizardIssue[]>([]);

  const draftOrder = useAppSelector((s) => s.orders.draft.order)
  const files = useAppSelector((s: any) => s.orders?.draft?.files) ?? [];
  const hasFiles = files.some((o: any) => o?.documentCategory === "recipe");
  const hasConsentFormFiles = files.some((o: any) => o?.documentCategory === "consent_form");
  const orderUid = useAppSelector((s: any) => s.orders?.draft?.order?.uid);
  const group_EOPPY_id = useAppSelector((s: any) => s.orders?.draft?.order?.group_EOPPY_id);
  const submitState = useAppSelector((s) => s.orders.draft.submitState)
  const lastOrderInfoCustomerErpGID = useAppSelector(s => s.orders.draft.lastOrderInfoCustomerErpGID);
  const showSynainesiPanel = !draftOrder.customer_ErpGID || !(lastOrderInfoCustomerErpGID)
  const shouldShowAiMaterials = useAppSelector(s => s.orders.draft.ai_ylika);
  const maxPosoKostousGiaSymmetoxi = useAppSelector(s => s.orders?.draft?.order?.maxPosoKostousGiaSymmetoxi);
  const kostos = useAppSelector(s => s.orders?.draft?.order?.kostos);
  const ypervasiPlafon = (kostos ?? 0) - (maxPosoKostousGiaSymmetoxi ?? 0)
  const eidosEgkrisis = draftOrder.eidos_Egkrisis;

  const shouldShowWarningPlafon = ypervasiPlafon > 6 && Number(eidosEgkrisis) === 1;

  const stepDefs: StepDef[] = [
    {
      key: "gnomateuseis",
      label: "Γνωματεύσεις",
      render: () => (
        <GnomateuseisArea
          aiMessage={aiMessage}
          aiStatus={aiStatus}
          showAiClientRetry={showAiClientRetry}
          onRunAi={runAi}
          onRunAiWithClient={runAi}
        />
      )
    },
    { key: "customer", label: "Ασθενής", render: () => <OrderCustomerArea errors={errorsByField} clearError={clearError} /> },
    { key: "doctor", label: "Ιατρός", render: () => <OrderDoctorArea /> },
    { key: "syntagi", label: "\u03A3\u03C5\u03BD\u03C4\u03B1\u03B3\u03AE", render: () => <SyntagiArea /> },
    { key: "aiMaterials", label: "ΑΙ επιλογές", show: shouldShowAiMaterials.length > 0, render: () => <AIMaterials /> },
    { key: "materials", label: "Υλικά", render: () => <MaterialsArea /> },
    { key: "ypervasiPlafon", label: "Υπέρβαση πλαφόν", show: shouldShowWarningPlafon, render: () => <YpervasiPlafonArea /> },
    { key: "symmetoxi", label: "Συμμετοχή", render: () => <SymmetoxiArea errors={errorsByField} clearError={clearError} /> },
    { key: "synenaiseis", label: "Συναίνεση", show: showSynainesiPanel, render: () => <SynenaiseisArea /> },
    {
      key: "touchdown",
      label: "Touchdown",
      render: () => (
        <Touchdown
          issues={touchdownIssues}
          stepLabels={Object.fromEntries(stepDefs.map((s) => [s.key, s.label])) as Record<string, string>}
          onGoToIssue={(it) => {
            goToStepByKey(it.step as StepKey);
            focusField(it.field);
          }}
        />
      ),
    },
  ];

  const effectiveSteps = stepDefs.filter((s) => s.show !== false);

  const labels = effectiveSteps.map(s => s.label);
  const maxStep = effectiveSteps.length - 1;
  const current = effectiveSteps[step];

  const clearError = React.useCallback((field: string) => {
    setIssues((prev) => prev.filter((x) => x.field !== field));
  }, []);

  const errorsByField = React.useMemo(() => {
    const m: Record<string, string | boolean> = {};
    for (const it of issues) if (!m[it.field]) m[it.field] = it.message;
    return m;
  }, [issues]);

  function goToStepByKey(key: StepKey) {
    const idx = effectiveSteps.findIndex((s) => s.key === key);
    if (idx >= 0) setStep(idx);
  }

  function focusField(fieldName: string) {
    window.setTimeout(() => {
      const esc = (window as any).CSS?.escape ? (window as any).CSS.escape(fieldName) : fieldName;
      const el = document.querySelector(`[name="${esc}"]`) as HTMLElement | null;
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      (el as any)?.focus?.();
    }, 60);
  }

  React.useEffect(() => {
    setStep(s => Math.min(s, Math.max(0, effectiveSteps.length - 1)));
  }, [effectiveSteps.length]);

  function goNext() {
    setStep((s) => Math.min(s + 1, maxStep));
  }
  function goPrev() {
    setStep((s) => Math.max(s - 1, 0));
  }
  const currentKey = effectiveSteps[step]?.key;

  const validateEoppyOrder = React.useCallback((): WizardIssue[] => {
    const issues: WizardIssue[] = [];
    const add = (step: StepKey, field: string, message: string | boolean, error: string | null = null, when: boolean) => {
      if (when) issues.push({ step, field, message, error });
    };

    if (draftOrder.isTempSave != 1) {
      const otp = onlyDigits(draftOrder.customer_tel_otp ?? "");
      add("customer", "customer_tel_otp", "Συμπληρώστε ΟΤP (6 ψηφία)", "Συμπληρώστε ΟΤP (6 ψηφία)", otp.length !== 6);

      if (draftOrder.has_other_recipient == 1) {
        add("customer", "recipient_reason_id", true, "Συμπληρώστε αιτία παραλαβής", isBlank(draftOrder.recipient_reason_id));
        add("customer", "recipient_relation_id", true, "Συμπληρώστε τη σχέση με τον παραλήπτη", isBlank(draftOrder.recipient_relation_id));
        add("customer", "recipient_name", true, "Συμπληρώστε το όνομα παραλήπτη", isBlank(draftOrder.recipient_name));

        const rAmka = onlyDigits(draftOrder.recipient_amka ?? "");
        add("customer", "recipient_amka", "Συμπληρώστε ΑΜΚΑ παραλήπτη (11 ψηφία).", "Συμπληρώστε ΑΜΚΑ παραλήπτη (11 ψηφία).", rAmka.length !== 11);
        add("customer", "recipient_afm", true, "ΑΦΜ παραλήπτη", isBlank(draftOrder.recipient_afm));
        add("customer", "recipient_tel", true, "Τηλεφωνο παραλήπτη", isBlank(draftOrder.recipient_tel));
        add("customer", "recipient_passport", true, "Αριθμό διαβατηρίου παραλήπτη", isBlank(draftOrder.recipient_passport));
        add("customer", "recipient_address", true, "Διεύθυνση παραλήπτη", isBlank(draftOrder.recipient_address));
        add("customer", "recipient_city", true, "Πόλη παραλήπτη", isBlank(draftOrder.recipient_city));
        add("customer", "recipient_tk", true, "ΤΚ παραλήπτη", isBlank(draftOrder.recipient_tk));
      }

      if (draftOrder.shipTo_other_address == 1) {
        add("customer", "customer_other_address", true, "Διεύθυνση παραδοσης", isBlank(draftOrder.customer_other_address));
        add("customer", "customer_other_city", true, "Πόλη παραδοσης", isBlank(draftOrder.customer_other_city));
        add("customer", "customer_other_tk", true, "ΤΚ παραδοσης", isBlank(draftOrder.customer_other_tk));
      }

      if ((!draftOrder.customer_ErpGID || draftOrder.customer_ErpGID == "") && hasConsentFormFiles.length == 0) {
        add("synenaiseis", "", true, "Νέος πελάτης, δεν έχεις ανεβάσει συναίνεση", isBlank(draftOrder.customer_other_address));
      }

      add("symmetoxi", "eopyyVerifyNoParticipation", true, "Μηδενική συμμετοχή", draftOrder.eopyyVerifyNoParticipation != 1 && !(draftOrder.posoSymmetoxis > 0));
    }

    return issues;
  }, [draftOrder, hasConsentFormFiles]);

  const touchdownIssues = React.useMemo(() => {
    if (currentKey !== "touchdown") return [];
    return validateEoppyOrder();
  }, [currentKey, validateEoppyOrder]);


  async function onSave() {
    const found = validateEoppyOrder();

    if (found.length > 0) {
      setIssues(found);

      const first = found[0];
      goToStepByKey(first.step);
      focusField(first.field);
      return;
    }

    setIssues([]);
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

  async function runAi(aiclient: AiClient = "Claude") {
    setAiStatus("running");
    setAiMessage(null);
    setShowAiClientRetry(false);

    const controller = new AbortController();
    const pendingTimeoutMs = 60_000;
    const t = window.setTimeout(() => controller.abort(), pendingTimeoutMs);

    try {
      const res = await fetch("/api/orders/runai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_uid: orderUid,
          catid: group_EOPPY_id,
          aiclient
        }),
        signal: controller.signal,
      });

      const response = await res.json().catch(() => ({}));
      if (!res.ok || response?.ok === false || response?.result === false) {
        throw new Error(response?.message || "Το αίτημα ΑΙ δεν ήταν επιτυχές. Εισάγετε τα στοιχεία χειροκίνητα ή προσπαθήστε αργότερα.");
      }
      const data = response.data
      if (data.isSuccess) {
        dispatch(setDraftProperty({ key: "aiCalculated", value: true }))
        dispatch(setDraftProperty({ key: "hasAnoia", value: data.jsonDoc.hasAnoia }));

        const lastOrderInfo = data.jsonDoc?.last_order_info;
        const hasLastOrderInfo =
          lastOrderInfo &&
          typeof lastOrderInfo === "object" &&
          !Array.isArray(lastOrderInfo) &&
          Object.keys(lastOrderInfo).length > 0;

        if (hasLastOrderInfo) {
          const raw = lastOrderInfo as Record<string, unknown>;
          const orderObj =
            raw?.order && typeof raw.order === "object" && !Array.isArray(raw.order)
              ? (raw.order as Record<string, unknown>)
              : raw?.data && typeof raw.data === "object" && !Array.isArray(raw.data)
                ? (raw.data as Record<string, unknown>)
                : raw;

          dispatch(setLastOrderInfoCustomerErpGID((orderObj.customer_ErpGID ?? raw.customer_ErpGID) as string));
          applyLastOrderData(orderObj, dispatch);
          if (Array.isArray(orderObj?.items ?? orderObj?.ylika)) {
            dispatch(setDraftYlika((orderObj.items ?? orderObj.ylika) as any));
          }
          if (Array.isArray(orderObj?.ai_ylika)) {
            dispatch(setAIMaterials(orderObj.ai_ylika as any));
          }
          if (Array.isArray(raw?.files ?? orderObj?.files)) {
            dispatch(setDraftFiles((raw.files ?? orderObj.files) as any));
          }
          const pick = (...keys: string[]) => keys.reduce((v: unknown, k) => v ?? raw[k] ?? orderObj[k], undefined as unknown);
          const hasOther = pick("has_other_recipient", "hasOtherRecipient", "Has_Other_Recipient");
          if (hasOther !== undefined && hasOther !== null) dispatch(setDraftProperty({ key: "has_other_recipient", value: normalizeZeroOne(hasOther) }));
          const shipOther = pick("shipTo_other_address", "shipToOtherAddress", "ShipTo_Other_Address");
          if (shipOther !== undefined && shipOther !== null) dispatch(setDraftProperty({ key: "shipTo_other_address", value: normalizeZeroOne(shipOther) }));
          const delSun = pick("deliverySunday", "delivery_sunday");
          if (delSun !== undefined && delSun !== null) dispatch(setDraftProperty({ key: "deliverySunday", value: normalizeZeroOne(delSun) }));
          const delMorn = pick("deliveryMorning", "delivery_morning");
          if (delMorn !== undefined && delMorn !== null) dispatch(setDraftProperty({ key: "deliveryMorning", value: normalizeZeroOne(delMorn) }));

          const lastOrderAmka = String(orderObj.customer_amka ?? raw.customer_amka ?? "").trim();
          const lastGid = String(orderObj.customer_ErpGID ?? raw.customer_ErpGID ?? "").trim();
          if (lastOrderAmka && lastGid) {
            try {
              await dispatch(
                loadCustomerAddressesAsync({
                  customer_ErpGID: lastGid,
                  customer_name: orderObj.customer_name != null ? String(orderObj.customer_name) : undefined,
                  customer_address: orderObj.customer_address != null ? String(orderObj.customer_address) : undefined,
                  customer_amka: lastOrderAmka,
                  preferredPersonErpGID:
                    orderObj.person_ErpGID != null ? String(orderObj.person_ErpGID) : undefined,
                  preferredAddressErpGID:
                    orderObj.address_ErpGID != null ? String(orderObj.address_ErpGID) : undefined,
                })
              ).unwrap();
              dispatch(setDraftProperty({ key: "shipTo_other_address", value: 0 }));
              dispatch(setDraftProperty({ key: "shipToOtherAddressBool", value: false }));
              dispatch(setDraftProperty({ key: "has_other_recipient", value: 0 }));
            } catch {
              // Address list is optional if search-address fails
            }
          }
        }

        // Overlay with jsonDoc (document extraction)
        data.jsonDoc.amka_eksetazomenou && dispatch(setDraftProperty({ key: "customer_amka", value: data.jsonDoc.amka_eksetazomenou }))
        data.jsonDoc.onomateponymo_eksetazomenou && dispatch(setDraftProperty({ key: "customer_name", value: data.jsonDoc.onomateponymo_eksetazomenou }))
        data.jsonDoc.diefthinsi_eksetazomenou && dispatch(setDraftProperty({ key: "customer_address", value: data.jsonDoc.diefthinsi_eksetazomenou }))
        data.jsonDoc.poli_eksetazomenou && dispatch(setDraftProperty({ key: "customer_city", value: data.jsonDoc.poli_eksetazomenou }))
        data.jsonDoc.tk_eksetazomenou && dispatch(setDraftProperty({ key: "customer_tk", value: data.jsonDoc.tk_eksetazomenou }))
        data.jsonDoc.tilefono_eksetazomenou && dispatch(setDraftProperty({ key: "customer_tel", value: data.jsonDoc.tilefono_eksetazomenou }))
        if (data.jsonDoc.customer_tel != null && String(data.jsonDoc.customer_tel).trim() !== "") {
          const mobile = store.getState().orders.draft.order.customer_mobile;
          if (!String(mobile ?? "").trim()) {
            dispatch(setDraftProperty({ key: "customer_mobile", value: String(data.jsonDoc.customer_tel).trim() }));
          }
        }
        data.jsonDoc.email_eksetazomenou && dispatch(setDraftProperty({ key: "customer_email", value: data.jsonDoc.email_eksetazomenou }))
        data.jsonDoc.imerominia_gennisis && dispatch(setDraftProperty({ key: "customer_dob", value: data.jsonDoc.imerominia_gennisis }))
        data.jsonDoc.otp && dispatch(setDraftProperty({ key: "customer_tel_otp", value: data.jsonDoc.otp }))
        data.jsonDoc.customer_erpid && dispatch(setDraftProperty({ key: "customer_ErpGID", value: data.jsonDoc.customer_erpid }))
        //DOCTOR
        const doctor = data.jsonDoc.iatros
        if (doctor) {
        doctor.amka_iatrou && dispatch(setDraftProperty({ key: "doctor_amka", value: doctor.amka_iatrou }))
        doctor.onomateponymo_iatrou && dispatch(setDraftProperty({ key: "doctor_name", value: doctor.onomateponymo_iatrou }))
        doctor.afm_iatrou && dispatch(setDraftProperty({ key: "doctor_afm", value: doctor.afm_iatrou }))
        doctor.doctor_erpid && dispatch(setDraftProperty({ key: "doctor_ErpGID", value: doctor.doctor_erpid }))
        doctor.typos_domis && dispatch(setDraftProperty({ key: "doctor_DomiTypos", value: doctor.typos_domis }))
        doctor.ygeionomiki_domi && dispatch(setDraftProperty({ key: "doctor_Domi", value: doctor.ygeionomiki_domi }))
        }
        //SUGGESTED DOCTOR
        const suggestedDoctor = data.jsonDoc.systinon_iatros
        const hasSuggestedDoctor = suggestedDoctor ? hasAnyValue(suggestedDoctor) : null;
        hasSuggestedDoctor && dispatch(setDraftProperty({ key: "hasOtherSystinonIatroBool", value: hasSuggestedDoctor }))
        hasSuggestedDoctor && dispatch(setDraftProperty({ key: "has_suggested_doctor", value: hasSuggestedDoctor ? 2 : 0 }))
        if (hasSuggestedDoctor) {
          suggestedDoctor.amka_iatrou && dispatch(setDraftProperty({ key: "doctorSuggested_amka", value: suggestedDoctor.amka_iatrou }))
          suggestedDoctor.onomateponymo_iatrou && dispatch(setDraftProperty({ key: "doctorSuggested_name", value: suggestedDoctor.onomateponymo_iatrou }))
          suggestedDoctor.afm_iatrou && dispatch(setDraftProperty({ key: "doctorSuggested_afm", value: suggestedDoctor.afm_iatrou }))
          suggestedDoctor.doctor_erpid && dispatch(setDraftProperty({ key: "doctorSuggested_ErpGID", value: suggestedDoctor.doctor_erpid }))
        }
        //GNOMATEVSI
        const gnomatevsi = data.jsonDoc.gnomateusi
        if (gnomatevsi) {
        data.jsonDoc.barcode && dispatch(setDraftProperty({ key: "barcode", value: data.jsonDoc.barcode }))
        gnomatevsi.imerominia_gnomateusis && dispatch(setDraftProperty({ key: "dateOfSyntagi", value: gnomatevsi.imerominia_gnomateusis }))
        gnomatevsi.diarkeia_isxyos_apo && dispatch(setDraftProperty({ key: "dateIsxyeiApo", value: gnomatevsi.diarkeia_isxyos_apo }))
        gnomatevsi.diarkeia_isxyos_eos && dispatch(setDraftProperty({ key: "dateIsxyeiEos", value: gnomatevsi.diarkeia_isxyos_eos }))
        gnomatevsi.katigoria_paroxis && dispatch(setDraftProperty({ key: "katigoriaParoxis", value: gnomatevsi.katigoria_paroxis }))
        gnomatevsi.eidos_egkrisis && dispatch(setDraftProperty({ key: "eidos_Egkrisis", value: gnomatevsi.eidos_egkrisis }))
        dispatch(setDraftProperty({ key: "symmPercentage", value: gnomatevsi.symmetoxi_percentage }))
        dispatch(setDraftProperty({ key: "symm", value: gnomatevsi.symmetoxi }))
        gnomatevsi.symmetoxi_percentage == 0 && dispatch(setDraftProperty({ key: "eopyyVerifyNoParticipation", value: 0 }))

        gnomatevsi.diagnosi1_gid && dispatch(setDraftProperty({ key: "diagnosi1_GID", value: gnomatevsi.diagnosi1_gid }))
        gnomatevsi.kodikos_diagnosis && dispatch(setDraftProperty({ key: "eoppy_Diagnosi_Code", value: gnomatevsi.kodikos_diagnosis }))
        gnomatevsi.perigrafi_diagnosis && dispatch(setDraftProperty({ key: "eoppy_Diagnosi_Name", value: gnomatevsi.perigrafi_diagnosis }))
        gnomatevsi.diagnosi2_gid && dispatch(setDraftProperty({ key: "diagnosi2_GID", value: gnomatevsi.diagnosi2_gid }))
        gnomatevsi.kodikos_diagnosis2 && dispatch(setDraftProperty({ key: "eoppy_Diagnosi2_Code", value: gnomatevsi.kodikos_diagnosis2 }))
        gnomatevsi.perigrafi_diagnosis2 && dispatch(setDraftProperty({ key: "eoppy_Diagnosi2_Name", value: gnomatevsi.perigrafi_diagnosis2 }))
        dispatch(setDraftProperty({ key: "maxPosoKostousGiaSymmetoxi", value: gnomatevsi.max_poso_symmetoxis }))
        gnomatevsi.max_poso_symmetoxis > 0 && await dispatch(setDraftProperty({ key: "plafonGiftAmount", value: 6 }))
        }
        //AI MATERIALS
        const aiMaterials = data.jsonDoc.ylika
        if (Array.isArray(aiMaterials) && aiMaterials.length > 0) {
        const uniqueAiMaterials: AIMaterialsType[] = aiMaterials.filter((x: AIMaterialsType) => x.erp_products?.length && x.erp_products?.length == 1)
        const nonUniqueAiMaterials: AIMaterialsType[] = aiMaterials.filter((x: AIMaterialsType) => x.erp_products?.length != 1 || !x.erp_products)

        for (let i = 0; i < uniqueAiMaterials.length; i++) {
          dispatch(addDraftYliko({
            id: draftOrder.id,
            uid: draftOrder.uid,
            orderId: draftOrder.id,
            orderUID: draftOrder.uid,
            erpGid: uniqueAiMaterials[i].erp_products[0].erp_gid || "",
            aiMatchedErpGid: uniqueAiMaterials[i].erp_products[0].erp_gid || "",
            erpCode: uniqueAiMaterials[i].erp_products[0].erp_code || "",
            erpName: uniqueAiMaterials[i].erp_products[0].erp_name || "",
            erp_Price: uniqueAiMaterials[i].erp_products[0].erp_price || 0,
            erp_EoppyPrice: uniqueAiMaterials[i].erp_products[0].erp_eoppyprice || 0,
            qty: parseFloat(uniqueAiMaterials[i].synoliki_posotita_eidous),
            eoppy_CleanName: uniqueAiMaterials[i].clean_name,
            eoppy_Code: uniqueAiMaterials[i].kodikos_ylikou,
            eoppy_Diagnosi_Code: uniqueAiMaterials[i].kodikos_diagnosis,
            eoppy_Diagnosi_Name: uniqueAiMaterials[i].perigrafi_diagnosis,
            eoppy_Diagnosi2_Code: uniqueAiMaterials[i].kodikos_diagnosis2,
            eoppy_Diagnosi2_Name: uniqueAiMaterials[i].perigrafi_diagnosis2,
            eoppy_DiarkiaTherapias: String(uniqueAiMaterials[i].diarkeia_therapeias_se_mines),
            eoppy_SlugName: uniqueAiMaterials[i].slug_name,
            eoppy_SynPosotita: String(uniqueAiMaterials[i].synoliki_posotita_eidous),
            eoppy_AnatomPerioxi: uniqueAiMaterials[i].anatomiki_perioxi,
            eoppy_Symmetoxi: uniqueAiMaterials[i].symmetoxi,
            eoppy_Sxolia: uniqueAiMaterials[i].sxolia,
            aiMatchedBy: uniqueAiMaterials[i].matched_by,
            fuzzyMatched: uniqueAiMaterials[i].fuzzy_matched,
          }))
        }

        dispatch(setAIMaterials(nonUniqueAiMaterials))
        }
      }

      setAiStatus("done");
      setStep(1)
    } catch (e: any) {
      setAiStatus("error");
      if (aiclient === "Claude") {
        setShowAiClientRetry(true);
      }
      setAiMessage(
        e?.name === "AbortError"
          ? "Το αίτημα AI έληξε. Επιλέξτε Gemini ή εισάγετε τα στοιχεία χειροκίνητα."
          : aiclient === "Claude"
            ? "Το αίτημα AI δεν ολοκληρώθηκε. Επιλέξτε Gemini ή εισάγετε τα στοιχεία χειροκίνητα."
            : (e?.message || `Η εκτέλεση AI με ${aiclient} δεν ήταν επιτυχής. Δοκιμάστε αργότερα ή εισάγετε τα στοιχεία χειροκίνητα.`)
      );
    } finally {
      window.clearTimeout(t);
    }
  }
  console.log(draftOrder)
  return (
    <div className="d-flex flex-column h-100" style={{ minHeight: 0 }}>
      {/* fixed top */}
      <div style={{ flex: "0 0 auto" }}>
        <StepIndicator steps={labels} current={step} setStep={setStep} />
      </div>

      <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
        {current?.render()}
      </div>

      {/* fixed bottom - sticky so always visible when content overflows (e.g. large font sizes) */}
      <div
        className="pb-0 pt-1 flex-shrink-0"
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 10,
        }}
      >
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