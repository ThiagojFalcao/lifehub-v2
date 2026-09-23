"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">LifeHub</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Fundação pronta. O habit tracker chega no Ciclo 2.
      </p>
      <button
        type="button"
        className="mt-4 rounded border px-3 py-2"
        onClick={() =>
          authClient.signOut().then(() => {
            router.push("/login");
            router.refresh();
          })
        }
      >
        Sair
      </button>
    </main>
  );
}
