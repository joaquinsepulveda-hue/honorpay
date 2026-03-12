"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { EventoStepper } from "@/components/eventos/EventoStepper";
import { AddWorkerDialog } from "@/components/eventos/AddWorkerDialog";
import { ApprovePaymentDialog } from "@/components/eventos/ApprovePaymentDialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  CreditCard,
} from "lucide-react";
import { useEvento, useEventWorkers } from "@/lib/hooks/useEventos";
import { useToast } from "@/lib/hooks/use-toast";
import { formatCLP, formatDate } from "@/lib/utils";
import type { EventWorker, EventStatus } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

const workerStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  invitado: { label: "Invitado", variant: "outline" },
  aceptado: { label: "Aceptado", variant: "secondary" },
  rechazado: { label: "Rechazado", variant: "destructive" },
  boleta_emitida: { label: "Boleta emitida", variant: "default" },
  pagado: { label: "Pagado", variant: "default" },
};

export default function EventoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addWorkerOpen, setAddWorkerOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  const { data: evento, isLoading: loadingEvento, error: eventoError } = useEvento(id);
  const { data: workers, isLoading: loadingWorkers } = useEventWorkers(id);

  const totalGross = workers?.filter(w => w.status !== "rechazado").reduce((s, w) => s + w.gross_amount, 0) ?? 0;
  const totalRetention = workers?.filter(w => w.status !== "rechazado").reduce((s, w) => s + w.retention_amount, 0) ?? 0;
  const totalNet = workers?.filter(w => w.status !== "rechazado").reduce((s, w) => s + w.net_amount, 0) ?? 0;
  const acceptedCount = workers?.filter(w => ["aceptado", "boleta_emitida", "pagado"].includes(w.status)).length ?? 0;


  async function handleApprovePayment() {
    if (!evento) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/eventos/${evento.id}/aprobar-pago`, { method: "POST" });
      if (!res.ok) throw new Error("Error al aprobar pago");
      queryClient.invalidateQueries({ queryKey: ["evento", id] });
      queryClient.invalidateQueries({ queryKey: ["event-workers", id] });
      toast({ title: "Pago aprobado", description: "El pago masivo fue procesado correctamente." });
      setApproveOpen(false);
    } catch {
      toast({ title: "Error", description: "No se pudo aprobar el pago.", variant: "destructive" });
    } finally {
      setApproving(false);
    }
  }

  if (loadingEvento) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="space-y-1">
        <p className="text-muted-foreground">Evento no encontrado.</p>
        {eventoError && (
          <p className="text-xs text-destructive font-mono">{JSON.stringify(eventoError)}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={evento.name}
        description={`${formatDate(evento.date)}${evento.location ? ` · ${evento.location}` : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/eventos">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
            {evento.status === "listo_pagar" && (
              <Button onClick={() => setApproveOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Aprobar pago
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stepper sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Flujo del evento</CardTitle>
            </CardHeader>
            <CardContent>
              <EventoStepper currentStatus={evento.status as EventStatus} />
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Resumen económico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bruto</span>
                <span>{formatCLP(totalGross)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retención</span>
                <span className="text-destructive">- {formatCLP(totalRetention)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-border pt-2">
                <span>Neto</span>
                <span className="text-primary">{formatCLP(totalNet)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workers list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">
                Trabajadores ({workers?.length ?? 0})
              </CardTitle>
              {evento.status !== "pagado" && (
                <Button size="sm" onClick={() => setAddWorkerOpen(true)}>
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Agregar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loadingWorkers && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
              )}

              {!loadingWorkers && workers && workers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No hay trabajadores en este evento.</p>
                  <button
                    onClick={() => setAddWorkerOpen(true)}
                    className="text-primary hover:underline text-sm mt-1"
                  >
                    Agregar el primero →
                  </button>
                </div>
              )}

              {!loadingWorkers && workers && workers.length > 0 && (
                <div className="space-y-3">
                  {workers.map((ew: EventWorker) => {
                    const statusInfo = workerStatusConfig[ew.status] ?? { label: ew.status, variant: "outline" as const };
                    return (
                      <div
                        key={ew.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {ew.worker?.full_name?.charAt(0) ?? "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{ew.worker?.full_name ?? "Trabajador"}</p>
                            <p className="text-xs text-muted-foreground">
                              {ew.role_description ?? "Sin rol"} · {formatCLP(ew.gross_amount)} bruto
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatCLP(ew.net_amount)} neto</span>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddWorkerDialog
        open={addWorkerOpen}
        onClose={() => setAddWorkerOpen(false)}
        eventId={id}
      />

      <ApprovePaymentDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleApprovePayment}
        isPending={approving}
        totalGross={totalGross}
        totalRetention={totalRetention}
        totalNet={totalNet}
        workerCount={acceptedCount}
      />
    </div>
  );
}
