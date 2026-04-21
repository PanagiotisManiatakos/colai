"use client";

import React from "react";

type Props = {
    disabled?: boolean;
    running?: boolean;
    onClick: () => void;
    label?: string;
    icon?: React.ReactNode;
};

export default function RunAiButton({
    disabled = false,
    running = false,
    onClick,
    label = "Run AI",
    icon,
}: Props) {
    return (
        <button
            type="button"
            className="btn btn-ai d-inline-flex align-items-center justify-content-center gap-2 w-100"
            disabled={disabled || running}
            onClick={() => onClick()}
        >
            <span>{running ? "AI running…" : label}</span>
            {running ? <i className="bi bi-cpu" /> : (icon ?? <i className="bi bi-robot" />)}
        </button>
    );
}
