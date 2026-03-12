import { Check } from "lucide-react";
import type { EventStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const steps: { status: EventStatus; label: string; description: string }[] = [
  { status: "borrador", label: "Borrador", description: "Evento creado" },
  { status: "invitaciones_enviadas", label: "Invitaciones", description: "Trabajadores invitados" },
  { status: "boletas_pendientes", label: "Boletas", description: "Esperando boletas" },
  { status: "listo_pagar", label: "Listo", description: "Listo para pagar" },
  { status: "pagado", label: "Pagado", description: "Pago completado" },
];

const statusOrder: Record<EventStatus, number> = {
  borrador: 0,
  invitaciones_enviadas: 1,
  boletas_pendientes: 2,
  listo_pagar: 3,
  pagado: 4,
};

interface EventoStepperProps {
  currentStatus: EventStatus;
}

export function EventoStepper({ currentStatus }: EventoStepperProps) {
  const currentOrder = statusOrder[currentStatus];

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const stepOrder = statusOrder[step.status];
        const isCompleted = stepOrder < currentOrder;
        const isCurrent = step.status === currentStatus;
        const isPending = stepOrder > currentOrder;

        return (
          <div key={step.status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "border-2 border-primary bg-primary/10",
                  isPending && "border-2 border-border bg-background"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className={cn("text-xs font-medium", isCurrent ? "text-primary" : "text-muted-foreground")}>
                    {index + 1}
                  </span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-6 mt-1",
                    stepOrder < currentOrder ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
            <div className="pb-1">
              <p className={cn("text-sm font-medium", isCurrent ? "text-primary" : isPending ? "text-muted-foreground" : "text-foreground")}>
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
