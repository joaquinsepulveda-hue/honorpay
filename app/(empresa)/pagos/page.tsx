"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatCLP, formatDate } from "@/lib/utils";
import type { Payment } from "@/lib/types";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendiente: { label: "Pendiente", variant: "outline" },
  procesando: { label: "Procesando", variant: "secondary" },
  completado: { label: "Completado", variant: "default" },
  fallido: { label: "Fallido", variant: "destructive" },
};

export default function PagosPage() {
  const [orgId, setOrgId] = useState<string | undefined>();

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(({ profile }) => {
      setOrgId(profile?.organization_id ?? undefined);
    });
  }, []);

  const { data: pagos, isLoading } = useQuery({
    queryKey: ["pagos", orgId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("payments")
        .select("*, event:events(name, date)")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (Payment & { event: { name: string; date: string } })[];
    },
    enabled: !!orgId,
  });

  return (
    <div>
      <PageHeader
        title="Historial de pagos"
        description="Registro de pagos masivos procesados"
      />

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      )}

      {!isLoading && pagos && pagos.length > 0 && (
        <div className="space-y-3">
          {pagos.map((pago) => {
            const status = statusConfig[pago.status] ?? { label: pago.status, variant: "outline" as const };
            return (
              <Card key={pago.id}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{pago.event?.name ?? "Evento"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pago.event?.date ? formatDate(pago.event.date) : "—"} · {pago.worker_count} trabajadores
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-sm">{formatCLP(pago.total_net)}</p>
                      <p className="text-xs text-muted-foreground">neto pagado</p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && (!pagos || pagos.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Sin pagos registrados</p>
          <p className="text-sm mt-1">Los pagos aprobados en eventos aparecerán aquí</p>
        </div>
      )}
    </div>
  );
}
