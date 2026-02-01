"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { loginOk, loginFail } from "@/features/auth/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useAppDispatch();

  const next = params.get("next") || "/";
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const u = username.trim();
    const p = password;

    if (u.length < 2 || p.length < 2) {
      setError("Συμπλήρωσε σωστά στοιχεία σύνδεσης.");
      dispatch(loginFail("Invalid input"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        const msg = data?.message || "Αποτυχία σύνδεσης.";
        setError(msg);
        dispatch(loginFail(msg));
        return;
      }

      dispatch(loginOk({ userInfos: data.userInfos }));
      router.replace(next);
    } catch {
      const msg = "Αποτυχία σύνδεσης. Δοκίμασε ξανά.";
      setError(msg);
      dispatch(loginFail(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-viewport" style={{ minHeight: "100dvh" }}>
      <div className="app-content d-flex align-items-center" style={{ paddingBottom: 24 }}>
        <div className="w-100">
          <div className="text-center mb-3">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm bg-white"
              style={{ width: 56, height: 56 }}
            >
              <i className="bi bi-shield-lock" style={{ fontSize: "1.4rem" }} />
            </div>
            <h1 className="h5 fw-semibold mt-3 mb-1">Σύνδεση</h1>
            <div className="text-secondary small">Συνέχισε για να διαχειριστείς παραγγελίες.</div>
          </div>

          <div className="app-card p-4">
            {error ? <div className="alert alert-danger py-2 small">{error}</div> : null}

            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Username</label>
                <input
                  className="form-control"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input
                  className="form-control"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? (
                  <span className="d-inline-flex align-items-center gap-2">
                    <span className="spinner-border spinner-border-sm" aria-hidden />
                    Συνδέεται…
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-box-arrow-in-right me-2" />
                    Login
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
