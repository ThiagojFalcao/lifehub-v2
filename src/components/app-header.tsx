import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export function AppHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between p-4">
        <h1 className="text-xl font-semibold">
          <Link href="/">LifeHub</Link>
        </h1>
        <LogoutButton />
      </div>
    </header>
  );
}
