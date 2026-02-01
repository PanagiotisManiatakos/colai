"use client";

import React from "react";
import OrderWizard from "@/components/orders/new/retail/OrderRetailWizard";
import { useAppDispatch } from "@/store/hooks";
import { setDraftProperty, setDraftSyntagiUploaded, startDraft } from "@/features/orders/ordersSlice";

type UploadStatus = "idle" | "uploading" | "done" | "error";

export default function GnomateuseisArea() {
    const dispatch = useAppDispatch();

    const [step, setStep] = React.useState<0 | 1>(0);
    const [file, setFile] = React.useState<File | null>(null);
    const [status, setStatus] = React.useState<UploadStatus>("idle");
    const [message, setMessage] = React.useState<string | null>(null);

    React.useEffect(() => {
        dispatch(setDraftProperty({ key: "type", value: "eoppy" }));
    }, [dispatch]);

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
            const filename = json.filename ?? file.name;

            dispatch(setDraftSyntagiUploaded({ filename }));
            setStatus("done");
            setMessage(`Uploaded: ${filename}`);

            // proceed to the SAME form
            setStep(1);
        } catch {
            setStatus("error");
            setMessage("Upload failed");
        }
    }

    return (
        <div>

            <div className="app-card p-4">
                <label className="form-label fw-semibold">Συνταγή (PDF ή φωτογραφία)</label>
                <input
                    className="form-control"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />

                {file ? (
                    <div className="mt-3 small text-secondary">
                        <div className="fw-semibold text-body">{file.name}</div>
                        <div>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
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
                            Συνέχεια στη φόρμα
                        </span>
                    )}
                </button>

                {message ? (
                    <div className={`alert mt-3 mb-0 ${status === "error" ? "alert-danger" : "alert-success"}`}>
                        {message}
                    </div>
                ) : null}
            </div>

        </div>
    );
}