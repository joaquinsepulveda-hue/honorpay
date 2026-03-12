import { z } from "zod";

export const eventoSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  date: z.string().min(1, "Fecha requerida"),
  location: z.string().optional(),
  description: z.string().optional(),
});

export type EventoFormData = z.infer<typeof eventoSchema>;
