"use client";

import React from "react";

function uploadWithProgress(fd: FormData, endpoint: string, onProgress?: (pct: number) => void): Promise<any> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", endpoint);
        xhr.responseType = "text";

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
            const text = xhr.responseText || "";
            let json: any = {};
            try { json = text ? JSON.parse(text) : {}; } catch { }
            if (xhr.status >= 200 && xhr.status < 300) resolve(json);
            else reject({ status: xhr.status, data: json, text });
        };

        xhr.onerror = () => reject({ status: 0, data: null, text: "Network error" });
        xhr.send(fd);
    });
}

type Props = {
    orderUid: string;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
    className?: string;
    children?: React.ReactNode;
    position: number;
    endpoint: string;
    document_category?: string;
    setStatus: (f: any) => void;
    setMessage: (f: any) => void;
    setProgress: (f: number) => void
    setUploading: (f: any) => void
    dispatchFileToRedux: (f: any) => void
};

export default function FileUploadButton({
    orderUid,
    accept = "application/pdf,image/*",
    multiple = false,
    disabled = false,
    ariaLabel = "Upload",
    className = "btn-icon-pill",
    children,
    position,
    endpoint,
    document_category = "recipe",
    setMessage,
    setStatus,
    setProgress,
    setUploading,
    dispatchFileToRedux
}: Props) {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    async function handlePick(file: File) {
        if (!orderUid) return;


        setMessage(null);
        setStatus("uploading");
        setProgress(0);

        setUploading({
            name: file.name,
            fileSize: file.size,
            fileType: file.type || "",
        });

        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("order_uid", String(orderUid));
            fd.append("document_category", document_category);
            fd.append("position", String(position));
            fd.append("base64filename", file.name);

            const data = await uploadWithProgress(fd, endpoint, setProgress);

            if (!data || !data?.result || !data?.ok) {
                setStatus("error");
                setMessage(data?.message || "Upload failed");
                return;
            }

            dispatchFileToRedux({
                originalFileName: file.name,
                base64filename: file.name,
                name: file.name,
                position,
                document_category,
                fileSize: String(file.size),
                fileType: file.type,
            }
            )

            setStatus("idle");
            setProgress(0);
            setUploading(null);
        } catch (e: any) {
            console.log(e)
            setStatus("error");
            setProgress(0);
            setMessage(e?.data?.message || e?.text || "Upload failed");
        }
    }

    async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const list = e.target.files;
        if (!list || list.length === 0) return;

        const files = Array.from(list);
        await handlePick(files[0]);

        e.target.value = "";
    }

    return (
        <>
            <button
                type="button"
                className={className}
                aria-label={ariaLabel}
                disabled={disabled}
                style={{ borderRadius: 50 }}
                onClick={() => inputRef.current?.click()}
            >
                {children ?? <i className="bi bi-plus-lg" />}
            </button>

            <input
                ref={inputRef}
                className="d-none"
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
            />
        </>
    );
}
