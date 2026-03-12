"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, FileText, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatCLP } from "@/lib/utils";

export default function WorkerDashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      setUserName(profile?.full_name ?? "");
    }
    load();
  }, []);

  const { data: pendingInvitations } = useQuery({
    queryKey: ["pending-invitations", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("event_workers")
        .select("id")
        .eq("worker_id", userId!)
        .eq("status", "invitado");
      return data?.length ?? 0;
    },
    enabled: !!userId,
  });

  const { data: earnings } = useQuery({
    queryKey: ["worker-earnings", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("boletas")
        .select("net_amount, gross_amount")
        .eq("worker_id", userId!)
        .eq("sii_status", "emitida");
      const total = (data ?? []).reduce((s, b) => s + b.net_amount, 0);
      return { total, count: data?.length ?? 0 };
    },
    enabled: !!userId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hola, {userName.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Tu panel de actividad</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Bell className="h-4 w-4" />
              <span className="text-xs font-medium">Invitaciones</span>
            </div>
            <p className="text-2xl font-bold">{pendingInvitations ?? 0}</p>
            <p className="text-xs text-muted-foreground">pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Ingresos netos</span>
            </div>
            <p className="text-lg font-bold">{formatCLP(earnings?.total ?? 0)}</p>
            <p className="text-xs text-muted-foreground">{earnings?.count ?? 0} boletas</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Acciones rápidas</h2>
        <Link href="/worker/invitaciones">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Invitaciones</p>
                <p className="text-xs text-muted-foreground">Acepta o rechaza eventos</p>
              </div>
              {pendingInvitations ? (
                <Badge>{pendingInvitations}</Badge>
              ) : null}
            </CardContent>
          </Card>
        </Link>

        <Link href="/worker/boletas">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Mis boletas</p>
                <p className="text-xs text-muted-foreground">Historial y emisión</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
