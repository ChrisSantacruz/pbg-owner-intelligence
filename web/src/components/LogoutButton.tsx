"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm text-[var(--muted)] hover:text-[var(--paper)] border border-[var(--line)] rounded-full px-4 py-2.5 min-h-11"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
    >
      Cerrar sesión
    </button>
  );
}
