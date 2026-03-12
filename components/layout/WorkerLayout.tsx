"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Bell, FileText, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/worker", label: "Inicio", icon: Home },
  { href: "/worker/invitaciones", label: "Invitaciones", icon: Bell },
  { href: "/worker/boletas", label: "Boletas", icon: FileText },
  { href: "/worker/perfil", label: "Perfil", icon: User },
];

export function WorkerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">H</span>
          </div>
          <span className="text-base font-bold text-primary">HonorPay</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border max-w-lg mx-auto">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/worker" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
