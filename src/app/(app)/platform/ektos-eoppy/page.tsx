"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import {
  IDoctorFormData,
  IEktosEoppyFormData,
  IPatientFormData,
  IRecipientFormData,
} from "@/lib/interface";

const steps = ["Ασθενής", "Παραλήπτης", "Ιατρός", "Έλεγχος"];

function initialPatient(): IPatientFormData {
  return {
    amka: "",
    fullName: "",
    idNumber: "",
    phone: "",
    otp: "",
    email: "",
    dob: "",
    address: "",
    city: "",
    zip: "",
    deliverToOtherAddress: false,
    pickedUpByOther: false,
  };
}

function initialRecipient(): IRecipientFormData {
  return {
    reason: "",
    relation: "",
    fullName: "",
    idNumber: "",
    amka: "",
    afm: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  };
}

function initialDoctor(): IDoctorFormData {
  return {
    amka: "",
    fullName: "",
    afm: "",
    healthStructure: "",
    healthType: "",
    hasRefDoctor: true,
    refDoctorAmka: "",
    refDoctorFullName: "",
    refDoctorAfm: "",
  };
}

export default function EktosEoppyPlatformPage() {
  const [step, setStep] = React.useState(0);
  const [patient, setPatient] = React.useState<IPatientFormData>(initialPatient());
  const [recipient, setRecipient] = React.useState<IRecipientFormData>(initialRecipient());
  const [doctor, setDoctor] = React.useState<IDoctorFormData>(initialDoctor());

  const needsRecipient = patient.pickedUpByOther;

  const effectiveSteps = React.useMemo(() => {
    // If no recipient, skip step 1
    return needsRecipient ? steps : [steps[0], steps[2], steps[3]];
  }, [needsRecipient]);

  const maxStep = effectiveSteps.length - 1;

  function goNext() {
    setStep((s) => Math.min(s + 1, maxStep));
  }

  function goPrev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function submit() {
    const payload: IEktosEoppyFormData = { patient, recipient, doctor };
    console.log("Εκτός ΕΟΠΥΥ payload:", payload);
    alert("Saved (demo). Check console for payload.");
  }

  const currentLabel = effectiveSteps[step];

  return (
    <div>
      <div className="app-card p-4 mb-3">
        <h1 className="h5 fw-semibold mb-2">Εκτός ΕΟΠΥΥ – Νέα παραγγελία</h1>
        <p className="text-secondary small mb-0">
          Mobile-first wizard για γρήγορη, καθαρή καταχώρηση.
        </p>
      </div>

      <StepIndicator steps={effectiveSteps} current={step} />

      {currentLabel === "Ασθενής" ? (
        <PatientStep data={patient} onChange={(p) => setPatient((x) => ({ ...x, ...p }))} />
      ) : null}

      {currentLabel === "Παραλήπτης" ? (
        <RecipientStep data={recipient} onChange={(p) => setRecipient((x) => ({ ...x, ...p }))} />
      ) : null}

      {currentLabel === "Ιατρός" ? (
        <DoctorStep data={doctor} onChange={(p) => setDoctor((x) => ({ ...x, ...p }))} />
      ) : null}

      {currentLabel === "Έλεγχος" ? (
        <ReviewStep patient={patient} recipient={needsRecipient ? recipient : null} doctor={doctor} />
      ) : null}

      <div className="d-flex gap-2 mt-3">
        <button type="button" className="btn btn-outline-secondary flex-fill" onClick={goPrev} disabled={step === 0}>
          <i className="bi bi-chevron-left me-2" />
          Πίσω
        </button>

        {step < maxStep ? (
          <button type="button" className="btn btn-primary flex-fill" onClick={goNext}>
            Επόμενο
            <i className="bi bi-chevron-right ms-2" />
          </button>
        ) : (
          <button type="button" className="btn btn-success flex-fill" onClick={submit}>
            <i className="bi bi-check2-circle me-2" />
            Αποθήκευση
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      {children}
      {hint ? <div className="form-text">{hint}</div> : null}
    </div>
  );
}

function PatientStep({
  data,
  onChange,
}: {
  data: IPatientFormData;
  onChange: (patch: Partial<IPatientFormData>) => void;
}) {
  return (
    <div className="app-card p-4">
      <div className="fw-semibold mb-2">Στοιχεία ασθενή</div>

      <Field label="Ονοματεπώνυμο">
        <input className="form-control" value={data.fullName} onChange={(e) => onChange({ fullName: e.target.value })} />
      </Field>

      <div className="row g-2">
        <div className="col-7">
          <Field label="ΑΜΚΑ">
            <input className="form-control" inputMode="numeric" value={data.amka} onChange={(e) => onChange({ amka: e.target.value })} />
          </Field>
        </div>
        <div className="col-5">
          <Field label="Ημ/νία Γέννησης" hint="π.χ. 01/01/1990">
            <input className="form-control" value={data.dob} onChange={(e) => onChange({ dob: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="row g-2">
        <div className="col-7">
          <Field label="Τηλέφωνο">
            <input className="form-control" inputMode="tel" value={data.phone} onChange={(e) => onChange({ phone: e.target.value })} />
          </Field>
        </div>
        <div className="col-5">
          <Field label="Email">
            <input className="form-control" inputMode="email" value={data.email} onChange={(e) => onChange({ email: e.target.value })} />
          </Field>
        </div>
      </div>

      <Field label="Διεύθυνση">
        <input className="form-control" value={data.address} onChange={(e) => onChange({ address: e.target.value })} />
      </Field>

      <div className="row g-2">
        <div className="col-8">
          <Field label="Πόλη">
            <input className="form-control" value={data.city} onChange={(e) => onChange({ city: e.target.value })} />
          </Field>
        </div>
        <div className="col-4">
          <Field label="ΤΚ">
            <input className="form-control" inputMode="numeric" value={data.zip} onChange={(e) => onChange({ zip: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="app-divider my-2" />

      <div className="form-check form-switch mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="pickedUpByOther"
          checked={data.pickedUpByOther}
          onChange={(e) => onChange({ pickedUpByOther: e.target.checked })}
        />
        <label className="form-check-label fw-semibold" htmlFor="pickedUpByOther">
          Παραλαμβάνει άλλος
        </label>
      </div>

      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="deliverToOtherAddress"
          checked={data.deliverToOtherAddress}
          onChange={(e) => onChange({ deliverToOtherAddress: e.target.checked })}
        />
        <label className="form-check-label fw-semibold" htmlFor="deliverToOtherAddress">
          Παράδοση σε άλλη διεύθυνση
        </label>
      </div>

      <div className="text-secondary small mt-2">
        Αν ενεργοποιήσεις «Παραλαμβάνει άλλος», θα ζητηθούν στοιχεία παραλήπτη.
      </div>
    </div>
  );
}

function RecipientStep({
  data,
  onChange,
}: {
  data: IRecipientFormData;
  onChange: (patch: Partial<IRecipientFormData>) => void;
}) {
  return (
    <div className="app-card p-4">
      <div className="fw-semibold mb-2">Στοιχεία παραλήπτη</div>

      <div className="row g-2">
        <div className="col-6">
          <Field label="Λόγος">
            <select
              className="form-select"
              value={data.reason}
              onChange={(e) => onChange({ reason: e.target.value as IRecipientFormData["reason"] })}
            >
              <option value="">Επιλογή…</option>
              <option value="cant">Δεν μπορεί</option>
              <option value="other">Άλλο</option>
            </select>
          </Field>
        </div>
        <div className="col-6">
          <Field label="Σχέση">
            <select
              className="form-select"
              value={data.relation}
              onChange={(e) => onChange({ relation: e.target.value as IRecipientFormData["relation"] })}
            >
              <option value="">Επιλογή…</option>
              <option value="relative">Συγγενής</option>
              <option value="friend">Φίλος</option>
              <option value="other">Άλλο</option>
            </select>
          </Field>
        </div>
      </div>

      <Field label="Ονοματεπώνυμο">
        <input className="form-control" value={data.fullName} onChange={(e) => onChange({ fullName: e.target.value })} />
      </Field>

      <div className="row g-2">
        <div className="col-6">
          <Field label="ΑΔΤ">
            <input className="form-control" value={data.idNumber} onChange={(e) => onChange({ idNumber: e.target.value })} />
          </Field>
        </div>
        <div className="col-6">
          <Field label="Τηλέφωνο">
            <input className="form-control" inputMode="tel" value={data.phone} onChange={(e) => onChange({ phone: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="row g-2">
        <div className="col-6">
          <Field label="ΑΜΚΑ">
            <input className="form-control" inputMode="numeric" value={data.amka} onChange={(e) => onChange({ amka: e.target.value })} />
          </Field>
        </div>
        <div className="col-6">
          <Field label="ΑΦΜ">
            <input className="form-control" inputMode="numeric" value={data.afm} onChange={(e) => onChange({ afm: e.target.value })} />
          </Field>
        </div>
      </div>

      <Field label="Διεύθυνση">
        <input className="form-control" value={data.address} onChange={(e) => onChange({ address: e.target.value })} />
      </Field>

      <div className="row g-2">
        <div className="col-8">
          <Field label="Πόλη">
            <input className="form-control" value={data.city} onChange={(e) => onChange({ city: e.target.value })} />
          </Field>
        </div>
        <div className="col-4">
          <Field label="ΤΚ">
            <input className="form-control" inputMode="numeric" value={data.zip} onChange={(e) => onChange({ zip: e.target.value })} />
          </Field>
        </div>
      </div>
    </div>
  );
}

function DoctorStep({
  data,
  onChange,
}: {
  data: IDoctorFormData;
  onChange: (patch: Partial<IDoctorFormData>) => void;
}) {
  return (
    <div className="app-card p-4">
      <div className="fw-semibold mb-2">Στοιχεία ιατρού</div>

      <Field label="Ονοματεπώνυμο">
        <input className="form-control" value={data.fullName} onChange={(e) => onChange({ fullName: e.target.value })} />
      </Field>

      <div className="row g-2">
        <div className="col-6">
          <Field label="ΑΜΚΑ">
            <input className="form-control" inputMode="numeric" value={data.amka} onChange={(e) => onChange({ amka: e.target.value })} />
          </Field>
        </div>
        <div className="col-6">
          <Field label="ΑΦΜ">
            <input className="form-control" inputMode="numeric" value={data.afm} onChange={(e) => onChange({ afm: e.target.value })} />
          </Field>
        </div>
      </div>

      <Field label="Δομή Υγείας">
        <input className="form-control" value={data.healthStructure} onChange={(e) => onChange({ healthStructure: e.target.value })} />
      </Field>

      <Field label="Τύπος">
        <input className="form-control" value={data.healthType} onChange={(e) => onChange({ healthType: e.target.value })} />
      </Field>

      <div className="app-divider my-2" />

      <div className="form-check form-switch mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="hasRefDoctor"
          checked={data.hasRefDoctor}
          onChange={(e) => onChange({ hasRefDoctor: e.target.checked })}
        />
        <label className="form-check-label fw-semibold" htmlFor="hasRefDoctor">
          Υπάρχει παραπέμπων ιατρός
        </label>
      </div>

      {data.hasRefDoctor ? (
        <div className="app-card p-3" style={{ background: "rgba(0,0,0,0.02)" }}>
          <div className="fw-semibold mb-2">Παραπέμπων ιατρός</div>

          <Field label="Ονοματεπώνυμο">
            <input className="form-control" value={data.refDoctorFullName} onChange={(e) => onChange({ refDoctorFullName: e.target.value })} />
          </Field>

          <div className="row g-2">
            <div className="col-6">
              <Field label="ΑΜΚΑ">
                <input className="form-control" inputMode="numeric" value={data.refDoctorAmka} onChange={(e) => onChange({ refDoctorAmka: e.target.value })} />
              </Field>
            </div>
            <div className="col-6">
              <Field label="ΑΦΜ">
                <input className="form-control" inputMode="numeric" value={data.refDoctorAfm} onChange={(e) => onChange({ refDoctorAfm: e.target.value })} />
              </Field>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="d-flex align-items-center justify-content-between py-2">
      <div className="text-secondary small">{label}</div>
      <div className="fw-medium text-end">{value || "—"}</div>
    </div>
  );
}

function ReviewStep({
  patient,
  recipient,
  doctor,
}: {
  patient: IPatientFormData;
  recipient: IRecipientFormData | null;
  doctor: IDoctorFormData;
}) {
  return (
    <div>
      <div className="app-card p-4 mb-3">
        <div className="fw-semibold mb-2">Έλεγχος στοιχείων</div>
        <div className="text-secondary small">Επιβεβαίωσε πριν την αποθήκευση.</div>
      </div>

      <div className="app-card p-4 mb-3">
        <div className="fw-semibold mb-2">Ασθενής</div>
        <ReviewItem label="Ονοματεπώνυμο" value={patient.fullName} />
        <div className="app-divider" />
        <ReviewItem label="ΑΜΚΑ" value={patient.amka} />
        <div className="app-divider" />
        <ReviewItem label="Τηλέφωνο" value={patient.phone} />
        <div className="app-divider" />
        <ReviewItem label="Διεύθυνση" value={`${patient.address} ${patient.city} ${patient.zip}`.trim()} />
      </div>

      {recipient ? (
        <div className="app-card p-4 mb-3">
          <div className="fw-semibold mb-2">Παραλήπτης</div>
          <ReviewItem label="Ονοματεπώνυμο" value={recipient.fullName} />
          <div className="app-divider" />
          <ReviewItem label="Τηλέφωνο" value={recipient.phone} />
          <div className="app-divider" />
          <ReviewItem label="Διεύθυνση" value={`${recipient.address} ${recipient.city} ${recipient.zip}`.trim()} />
        </div>
      ) : null}

      <div className="app-card p-4">
        <div className="fw-semibold mb-2">Ιατρός</div>
        <ReviewItem label="Ονοματεπώνυμο" value={doctor.fullName} />
        <div className="app-divider" />
        <ReviewItem label="ΑΜΚΑ" value={doctor.amka} />
        <div className="app-divider" />
        <ReviewItem label="Δομή" value={doctor.healthStructure} />
      </div>
    </div>
  );
}
