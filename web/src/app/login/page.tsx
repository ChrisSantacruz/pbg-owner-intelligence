"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@pbg.agency");
  const [password, setPassword] = useState("pulse2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("No pudimos validar esas credenciales.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(243,239,230,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(243,239,230,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative">
          <p className="text-xs tracking-[0.22em] uppercase text-[var(--muted)]">
            PBG Consulting
          </p>
          <h1 className="display text-6xl leading-[1.05] mt-6 max-w-xl">
            Pulse
          </h1>
          <p className="mt-5 max-w-md text-lg text-[var(--muted)]">
            Inteligencia para el dueño de agencia. Separa señal de ruido antes de
            tomar decisiones de coaching, presupuesto y hiring.
          </p>
        </div>
        <div className="relative panel p-6 max-w-md rise">
          <p className="text-sm text-[var(--accent)] font-medium">
            Regla de confianza
          </p>
          <p className="mt-2 text-[var(--paper)]/90 leading-relaxed">
            Una conversación real se confirma por disposición humana adecuada o
            por ≥4 turnos de speakers. Un{" "}
            <span className="text-[var(--danger)]">carrier answered</span> solo
            no prueba nada.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="panel w-full max-w-md p-8 rise">
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--muted)] lg:hidden">
            PBG · Pulse
          </p>
          <h2 className="display text-3xl mt-2">Entrar como dueño</h2>
          <p className="text-sm text-[var(--muted)] mt-2">
            Auth demo con JWT (httpOnly cookie, HS256, 8h).
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm text-[var(--muted)]">Email</span>
              <input
                className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-black/20 px-4 py-3 outline-none focus:border-[var(--accent)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-[var(--muted)]">Password</span>
              <input
                type="password"
                className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-black/20 px-4 py-3 outline-none focus:border-[var(--accent)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {error ? (
              <p className="text-sm text-[var(--danger)]">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--paper)] text-[var(--ink)] font-semibold py-3.5 hover:opacity-90 disabled:opacity-60 transition"
            >
              {loading ? "Validando…" : "Abrir Pulse"}
            </button>
          </form>

          <p className="mt-5 text-xs text-[var(--muted)] leading-relaxed">
            Demo: <code>owner@pbg.agency</code> / <code>pulse2026</code>
          </p>
        </div>
      </section>
    </main>
  );
}
