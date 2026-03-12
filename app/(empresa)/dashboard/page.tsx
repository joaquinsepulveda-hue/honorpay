import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, CreditCard, TrendingUp } from "lucide-react";
import { formatCLP, formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Event } from "@/lib/types";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  borrador: { label: "Borrador", variant: "outline" },
  invitaciones_enviadas: { label: "Invitaciones", variant: "secondary" },
  boletas_pendientes: { label: "Boletas pend.", variant: "secondary" },
  listo_pagar: { label: "Listo pagar", variant: "default" },
  pagado: { label: "Pagado", variant: "default" },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("organization_id, full_name, onboarding_complete")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.onboarding_complete) redirect("/onboarding");

  const orgId = profile.organization_id ?? "";

  // Fetch stats in parallel
  const [eventosRes, eventosCountRes, workersRes, pagosRes] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("organization_id", orgId)
      .order("date", { ascending: false })
      .limit(5),
    supabase
      .from("events")
      .select("id", { count: "exact" })
      .eq("organization_id", orgId),
    supabase
      .from("event_workers")
      .select("worker_id", { count: "exact" })
      .in("event_id",
        (await supabase.from("events").select("id").eq("organization_id", orgId)).data?.map(e => e.id) ?? []
      ),
    supabase
      .from("payments")
      .select("total_net")
      .eq("organization_id", orgId)
      .eq("status", "completado"),
  ]);

  const eventos = eventosRes.data ?? [];
  const totalEventos = eventosCountRes.count ?? 0;
  const eventosActivos = eventos.filter(e =>
    ["invitaciones_enviadas", "boletas_pendientes", "listo_pagar"].includes(e.status)
  ).length;
  const totalPagado = (pagosRes.data ?? []).reduce((sum, p) => sum + (p.total_net ?? 0), 0);

  const stats = [
    { label: "Total Eventos", value: totalEventos, icon: CalendarDays, color: "text-primary" },
    { label: "Eventos Activos", value: eventosActivos, icon: TrendingUp, color: "text-primary" },
    { label: "Trabajadores únicos", value: new Set(workersRes.data?.map((w: { worker_id: string }) => w.worker_id)).size, icon: Users, color: "text-primary" },
    { label: "Total Pagado", value: formatCLP(totalPagado), icon: CreditCard, color: "text-primary" },
  ];

  return (
    <div>
      <PageHeader
        title={`Bienvenido, ${profile.full_name}`}
        description="Resumen de tu actividad en HonorPay"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Eventos recientes</CardTitle>
          <Link href="/eventos" className="text-sm text-primary hover:underline">
            Ver todos →
          </Link>
        </CardHeader>
        <CardContent>
          {eventos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay eventos aún.</p>
              <Link href="/eventos/nuevo" className="text-primary hover:underline text-sm mt-1 block">
                Crear primer evento →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {eventos.map((evento: Event) => {
                const statusInfo = statusLabels[evento.status] ?? { label: evento.status, variant: "outline" as const };
                return (
                  <Link
                    key={evento.id}
                    href={`/eventos/${evento.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{evento.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(evento.date)} · {evento.location ?? "Sin lugar"}
                      </p>
                    </div>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
