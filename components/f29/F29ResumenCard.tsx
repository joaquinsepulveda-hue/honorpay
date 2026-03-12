"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Copy, Check } from "lucide-react";
import { formatCLP } from "@/lib/utils";

const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface F29ResumenCardProps {
  year: number;
  month: number;
  totalGross: number;
  totalRetention: number;
  count: number;
  onGenerate?: () => void;
  isGenerating?: boolean;
  declarationStatus?: string;
}

export function F29ResumenCard({
  year,
  month,
  totalGross,
  totalRetention,
  count,
  onGenerate,
  isGenerating,
  declarationStatus,
}: F29ResumenCardProps) {
  const [copied, setCopied] = useState(false);

  function copyF29Text() {
    const text = `F29 — ${MONTH_NAMES[month]} ${year}
Boletas emitidas: ${count}
Base imponible: ${formatCLP(totalGross)}
Retención 10.75%: ${formatCLP(totalRetention)}
PPM a declarar: ${formatCLP(totalRetention)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold">
              {MONTH_NAMES[month]} {year}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {count} boleta{count !== 1 ? "s" : ""} emitida{count !== 1 ? "s" : ""}
            </p>
          </div>
          {declarationStatus && (
            <Badge variant={declarationStatus === "declarado" || declarationStatus === "pagado" ? "default" : "outline"}>
              {declarationStatus}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base imponible</span>
            <span>{formatCLP(totalGross)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>PPM (10.75%)</span>
            <span className="text-primary">{formatCLP(totalRetention)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        <Button variant="outline" size="sm" onClick={copyF29Text} className="flex-1">
          {copied ? <Check className="mr-2 h-3.5 w-3.5" /> : <Copy className="mr-2 h-3.5 w-3.5" />}
          {copied ? "Copiado" : "Copiar datos"}
        </Button>
        {onGenerate && !declarationStatus && (
          <Button size="sm" onClick={onGenerate} disabled={isGenerating} className="flex-1">
            <FileText className="mr-2 h-3.5 w-3.5" />
            Generar F29
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
