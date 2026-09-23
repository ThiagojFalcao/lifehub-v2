"use client";

import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="rounded border px-3 py-1.5 text-sm"
      onClick={() =>
        authClient.signOut().then(() => {
          window.location.href = "/login";
        })
      }
    >
      Sair
    </button>
  );
}
