import { z } from "zod";

export const trabajadorSchema = z.object({
  fullName: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  rut: z.string().min(1, "RUT requerido"),
  phone: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountType: z.enum(["cuenta_corriente", "cuenta_vista", "cuenta_rut", "cuenta_ahorro"]).optional(),
  bankAccountNumber: z.string().optional(),
});

export type TrabajadorFormData = z.infer<typeof trabajadorSchema>;
