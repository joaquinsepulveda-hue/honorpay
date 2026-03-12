"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BoletaItem } from "@/components/worker/BoletaItem";
import { useToast } from "@/lib/hooks/use-toast";
import type { Boleta, EventWorker } from "@/lib/types";

type AcceptedEvent = EventWorker & { event: { name: string; organization_id: string } };

export default function BoletasPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emitting, setEmitting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    }
    load();
  }, []);

  const { data: boletas, isLoading: loadingBoletas } = useQuery({
    queryKey: ["worker-boletas", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("boletas")
        .select("*")
        .eq("worker_id", userId!)
        .order("emitted_at", { ascending: false });
      if (error) throw error;
      return data as Boleta[];
    },
    enabled: !!userId,
  });

  const { data: pendingBoletas } = useQuery({
    queryKey: ["worker-pending-boletas", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("event_workers")
        .select(`*, event:events(name, organization_id)`)
        .eq("worker_id", userId!)
        .eq("status", "aceptado");
      if (error) throw error;
      return data as AcceptedEvent[];
    },
    enabled: !!userId,
  });

  async function emitirBoleta(eventWorkerId: string, organizationId: string, grossAmount: number, netAmount: number, retentionAmount: number) {
    setEmitting(eventWorkerId);
    try {
      const res = await fetch("/api/boletas/emitir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventWorkerId, organizationId, grossAmount, netAmount, retentionAmount }),
      });
      if (!res.ok) throw new Error("Error");
      queryClient.invalidateQueries({ queryKey: ["worker-boletas", userId] });
      queryClient.invalidateQueries({ queryKey: ["worker-pending-boletas", userId] });
      toast({ title: "Boleta emitida", description: "Tu boleta fue registrada correctamente." });
    } catch {
      toast({ title: "Error", description: "No se pudo emitir la boleta.", variant: "destructive" });
    } finally {
      setEmitting(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mis boletas</h1>

      {/* Pending to emit */}
      {pendingBoletas && pendingBoletas.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-primary">Boletas pendientes de emitir</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-2">
            {pendingBoletas.map((ew: AcceptedEvent) => (
              <div key={ew.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{ew.event?.name}</p>
                  <p className="text-xs text-muted-foreground">{ew.role_description ?? "Sin rol"}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => emitirBoleta(ew.id, ew.event?.organization_id, ew.gross_amount, ew.net_amount, ew.retention_amount)}
                  disabled={emitting === ew.id}
                >
                  {emitting === ew.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <><Plus className="mr-1.5 h-3.5 w-3.5" />Emitir</>
                  }
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Boletas list */}
      {loadingBoletas && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      )}

      {!loadingBoletas && boletas && boletas.length > 0 && (
        <div className="space-y-3">
          {boletas.map(b => <BoletaItem key={b.id} boleta={b} />)}
        </div>
      )}

      {!loadingBoletas && (!boletas || boletas.length === 0) && (!pendingBoletas || pendingBoletas.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Sin boletas emitidas</p>
          <p className="text-sm mt-1">Acepta eventos para poder emitir boletas</p>
        </div>
      )}
    </div>
  );
}
