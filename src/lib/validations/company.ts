import { z } from "zod";

export const createCompanySchema = z.object({
  compName: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  trn: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  landline: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>; 