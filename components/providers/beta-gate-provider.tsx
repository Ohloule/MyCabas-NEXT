"use client";

import { useState, useEffect, type ReactNode } from "react";

const BETA_PASSWORD = "Barthélémy!2025";
const STORAGE_KEY = "mycabas_beta_access";
const ACCESS_TOKEN = "beta_granted_2026_v1";

export function BetaGateProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === ACCESS_TOKEN) {
        setIsAuthenticated(true);
      }
    } catch {
      // localStorage indisponible (navigation privée, etc.)
    }
    setIsChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === BETA_PASSWORD) {
      try {
        localStorage.setItem(STORAGE_KEY, ACCESS_TOKEN);
      } catch {
        // Pas grave, ça marchera quand même pour cette session
      }
      setIsAuthenticated(true);
    } else {
      setError("Mot de passe incorrect");
      setPassword("");
    }
  };

  if (isChecking || !isAuthenticated) {
    return (
      <>
        {/* Overlay mot de passe */}
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--sec-25)]"
          style={{
            backgroundImage: `url("/patterns/food2.svg")`,
            backgroundRepeat: "repeat",
            backgroundSize: "300px",
          }}
        >
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <img
                src="/images/Logo2_Plan de travail 3.svg"
                alt="MyCabas"
                className="h-16"
              />
            </div>

            <h1 className="mb-2 text-center text-xl font-bold text-[var(--prin-700)]">
              Site en phase de test
            </h1>
            <p className="mb-6 text-center text-sm text-gray-500">
              Entrez le mot de passe pour accéder au site
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Mot de passe"
                autoFocus
                className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--prin-500)] focus:ring-2 focus:ring-[var(--prin-200)]"
              />

              {error && (
                <p className="mb-3 text-center text-sm text-red-500">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-[var(--prin-500)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--prin-600)] active:scale-[0.98]"
              >
                Accéder au site
              </button>
            </form>
          </div>
        </div>

        {/* Contenu rendu mais invisible (SEO) */}
        <div style={{ visibility: "hidden", position: "absolute" }} aria-hidden="true">
          {children}
        </div>
      </>
    );
  }

  return <>{children}</>;
}
