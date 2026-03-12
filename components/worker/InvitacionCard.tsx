"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, DollarSign, Loader2, Check, X } from "lucide-react";
import { formatCLP, formatDate } from "@/lib/utils";
import type { EventWorker } from "@/lib/types";

interface InvitacionCardProps {
  invitation: EventWorker & { event: { name: string; date: string; location?: string } };
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export function InvitacionCard({ invitation, onAccept, onReject }: InvitacionCardProps) {
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  async function handleAccept() {
    setLoading("accept");
    await onAccept(invitation.id);
    setLoading(null);
  }

  async function handleReject() {
    setLoading("reject");
    await onReject(invitation.id);
    setLoading(null);
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold">{invitation.event?.name}</h3>
          {invitation.role_description && (
            <p className="text-xs text-primary mt-0.5">{invitation.role_description}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {invitation.event?.date ? formatDate(invitation.event.date) : "—"}
          </div>
          {invitation.event?.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {invitation.event.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
            {formatCLP(invitation.net_amount)} neto
            <span className="text-xs text-muted-foreground font-normal">
              ({formatCLP(invitation.gross_amount)} bruto)
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={handleReject}
          disabled={!!loading}
        >
          {loading === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="mr-1.5 h-4 w-4" />}
          Rechazar
        </Button>
        <Button size="sm" className="flex-1" onClick={handleAccept} disabled={!!loading}>
          {loading === "accept" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}
          Aceptar
        </Button>
      </CardFooter>
    </Card>
  );
}
