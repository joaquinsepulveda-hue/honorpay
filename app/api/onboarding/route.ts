import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { role, ...data } = body;
  const service = createServiceClient();

  if (role === "empresa") {
    const { name, rut, email, phone, address } = data;

    // Create organization
    const { data: org, error: orgError } = await service
      .from("organizations")
      .insert({ name, rut, email, phone, address })
      .select("id")
      .single();

    if (orgError) {
      console.error("Org insert error:", orgError);
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    // Update profile
    const { error: profileError } = await service
      .from("profiles")
      .update({
        organization_id: org.id,
        rut,
        phone,
        onboarding_complete: true,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, redirect: "/dashboard" });
  }

  if (role === "trabajador") {
    const { rut, phone, bankName, bankAccountType, bankAccountNumber, password } = data;

    // Set password so the worker can log in normally later
    if (password) {
      const { error: pwError } = await service.auth.admin.updateUserById(user.id, { password });
      if (pwError) return NextResponse.json({ error: pwError.message }, { status: 500 });
    }

    const { error } = await service
      .from("profiles")
      .update({
        rut,
        phone,
        bank_name: bankName,
        bank_account_type: bankAccountType,
        bank_account_number: bankAccountNumber,
        onboarding_complete: true,
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mark invitation as accepted if exists
    await service
      .from("worker_invitations")
      .update({ status: "accepted", worker_id: user.id, accepted_at: new Date().toISOString() })
      .eq("email", user.email ?? "")
      .eq("status", "pending");

    return NextResponse.json({ success: true, redirect: "/worker" });
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 400 });
}
