import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { formatCLP } from "@/lib/utils";
import type { Boleta } from "@/lib/types";

const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface BoletaItemProps {
  boleta: Boleta;
}

export function BoletaItem({ boleta }: BoletaItemProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-border">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <FileText className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm">{boleta.folio}</p>
          <Badge variant={boleta.sii_status === "emitida" ? "default" : boleta.sii_status === "anulada" ? "destructive" : "outline"}>
            {boleta.sii_status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {MONTH_NAMES[boleta.period_month]} {boleta.period_year}
        </p>
        <div className="flex gap-4 mt-2">
          <div>
            <p className="text-xs text-muted-foreground">Bruto</p>
            <p className="text-sm font-medium">{formatCLP(boleta.gross_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Retención</p>
            <p className="text-sm font-medium text-destructive">-{formatCLP(boleta.retention_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Neto</p>
            <p className="text-sm font-semibold text-primary">{formatCLP(boleta.net_amount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
