"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setDraftProperty,
  setDraftSyntagiUploaded,
  setSynaineseisResults,
} from "@/store/orders/ordersSlice";
import FileUploadButton from "./FileUploadButton";
import { OrderFile } from "@/types/orders";
import {
  getConsentFileCategory,
  getConsentFormScore,
  isConsentScoreHigh,
  isConsentScoreTooLow,
  isConsentScoreWarning,
} from "@/lib/consentUpload";
import { Alert } from "react-bootstrap";

type UploadStatus = "idle" | "uploading" | "error";

type UploadingInfo = {
  name: string;
  fileSize: number;
  fileType: string;
};

function isPdf(name: string, mimeType?: string) {
  return mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf");
}

export default function SynenaiseisArea() {
  const dispatch = useAppDispatch();

  const files = useAppSelector((s) => s.orders?.draft?.files) ?? [];
  const orderUid = useAppSelector((s) => s.orders?.draft?.order?.uid);
  const synaineseisResults = useAppSelector(
    (s) => s.orders?.draft?.synaineseisResults,
  );

  const [status, setStatus] = React.useState<UploadStatus>("idle");
  const [progress, setProgress] = React.useState<number>(0);
  const [message, setMessage] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState<UploadingInfo | null>(null);

  const consentFiles = files.filter(
    (f) => getConsentFileCategory(f) === "consent_form",
  );
  const hasFiles = consentFiles.length > 0;
  const formScore = getConsentFormScore(synaineseisResults);
  const consentScoreTooLow = isConsentScoreTooLow(synaineseisResults);
  const consentScoreWarning = isConsentScoreWarning(synaineseisResults);
  const consentScoreHigh = isConsentScoreHigh(synaineseisResults);

  React.useEffect(() => {
    dispatch(setDraftProperty({ key: "type", value: "eopyy" }));
  }, [dispatch]);

  const isUploadingNow = status === "uploading";

  return (
    <div className="app-card p-3">
      <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
        <div className="fw-semibold">Αρχεία</div>

        <div className="d-flex align-items-center gap-2">
          <FileUploadButton
            ariaLabel="Προσθήκη"
            disabled={isUploadingNow}
            accept="application/pdf,image/*"
            dispatchFileToRedux={(d: OrderFile) =>
              dispatch(setDraftSyntagiUploaded(d))
            }
            dispatchResultsToRedux={(d) => dispatch(setSynaineseisResults(d))}
            position={0}
            document_category="consent_form"
            setMessage={(s: string | null) => setMessage(s)}
            setProgress={(i: number) => setProgress(i)}
            orderUid={orderUid}
            setUploading={(s: UploadingInfo | null) => setUploading(s)}
            setStatus={(s: UploadStatus) => setStatus(s)}
            endpoint="/api/orders/file"
          >
            {isUploadingNow ? (
              <span className="spinner-border spinner-border-sm" aria-hidden />
            ) : (
              <i className="bi bi-plus-lg" />
            )}
          </FileUploadButton>
        </div>
      </div>

      {uploading ? (
        <div className="mb-3 rounded border p-3">
          <div className="d-flex align-items-start justify-content-between">
            <div className="d-flex gap-2">
              <i
                className={`bi ${isPdf(uploading.name, uploading.fileType) ? "bi-filetype-pdf" : "bi-image"}`}
              />
              <div>
                <div className="fw-semibold">{uploading.name}</div>
                <div className="small text-secondary">
                  {`${(uploading.fileSize / 1024 / 1024).toFixed(2)} MB`}
                </div>
              </div>
            </div>

            <div className="small text-secondary">{progress}%</div>
          </div>

          <div className="progress mt-2" style={{ height: 10 }}>
            <div
              className={`progress-bar ${status === "error" ? "bg-danger" : "bg-success"}`}
              role="progressbar"
              style={{ width: `${status === "error" ? 100 : progress}%` }}
              aria-valuenow={status === "error" ? 100 : progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {message ? (
            <div className="alert alert-danger small mt-3 mb-0 py-2">
              {message}
            </div>
          ) : null}
        </div>
      ) : message ? (
        <div className="alert alert-danger small mb-3 py-2">{message}</div>
      ) : null}

      {hasFiles ? (
        <div className="d-flex flex-column gap-2">
          {consentFiles.map((f: OrderFile) => {
            const name = f.name ?? f.base64filename ?? f.originalFileName;
            const sizeLabel = f.fileSize
              ? String(f.fileSize).includes("MB")
                ? String(f.fileSize)
                : `${(parseFloat(String(f.fileSize)) / 1024 / 1024).toFixed(2)} MB`
              : "";
            const pdf = isPdf(name ?? "", f.fileType);

            return (
              <div
                key={`consent-${name}`}
                className="d-flex justify-content-between align-items-center rounded border p-2"
              >
                <div className="d-flex align-items-start gap-2">
                  <i className={`bi ${pdf ? "bi-filetype-pdf" : "bi-image"}`} />
                  <div>
                    <div className="fw-semibold">{name}</div>
                    <div className="small text-secondary">
                      {sizeLabel ? ` ${sizeLabel}` : ""}
                    </div>
                  </div>
                </div>

                <span className="badge text-bg-success">Uploaded</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="small text-secondary">
          Πάτα + για να ανεβάσεις συνάινεση.
        </div>
      )}

      {formScore != null ? (
        <div className="mt-3">
          <div
            className={`rounded border p-3 ${
              consentScoreTooLow
                ? "border-danger"
                : consentScoreWarning
                  ? "border-warning bg-warning-subtle"
                  : consentScoreHigh
                    ? "border-success bg-success-subtle"
                    : "border-secondary"
            }`}
          >
            <div className="fs-5 fw-semibold">
              Σκορ: <span className="fw-bold">{formScore}</span>
            </div>
          </div>

          {consentScoreTooLow ? (
            <div className="alert alert-danger small mt-2 mb-0 py-2">
              Το score δεν είναι αρκετά υψηλό. Παρακαλώ ανεβάστε νέο αρχείο.
            </div>
          ) : consentScoreWarning ? (
            <Alert variant="warning" className="small mt-2 mb-0 py-2">
              Το score είναι μεσαίο. Μπορείτε να συνεχίσετε, αλλά συνιστάται να
              ανεβάσετε νέο αρχείο.
            </Alert>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
