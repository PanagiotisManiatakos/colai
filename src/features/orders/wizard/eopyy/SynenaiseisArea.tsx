"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDraftProperty, setDraftSyntagiUploaded } from "@/store/orders/ordersSlice";
import FileUploadButton from "./FileUploadButton";
import { OrderFile } from "@/types/orders";

type UploadStatus = "idle" | "uploading" | "error";

type UploadingInfo = {
    name: string;
    fileSize: number;
    fileType: string;
};


function isPdf(name: string, mimeType?: string) {
    return mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf");
}

function hasAnyValue(obj: Record<string, any>): boolean {
    return Object.values(obj).some((v) => v !== null && v !== "");
}

export default function SynenaiseisArea() {
    const dispatch = useAppDispatch();

    const files = useAppSelector((s: any) => s.orders?.draft?.files) ?? [];
    const orderUid = useAppSelector((s: any) => s.orders?.draft?.order?.uid);

    const [status, setStatus] = React.useState<UploadStatus>("idle");
    const [progress, setProgress] = React.useState<number>(0);

    const [message, setMessage] = React.useState<string | null>(null);

    const [uploading, setUploading] = React.useState<UploadingInfo | null>(null);

    React.useEffect(() => {
        dispatch(setDraftProperty({ key: "type", value: "eopyy" }));
    }, [dispatch]);


    const isUploadingNow = status === "uploading";
    const hasFiles = files.some((o: any) => o?.document_category === "consent_form");

    return (
        <div className="app-card p-4">
            <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                <div className="fw-semibold">Αρχεία</div>

                <div className="d-flex align-items-center gap-2">
                    <FileUploadButton
                        ariaLabel="Προσθήκη"
                        disabled={isUploadingNow}
                        accept="application/pdf,image/*"
                        dispatchFileToRedux={(d: any) => dispatch(setDraftSyntagiUploaded(d))}
                        position={files.length}
                        document_category="consent_form"
                        setMessage={(s: any) => setMessage(s)}
                        setProgress={(i: number) => setProgress(i)}
                        orderUid={orderUid}
                        setUploading={(s: any) => setUploading(s)}
                        setStatus={(s: any) => setStatus(s)}
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
                <div className="p-3 border rounded mb-3">
                    <div className="d-flex align-items-start justify-content-between">
                        <div className="d-flex gap-2">
                            <i className={`bi ${isPdf(uploading.name, uploading.fileType) ? "bi-filetype-pdf" : "bi-image"}`} />
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
                        <div className="alert alert-danger mt-3 mb-0 py-2 small">{message}</div>
                    ) : null}
                </div>
            ) : message ? (
                <div className="alert alert-danger mb-3 py-2 small">{message}</div>
            ) : null
            }

            {hasFiles ? (
                <div className="d-flex flex-column gap-2">
                    {files.map((f: OrderFile) => {
                        const name = f.name ?? f.base64filename ?? f.originalFileName;
                        const sizeMb = (parseFloat(f.fileSize ?? "0") / 1024 / 1024).toFixed(2)
                        const pdf = isPdf(name ?? "", f.fileType);
                        if (f.documentCategory == "consent_form") {

                            return (
                                <div
                                    key={`${f.position}-${name}`}
                                    className="p-2 border rounded d-flex justify-content-between align-items-center"
                                >
                                    <div className="d-flex align-items-start gap-2">
                                        <i className={`bi ${pdf ? "bi-filetype-pdf" : "bi-image"}`} />
                                        <div>
                                            <div className="fw-semibold">{name}</div>
                                            <div className="small text-secondary">
                                                {sizeMb ? ` ${sizeMb} MB` : ""}
                                            </div>
                                        </div>
                                    </div>

                                    <span className="badge text-bg-success">Uploaded</span>
                                </div>
                            );
                        } else {
                            return null
                        }

                    })}
                </div>
            ) : (
                <div className="small text-secondary">Πάτα + για να ανεβάσεις συνάινεση.</div>
            )}
        </div>
    );
}
