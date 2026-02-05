"use client";

type Props = {
    disabled?: boolean;
    running?: boolean;
    onClick: () => void;
    label?: string;
};

export default function RunAiButton({ disabled = false, running = false, onClick, label = "Run AI" }: Props) {
    return (
        <button
            type="button"
            className="btn btn-ai d-inline-flex align-items-center justify-content-center gap-2 w-100"
            disabled={disabled || running}
            onClick={onClick}
        >
            <i className={`bi ${running ? "bi-cpu" : "bi-robot"}`} />
            <span>{running ? "AI running…" : label}</span>
            <span className="ai-sparkle" aria-hidden>✦</span>
        </button>
    );
}
