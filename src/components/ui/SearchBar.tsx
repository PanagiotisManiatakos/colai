"use client";

import React from "react";

type Props = {
  placeholder?: string;
  value: string;
  onChange: (next: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  className?: string;
};

export function SearchBar({
  placeholder = "Αναζήτηση…",
  value,
  onChange,
  onSubmit,
  onClear,
  autoFocus = false,
  className,
}: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const submit = React.useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      inputRef.current?.blur();
      onSubmit?.();
    },
    [onSubmit]
  );

  const clear = React.useCallback(() => {
    onChange("");
    inputRef.current?.focus();
    onClear?.();
  }, [onChange, onClear]);

  return (
    <form onSubmit={submit} className={className}>
      <div className="input-group">
        <span className="input-group-text bg-transparent border-0 pe-0" aria-hidden>
          <i className="bi bi-search" />
        </span>
        <input
          ref={inputRef}
          className="form-control border-0 ps-2 search-bar"
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoFocus={autoFocus}
          style={{ background: "none" }}
        />
        {value ? (
          <button
            type="button"
            className="btn border-0 d-inline-flex align-items-center justify-content-center"
            onClick={clear}
            aria-label="Καθαρισμός αναζήτησης"
            style={{ maxHeight: 36 }}
          >
            <i className="bi bi-x-lg" />
          </button>
        ) : null}
      </div>
    </form>
  );
}
