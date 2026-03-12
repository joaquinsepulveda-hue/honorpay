"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InvitacionCard } from "@/components/worker/InvitacionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/hooks/use-toast";
import type { EventWorker } from "@/lib/types";

type InvitacionWithEvent = EventWorker & { event: { name: string; date: string; location?: string } };

export default function InvitacionesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    }
    load();
  }, []);

  const { data: invitaciones, isLoading } = useQuery({
    queryKey: ["invitaciones", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("event_workers")
        .select(`*, event:events(name, date, location)`)
        .eq("worker_id", userId!)
        .eq("status", "invitado")
        .order("invited_at", { ascending: false });
      if (error) throw error;
      return data as InvitacionWithEvent[];
    },
    enabled: !!userId,
  });

  async function handleAccept(id: string) {
    const supabase = createClient();
    await supabase
      .from("event_workers")
      .update({ status: "aceptado", responded_at: new Date().toISOString() })
      .eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["invitaciones", userId] });
    queryClient.invalidateQueries({ queryKey: ["pending-invitations", userId] });
    toast({ title: "Invitación aceptada", description: "¡Fuiste agregado al evento!" });
  }

  async function handleReject(id: string) {
    const supabase = createClient();
    await supabase
      .from("event_workers")
      .update({ status: "rechazado", responded_at: new Date().toISOString() })
      .eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["invitaciones", userId] });
    queryClient.invalidateQueries({ queryKey: ["pending-invitations", userId] });
    toast({ title: "Invitación rechazada" });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Invitaciones</h1>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      )}

      {!isLoading && invitaciones && invitaciones.length > 0 && (
        <div className="space-y-3">
          {invitaciones.map(inv => (
            <InvitacionCard
              key={inv.id}
              invitation={inv}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {!isLoading && (!invitaciones || invitaciones.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Sin invitaciones pendientes</p>
          <p className="text-sm mt-1">Las nuevas invitaciones aparecerán aquí</p>
        </div>
      )}
    </div>
  );
}
