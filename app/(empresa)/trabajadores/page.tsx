"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, Mail } from "lucide-react";
import { useTrabajadores, useInvitaciones } from "@/lib/hooks/useTrabajadores";
import type { Profile } from "@/lib/types";
import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

const bankAccountLabels: Record<string, string> = {
  cuenta_corriente: "Cta. Corriente",
  cuenta_vista: "Cta. Vista",
  cuenta_rut: "Cta. RUT",
  cuenta_ahorro: "Cta. Ahorro",
};

export default function TrabajadoresPage() {
  const { data: trabajadores, isLoading } = useTrabajadores();
  const { data: invitaciones } = useInvitaciones();

  return (
    <div>
      <PageHeader
        title="Trabajadores"
        description="Directorio de trabajadores registrados en HonorPay"
        actions={
          <Link href="/trabajadores/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo trabajador
            </Button>
          </Link>
        }
      />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      )}

      {!isLoading && trabajadores && trabajadores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trabajadores.map((worker: Profile) => (
            <Link key={worker.id} href={`/trabajadores/${worker.id}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                      {getInitials(worker.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{worker.full_name}</p>
                      <p className="text-xs text-muted-foreground">{worker.rut ?? "Sin RUT"}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{worker.email}</span>
                        </div>
                        {worker.bank_name && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="text-primary/60">
                              {worker.bank_name} · {worker.bank_account_type ? bankAccountLabels[worker.bank_account_type] : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && (!trabajadores || trabajadores.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No hay trabajadores aún</p>
          <p className="text-sm mt-1">Los trabajadores pueden registrarse directamente en HonorPay</p>
        </div>
      )}

      {/* Pending invitations */}
      {invitaciones && invitaciones.filter((i: { status: string }) => i.status === "pending").length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Invitaciones pendientes</h2>
          <div className="space-y-2">
            {invitaciones
              .filter((i: { status: string }) => i.status === "pending")
              .map((inv: { id: string; email: string; invited_at: string }) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{inv.email}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Pendiente</Badge>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
