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
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(rgba(243,239,230,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(243,239,230,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative">
          <p className="section-label">PBG Consulting</p>
          <h1 className="display text-5xl sm:text-6xl leading-[1.02] mt-4">
            Pulse
          </h1>
          <p className="mt-4 max-w-md text-base sm:text-lg text-[var(--muted)] leading-relaxed">
            La vista del dueño: qué está pasando de verdad en tu agencia, no solo
            lo que el teléfono reporta.
          </p>
        </div>
        <div className="relative panel p-5 sm:p-6 max-w-md mt-8 lg:mt-0 rise">
          <p className="text-sm text-[var(--accent)] font-medium">
            Lo que ves aquí cuenta
          </p>
          <p className="mt-2 text-sm sm:text-[15px] text-[var(--paper)]/90 leading-relaxed">
            Solo marcamos una conversación cuando hubo diálogo real. Una llamada
            “contestada” sin prueba no infla tus resultados.
          </p>
        </div>
      </section>

      <section className="flex items-end sm:items-center justify-center p-4 sm:p-8 pb-8">
        <div className="panel w-full max-w-md p-6 sm:p-8 rise">
          <h2 className="display text-3xl">Bienvenido</h2>
          <p className="text-sm text-[var(--muted)] mt-2">
            Accede al panel de tu agencia.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-sm text-[var(--muted)]">Correo</span>
              <input
                className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-black/25 px-4 py-3.5 outline-none focus:border-[var(--accent)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                inputMode="email"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-[var(--muted)]">Contraseña</span>
              <input
                type="password"
                className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-black/25 px-4 py-3.5 outline-none focus:border-[var(--accent)]"
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
              className="w-full rounded-2xl bg-[var(--paper)] text-[var(--ink)] font-semibold py-4 hover:opacity-90 disabled:opacity-60 transition active:scale-[0.99]"
            >
              {loading ? "Entrando…" : "Entrar a Pulse"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
