"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { F29ResumenCard } from "@/components/f29/F29ResumenCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import { useF29BoletasByMonth, useF29Declarations } from "@/lib/hooks/useF29";
import { useToast } from "@/lib/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function F29Page() {
  const [orgId, setOrgId] = useState<string | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(({ profile }) => {
      setOrgId(profile?.organization_id ?? undefined);
    });
  }, []);

  const { data: months, isLoading } = useF29BoletasByMonth(orgId);
  const { data: declarations } = useF29Declarations(orgId);

  function getDeclarationForMonth(year: number, month: number) {
    return declarations?.find(d => d.period_year === year && d.period_month === month);
  }

  async function handleGenerate(year: number, month: number) {
    const key = `${year}-${month}`;
    setGenerating(key);
    try {
      const res = await fetch("/api/f29/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month }),
      });
      if (!res.ok) throw new Error("Error");
      queryClient.invalidateQueries({ queryKey: ["f29", orgId] });
      toast({ title: "F29 generado", description: `Declaración ${month}/${year} lista.` });
    } catch {
      toast({ title: "Error", description: "No se pudo generar el F29.", variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="F29 — Declaraciones"
        description="Resumen mensual de retenciones de honorarios para declarar al SII"
      />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      )}

      {!isLoading && months && months.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map((m) => {
            const decl = getDeclarationForMonth(m.year, m.month);
            const key = `${m.year}-${m.month}`;
            return (
              <F29ResumenCard
                key={key}
                year={m.year}
                month={m.month}
                totalGross={m.totalGross}
                totalRetention={m.totalRetention}
                count={m.count}
                declarationStatus={decl?.status}
                onGenerate={!decl ? () => handleGenerate(m.year, m.month) : undefined}
                isGenerating={generating === key}
              />
            );
          })}
        </div>
      )}

      {!isLoading && (!months || months.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Sin datos de F29</p>
          <p className="text-sm mt-1">Las boletas emitidas aparecerán aquí agrupadas por mes</p>
        </div>
      )}
    </div>
  );
}
