import { DashboardShell } from "@/components/layout/DashboardShell";

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
