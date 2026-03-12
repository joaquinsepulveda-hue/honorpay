import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HonorPay — Acceso",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">H</span>
            </div>
            <span className="text-2xl font-bold text-primary">HonorPay</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Gestión de boletas de honorarios para eventos
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
