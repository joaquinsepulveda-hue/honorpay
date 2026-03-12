"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArrowLeft, Mail, Phone, Building2, CreditCard } from "lucide-react";
import { useTrabajador } from "@/lib/hooks/useTrabajadores";
import { getInitials } from "@/lib/utils";

const bankTypeLabels: Record<string, string> = {
  cuenta_corriente: "Cuenta Corriente",
  cuenta_vista: "Cuenta Vista",
  cuenta_rut: "Cuenta RUT",
  cuenta_ahorro: "Cuenta Ahorro",
};

export default function TrabajadorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: worker, isLoading } = useTrabajador(id);

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 rounded-lg" /></div>;
  }

  if (!worker) {
    return <p className="text-muted-foreground">Trabajador no encontrado.</p>;
  }

  return (
    <div>
      <PageHeader
        title={worker.full_name}
        description={worker.rut ?? "Sin RUT registrado"}
        actions={
          <Link href="/trabajadores">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />

      <div className="max-w-2xl space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {getInitials(worker.full_name)}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{worker.full_name}</h2>
                <p className="text-muted-foreground text-sm">RUT: {worker.rut ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Contacto</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{worker.email}</span>
            </div>
            {worker.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{worker.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {worker.bank_name && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Datos bancarios</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{worker.bank_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>
                  {worker.bank_account_type ? bankTypeLabels[worker.bank_account_type] : "—"}
                  {worker.bank_account_number ? ` · ${worker.bank_account_number}` : ""}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
