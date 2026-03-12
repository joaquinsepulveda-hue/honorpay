"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { EventoCard } from "@/components/eventos/EventoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, CalendarDays } from "lucide-react";
import { useEventos } from "@/lib/hooks/useEventos";
import type { Event } from "@/lib/types";

export default function EventosPage() {
  const [orgId, setOrgId] = useState<string | undefined>();

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(({ profile }) => {
      setOrgId(profile?.organization_id ?? undefined);
    });
  }, []);

  const { data: eventos, isLoading } = useEventos(orgId);

  return (
    <div>
      <PageHeader
        title="Eventos"
        description="Gestiona tus eventos y equipos de trabajo"
        actions={
          <Link href="/eventos/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo evento
            </Button>
          </Link>
        }
      />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && eventos && eventos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventos.map((evento: Event) => (
            <EventoCard key={evento.id} evento={evento} />
          ))}
        </div>
      )}

      {!isLoading && (!eventos || eventos.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No hay eventos aún</p>
          <p className="text-sm mt-1">Crea tu primer evento para comenzar</p>
          <Link href="/eventos/nuevo" className="mt-4 inline-block">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear evento
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
