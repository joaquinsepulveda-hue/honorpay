import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get profile + org
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "empresa") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createServiceClient();

  // Get all accepted workers with boletas emitidas
  const { data: workers, error: workersError } = await service
    .from("event_workers")
    .select(`
      id, worker_id, gross_amount, retention_amount, net_amount,
      worker:profiles(id, full_name, bank_name, bank_account_number, bank_account_type)
    `)
    .eq("event_id", eventId)
    .in("status", ["boleta_emitida"]);

  if (workersError || !workers || workers.length === 0) {
    return NextResponse.json({ error: "No hay trabajadores con boletas emitidas" }, { status: 400 });
  }

  const totalGross = workers.reduce((s, w) => s + w.gross_amount, 0);
  const totalRetention = workers.reduce((s, w) => s + w.retention_amount, 0);
  const totalNet = workers.reduce((s, w) => s + w.net_amount, 0);

  // Create payment record
  const { data: payment, error: paymentError } = await service
    .from("payments")
    .insert({
      organization_id: profile.organization_id,
      event_id: eventId,
      total_gross: totalGross,
      total_retention: totalRetention,
      total_net: totalNet,
      worker_count: workers.length,
      status: "completado",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    return NextResponse.json({ error: "Error al crear el pago" }, { status: 500 });
  }

  // Get boletas for each worker
  const { data: boletas } = await service
    .from("boletas")
    .select("id, event_worker_id")
    .in("event_worker_id", workers.map(w => w.id));

  const boletaMap = new Map(boletas?.map(b => [b.event_worker_id, b.id]) ?? []);

  // Create payment items
  const paymentItems = workers.map(w => ({
    payment_id: payment.id,
    event_worker_id: w.id,
    worker_id: w.worker_id,
    boleta_id: boletaMap.get(w.id) ?? null,
    gross_amount: w.gross_amount,
    retention_amount: w.retention_amount,
    net_amount: w.net_amount,
    bank_name: (w.worker as { bank_name?: string } | null)?.bank_name,
    bank_account_number: (w.worker as { bank_account_number?: string } | null)?.bank_account_number,
    status: "completado",
    processed_at: new Date().toISOString(),
  }));

  await service.from("payment_items").insert(paymentItems);

  // Update event_workers status to pagado
  await service
    .from("event_workers")
    .update({ status: "pagado" })
    .in("id", workers.map(w => w.id));

  // Update event status to pagado
  await service
    .from("events")
    .update({ status: "pagado" })
    .eq("id", eventId);

  return NextResponse.json({ success: true, paymentId: payment.id });
}
