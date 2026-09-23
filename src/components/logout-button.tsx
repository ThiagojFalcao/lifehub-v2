"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="rounded border px-3 py-1.5 text-sm"
      onClick={() =>
        authClient.signOut().then(() => {
          router.push("/login");
        })
      }
    >
      Sair
    </button>
  );
}
