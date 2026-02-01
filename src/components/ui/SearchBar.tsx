"use client";

import { fetchOrders } from "@/features/orders/ordersSlice";
import { useAppDispatch } from "@/store/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

export function SearchBar({ placeholder }: { placeholder: string }) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const qFromUrl = (searchParams.get("search") ?? "").trim();

  React.useEffect(() => {
    setQ(qFromUrl);
  }, [qFromUrl]);

  React.useEffect(() => {
    dispatch(fetchOrders(qFromUrl ? { q: qFromUrl } : undefined));
  }, [dispatch, qFromUrl]);

  function submitSearch(f?: number) {
    const next = f == -1 ? "" : q.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (next) params.set("search", next);
    else params.delete("search");

    inputRef.current?.blur();

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitSearch();
      }}
    >

      <div className="input-group">
        {/* <span className="input-group-text">
          <i className="bi bi-search" />
        </span> */}
        <input
          ref={inputRef}
          className="form-control"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
        />
        {q ? (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setQ("");
              submitSearch(-1);
            }}
            aria-label="Clear"
          >
            <i className="bi bi-x-lg" />
          </button>
        ) : null}
      </div>
    </form>
  );
}
