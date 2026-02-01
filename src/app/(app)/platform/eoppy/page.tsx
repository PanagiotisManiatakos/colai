"use client";

import React from "react";

export default function EoppyPlatformPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  async function onUpload() {
    if (!file) return;
    setStatus("uploading");
    setMessage(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/eoppy/upload", { method: "POST", body: fd });
      if (!res.ok) {
        setStatus("error");
        setMessage(await res.text());
        return;
      }

      const json = (await res.json()) as { ok: boolean; filename?: string };
      setStatus("done");
      setMessage(json.ok ? `Uploaded: ${json.filename}` : "Upload complete");
    } catch (e) {
      setStatus("error");
      setMessage("Upload failed");
    }
  }

  return (
    <div>
      <div className="app-card p-4 mb-3">
        <h1 className="h5 fw-semibold mb-2">Ανέβασε παραπεμπτικό ή γνωμάτευση</h1>
        <p className="text-secondary small mb-0">
          PDF ή φωτογραφία από κινητό. Τα στοιχεία θα αναγνωριστούν και θα
          ετοιμαστεί η επεξεργασία.
        </p>
      </div>

      <div className="app-card p-4 mb-3">
        <label className="form-label fw-semibold">Αρχείο</label>
        <input
          className="form-control"
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="mt-3 small text-secondary">
            <div className="fw-semibold text-body">{file.name}</div>
            <div>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className="btn btn-primary w-100 mt-3"
          onClick={() => void onUpload()}
          disabled={!file || status === "uploading"}
        >
          {status === "uploading" ? (
            <span className="d-inline-flex align-items-center gap-2">
              <span className="spinner-border spinner-border-sm" aria-hidden />
              Uploading…
            </span>
          ) : (
            <span>
              <i className="bi bi-sparkles me-2" />
              Επεξεργασία εγγράφου
            </span>
          )}
        </button>

        {message ? (
          <div className={`alert mt-3 mb-0 ${status === "error" ? "alert-danger" : "alert-success"}`}>
            {message}
          </div>
        ) : null}
      </div>

      <div className="app-card p-4">
        <div className="fw-semibold mb-2">Tips</div>
        <ul className="text-secondary small mb-0 ps-3">
          <li>Απόφυγε σκιές και αντανακλάσεις.</li>
          <li>Βεβαιώσου ότι φαίνονται καθαρά ΑΜΚΑ, στοιχεία και ημερομηνίες.</li>
          <li>Χρησιμοποίησε καθαρή φωτογραφία, χωρίς κλίση.</li>
        </ul>
      </div>
    </div>
  );
}
