"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { formatCLP } from "@/lib/utils";

interface ApprovePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  totalGross: number;
  totalRetention: number;
  totalNet: number;
  workerCount: number;
}

export function ApprovePaymentDialog({
  open,
  onClose,
  onConfirm,
  isPending,
  totalGross,
  totalRetention,
  totalNet,
  workerCount,
}: ApprovePaymentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Aprobar pago masivo</AlertDialogTitle>
          <AlertDialogDescription>
            Se procesarán transferencias para {workerCount} trabajador{workerCount !== 1 ? "es" : ""}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 my-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total bruto</span>
            <span>{formatCLP(totalGross)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Retención 10.75%</span>
            <span className="text-destructive">- {formatCLP(totalRetention)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-semibold">
            <span>Total neto a pagar</span>
            <span className="text-primary">{formatCLP(totalNet)}</span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar pago
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
