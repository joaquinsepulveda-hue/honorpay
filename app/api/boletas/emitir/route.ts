import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventWorkerId, organizationId, grossAmount, netAmount, retentionAmount } = await request.json();

  if (!eventWorkerId || !organizationId || !grossAmount) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const service = createServiceClient();

  // Verify the worker owns this event_worker record
  const { data: ew } = await service
    .from("event_workers")
    .select("id, worker_id, status, event_id")
    .eq("id", eventWorkerId)
    .eq("worker_id", user.id)
    .single();

  if (!ew) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (ew.status !== "aceptado") {
    return NextResponse.json({ error: "Solo puedes emitir boletas para eventos aceptados" }, { status: 400 });
  }

  // Generate folio
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const randomSuffix = Math.floor(Math.random() * 900000 + 100000);
  const folio = `HP-${year}-${randomSuffix}`;

  // Create boleta
  const { data: boleta, error: boletaError } = await service
    .from("boletas")
    .insert({
      event_worker_id: eventWorkerId,
      worker_id: user.id,
      organization_id: organizationId,
      folio,
      gross_amount: grossAmount,
      retention_amount: retentionAmount,
      net_amount: netAmount,
      period_year: year,
      period_month: month,
      sii_status: "emitida",
      emitted_at: now.toISOString(),
    })
    .select("id, folio")
    .single();

  if (boletaError) {
    return NextResponse.json({ error: "Error al emitir boleta" }, { status: 500 });
  }

  // Update event_worker status
  await service
    .from("event_workers")
    .update({ status: "boleta_emitida" })
    .eq("id", eventWorkerId);

  // Check if all accepted workers have boletas → update event to listo_pagar
  const { data: allWorkers } = await service
    .from("event_workers")
    .select("status")
    .eq("event_id", ew.event_id)
    .neq("status", "rechazado");

  const allHaveBoletas = allWorkers?.every(w => ["boleta_emitida", "pagado"].includes(w.status));
  if (allHaveBoletas) {
    await service.from("events").update({ status: "listo_pagar" }).eq("id", ew.event_id);
  } else {
    // At least one boleta emitted → boletas_pendientes
    await service
      .from("events")
      .update({ status: "boletas_pendientes" })
      .eq("id", ew.event_id)
      .eq("status", "invitaciones_enviadas");
  }

  return NextResponse.json({ success: true, folio: boleta.folio, boletaId: boleta.id });
}
