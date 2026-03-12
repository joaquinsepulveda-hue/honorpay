import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/lib/types";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  borrador: { label: "Borrador", variant: "outline" },
  invitaciones_enviadas: { label: "Invitaciones enviadas", variant: "secondary" },
  boletas_pendientes: { label: "Boletas pendientes", variant: "secondary" },
  listo_pagar: { label: "Listo para pagar", variant: "default" },
  pagado: { label: "Pagado", variant: "default" },
};

interface EventoCardProps {
  evento: Event;
  workerCount?: number;
}

export function EventoCard({ evento, workerCount }: EventoCardProps) {
  const status = statusConfig[evento.status] ?? { label: evento.status, variant: "outline" as const };

  return (
    <Link href={`/eventos/${evento.id}`}>
      <Card className="hover:border-primary/30 transition-colors cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <h3 className="font-semibold text-base truncate">{evento.name}</h3>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(evento.date)}
                </div>
                {evento.location && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {evento.location}
                  </div>
                )}
                {workerCount !== undefined && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {workerCount} trabajador{workerCount !== 1 ? "es" : ""}
                  </div>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
