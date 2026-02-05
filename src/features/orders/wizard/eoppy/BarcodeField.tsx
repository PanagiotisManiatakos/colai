"use client";

import React from "react";
import { Modal } from "react-bootstrap";

type Props = {
    label: string;
    name?: string;
    value: string;
    onChange: (next: string) => void;
    hint?: string;
    placeholder?: string;
    disabled?: boolean;

    /** Optional: restrict formats if you want */
    formats?: string[];
};

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

export default function BarcodeField({
    label,
    name,
    value,
    onChange,
    hint,
    placeholder,
    disabled,
    formats,
}: Props) {
    const [show, setShow] = React.useState(false);
    const [starting, setStarting] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);

    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const streamRef = React.useRef<MediaStream | null>(null);
    const rafRef = React.useRef<number | null>(null);

    const canScan =
        typeof window !== "undefined" &&
        "mediaDevices" in navigator &&
        typeof navigator.mediaDevices.getUserMedia === "function" &&
        "BarcodeDetector" in window;

    const stop = React.useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            try {
                (videoRef.current as any).srcObject = null;
            } catch { }
        }
        setStarting(false);
    }, []);

    const close = React.useCallback(() => {
        stop();
        setShow(false);
        setErr(null);
    }, [stop]);

    const start = React.useCallback(async () => {
        if (!canScan) {
            setErr("Η σάρωση barcode δεν υποστηρίζεται σε αυτόν τον browser.");
            return;
        }

        setStarting(true);
        setErr(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } },
                audio: false,
            });

            streamRef.current = stream;

            const video = videoRef.current;
            if (!video) throw new Error("No video element");

            (video as any).srcObject = stream;
            await video.play();

            const Detector = (window as any).BarcodeDetector;
            const detector = formats?.length
                ? new Detector({ formats })
                : new Detector(); // let browser decide

            const tick = async () => {
                if (!videoRef.current) return;

                try {
                    const barcodes = await detector.detect(videoRef.current);
                    if (barcodes && barcodes.length > 0) {
                        const raw = barcodes[0]?.rawValue ?? "";
                        if (raw) {
                            onChange(raw);
                            close();
                            return;
                        }
                    }
                } catch {
                    // ignore frame errors
                }

                rafRef.current = requestAnimationFrame(tick);
            };

            rafRef.current = requestAnimationFrame(tick);
        } catch (e: any) {
            setErr(e?.message || "Δεν ήταν δυνατή η πρόσβαση στην κάμερα.");
            stop();
        } finally {
            setStarting(false);
        }
    }, [canScan, close, formats, onChange, stop]);

    React.useEffect(() => {
        if (!show) return;
        void start();
        return () => stop();
    }, [show, start, stop]);

    return (
        <>
            <Field label={label} hint={hint}>
                <div className="input-group">
                    <input
                        className="form-control"
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        inputMode="numeric"
                        placeholder={placeholder}
                        disabled={disabled}
                        autoComplete="off"
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShow(true)}
                        disabled={disabled}
                        aria-label="Scan barcode"
                        title={canScan ? "Scan barcode" : "Barcode scan not supported"}
                    >
                        <i className="bi bi-upc-scan" />
                    </button>
                </div>
            </Field>

            <Modal show={show} onHide={close} centered contentClassName="premium-modal">
                <Modal.Header closeButton>
                    <Modal.Title className="h6 mb-0">Σάρωση Barcode</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {!canScan ? (
                        <div className="alert alert-warning small mb-0">
                            Η σάρωση barcode δεν υποστηρίζεται σε αυτόν τον browser. Χρησιμοποιήστε Chrome/Edge/Android ή
                            πληκτρολογήστε το barcode.
                        </div>
                    ) : (
                        <>
                            <div className="app-card p-2">
                                <div
                                    className="ratio ratio-4x3 overflow-hidden"
                                    style={{ borderRadius: 16 }}
                                >
                                    <video
                                        ref={videoRef}
                                        playsInline
                                        muted
                                        autoPlay
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                </div>

                                <div className="small text-secondary mt-2 px-1">
                                    Στρέψε την κάμερα στο barcode. Η σάρωση γίνεται αυτόματα.
                                </div>
                            </div>

                            {starting ? (
                                <div className="d-flex align-items-center gap-2 small text-secondary mt-3">
                                    <span className="spinner-border spinner-border-sm" aria-hidden />
                                    Εκκίνηση κάμερας…
                                </div>
                            ) : null}

                            {err ? <div className="alert alert-danger small mt-3 mb-0">{err}</div> : null}
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <button type="button" className="btn btn-outline-secondary" onClick={close}>
                        Κλείσιμο
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
