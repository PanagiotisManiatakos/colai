"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadCustomerAddressesAsync, setDraftProperty, setDraftSyntagiUploaded } from "@/features/orders/ordersSlice";
import FileUploadButton from "./FileUploadButton";
import RunAiButton from "./RunAIButton";
import { Order, OrderFile } from "@/types/orders";

type UploadStatus = "idle" | "uploading" | "error";
type AiStatus = "idle" | "running" | "done" | "error";

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

export default function GnomateuseisArea({ goTo }: { goTo: (x: number) => void }) {
    const dispatch = useAppDispatch();

    const files = useAppSelector((s: any) => s.orders?.draft?.files ?? []);
    const orderUid = useAppSelector((s: any) => s.orders?.draft?.order?.uid);
    const order = useAppSelector<Order>((s: any) => s.orders.draft.order);
    const group_EOPPY_id = useAppSelector((s: any) => s.orders?.draft?.order?.group_EOPPY_id);

    const [status, setStatus] = React.useState<UploadStatus>("idle");
    const [statusExtra, setStatusExtra] = React.useState<UploadStatus>("idle");
    const [progress, setProgress] = React.useState<number>(0);
    const [progressExtra, setProgressExtra] = React.useState<number>(0);

    const [message, setMessage] = React.useState<string | null>(null);
    const [messageExtra, setMessageExtra] = React.useState<string | null>(null);
    const [aiStatus, setAiStatus] = React.useState<AiStatus>("idle");
    const [aiMessage, setAiMessage] = React.useState<string | null>(null);

    const [uploading, setUploading] = React.useState<UploadingInfo | null>(null);
    const [uploadingExtra, setUploadingExtra] = React.useState<UploadingInfo | null>(null);

    React.useEffect(() => {
        dispatch(setDraftProperty({ key: "type", value: "eoppy" }));
    }, [dispatch]);

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
            }

            setAiStatus("done");
            goTo(1)
        } catch (e: any) {
            setAiStatus("error");
            setAiMessage(e?.name === "AbortError" ? "AI request timed out." : (e?.message || "AI request failed"));
        } finally {
            window.clearTimeout(t);
        }
    }

    const isUploadingNow = status === "uploading";
    const isUploadingNowExtra = statusExtra === "uploading";
    const hasFiles = files.some((o: any) => o?.document_category === "recipe");
    const hasAuxFiles = files.some((o: any) => o?.document_category === "recipe_aux");

    return (
        <>
            <div className="app-card p-4">
                <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                    <div className="fw-semibold">Αρχεία</div>

                    <div className="d-flex align-items-center gap-2">
                        {hasFiles ? (
                            <RunAiButton
                                running={aiStatus === "running"}
                                disabled={isUploadingNow}
                                onClick={runAi}
                                label="Run AI"
                            />
                        ) : null}

                        <FileUploadButton
                            ariaLabel="Προσθήκη"
                            disabled={isUploadingNow || aiStatus === "running"}
                            accept="application/pdf,image/*"
                            dispatchFileToRedux={(d: any) => dispatch(setDraftSyntagiUploaded(d))}
                            position={files.length}
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

                {aiStatus === "running" ? (
                    <div className="p-3 border rounded mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <div
                                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light border"
                                style={{ width: 44, height: 44 }}
                            >
                                <i className="bi bi-robot" style={{ fontSize: "1.2rem" }} />
                            </div>
                            <div>
                                <div className="fw-semibold">
                                    Το AI αναλύει τα αρχεία <span className="ai-dots" />
                                </div>
                                <div className="small text-secondary">Παρακαλώ περιμένετε…</div>
                            </div>
                        </div>

                        <div className="progress mt-3" style={{ height: 10 }}>
                            <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" style={{ width: "100%" }} />
                        </div>
                    </div>
                ) : aiStatus === "error" ? (
                    <div className="alert alert-danger py-2 small mb-3">{aiMessage}</div>
                ) : null}

                {hasFiles ? (
                    <div className="d-flex flex-column gap-2">
                        {files.map((f: OrderFile) => {
                            const name = f.name ?? f.base64filename ?? f.originalFileName;
                            const sizeMb = (parseFloat(f.fileSize ?? "0") / 1024 / 1024).toFixed(2)
                            const pdf = isPdf(name ?? "", f.fileType);

                            if (f.document_category == "recipe") {
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
                    <div className="small text-secondary">Πάτα + για να ανεβάσεις νέα γνωμάτευση.</div>
                )}
            </div>
            <div className="app-card p-4 mt-3">
                <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                    <div className="fw-semibold">Συμπληρωματικά αρχεία</div>

                    <div className="d-flex align-items-center gap-2">
                        <FileUploadButton
                            ariaLabel="Προσθήκη"
                            disabled={isUploadingNowExtra}
                            accept="application/pdf,image/*"
                            dispatchFileToRedux={(d: any) => dispatch(setDraftSyntagiUploaded(d))}
                            position={files.length}
                            setMessage={(s: any) => setMessageExtra(s)}
                            setProgress={(i: number) => setProgressExtra(i)}
                            orderUid={orderUid}
                            setUploading={(s: any) => setUploadingExtra(s)}
                            setStatus={(s: any) => setStatusExtra(s)}
                            endpoint="/api/orders/file"
                            document_category="recipe_aux"
                        >
                            {isUploadingNowExtra ? (
                                <span className="spinner-border spinner-border-sm" aria-hidden />
                            ) : (
                                <i className="bi bi-plus-lg" />
                            )}
                        </FileUploadButton>
                    </div>
                </div>

                {uploadingExtra ? (
                    <div className="p-3 border rounded mb-3">
                        <div className="d-flex align-items-start justify-content-between">
                            <div className="d-flex gap-2">
                                <i className={`bi ${isPdf(uploadingExtra.name, uploadingExtra.fileType) ? "bi-filetype-pdf" : "bi-image"}`} />
                                <div>
                                    <div className="fw-semibold">{uploadingExtra.name}</div>
                                    <div className="small text-secondary">
                                        {`${(uploadingExtra.fileSize / 1024 / 1024).toFixed(2)} MB`}
                                    </div>
                                </div>
                            </div>

                            <div className="small text-secondary">{progressExtra}%</div>
                        </div>

                        <div className="progress mt-2" style={{ height: 10 }}>
                            <div
                                className={`progress-bar ${statusExtra === "error" ? "bg-danger" : "bg-success"}`}
                                role="progressbar"
                                style={{ width: `${statusExtra === "error" ? 100 : statusExtra}%` }}
                                aria-valuenow={statusExtra === "error" ? 100 : progressExtra}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
                        </div>

                        {messageExtra ? (
                            <div className="alert alert-danger mt-3 mb-0 py-2 small">{messageExtra}</div>
                        ) : null}
                    </div>
                ) : messageExtra ? (
                    <div className="alert alert-danger mb-3 py-2 small">{messageExtra}</div>
                ) : null
                }

                {hasAuxFiles ? (
                    <div className="d-flex flex-column gap-2">
                        {files.map((f: OrderFile) => {
                            const name = f.name ?? f.base64filename ?? f.originalFileName;
                            const sizeMb = (parseFloat(f.fileSize ?? "0") / 1024 / 1024).toFixed(2)
                            const pdf = isPdf(name ?? "", f.fileType);

                            if (f.document_category == "recipe_aux") {
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
                    <div className="small text-secondary">Πάτα + για να ανεβάσεις extra αρχεία.</div>
                )}
            </div>
        </>
    );
}