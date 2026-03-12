export type UserRole = "empresa" | "trabajador";

export type EventStatus =
  | "borrador"
  | "invitaciones_enviadas"
  | "boletas_pendientes"
  | "listo_pagar"
  | "pagado";

export type WorkerStatus =
  | "invitado"
  | "aceptado"
  | "rechazado"
  | "boleta_emitida"
  | "pagado";

export type PaymentStatus = "pendiente" | "procesando" | "completado" | "fallido";

export type SIIStatus = "borrador" | "emitida" | "anulada";

export type BankAccountType =
  | "cuenta_corriente"
  | "cuenta_vista"
  | "cuenta_rut"
  | "cuenta_ahorro";

export interface Organization {
  id: string;
  name: string;
  rut: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  organization_id?: string;
  role: UserRole;
  full_name: string;
  rut?: string;
  email: string;
  phone?: string;
  bank_name?: string;
  bank_account_type?: BankAccountType;
  bank_account_number?: string;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organization_id: string;
  name: string;
  date: string;
  location?: string;
  description?: string;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface EventWorker {
  id: string;
  event_id: string;
  worker_id: string;
  role_description?: string;
  gross_amount: number;
  retention_amount: number;
  net_amount: number;
  status: WorkerStatus;
  invited_at: string;
  responded_at?: string;
  // Joined fields
  worker?: Profile;
  event?: Event;
}

export interface Boleta {
  id: string;
  event_worker_id: string;
  worker_id: string;
  organization_id: string;
  folio: string;
  gross_amount: number;
  retention_amount: number;
  net_amount: number;
  period_year: number;
  period_month: number;
  sii_status: SIIStatus;
  emitted_at: string;
  created_at: string;
  // Joined fields
  worker?: Profile;
}

export interface Payment {
  id: string;
  organization_id: string;
  event_id: string;
  total_gross: number;
  total_retention: number;
  total_net: number;
  worker_count: number;
  status: PaymentStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  // Joined fields
  event?: Event;
}

export interface PaymentItem {
  id: string;
  payment_id: string;
  event_worker_id: string;
  worker_id: string;
  boleta_id?: string;
  gross_amount: number;
  retention_amount: number;
  net_amount: number;
  bank_name?: string;
  bank_account_number?: string;
  status: PaymentStatus;
  processed_at?: string;
  created_at: string;
  // Joined fields
  worker?: Profile;
}

export interface F29Declaration {
  id: string;
  organization_id: string;
  period_year: number;
  period_month: number;
  total_gross: number;
  total_retention: number;
  boleta_count: number;
  status: "pendiente" | "declarado" | "pagado";
  generated_at: string;
  declared_at?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalEventos: number;
  eventosActivos: number;
  totalTrabajadores: number;
  totalPagado: number;
  eventosRecientes: Event[];
}
