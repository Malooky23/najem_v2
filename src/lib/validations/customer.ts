import { z } from "zod";
import { contactType } from "@/server/db/schema";

const addressSchema = z.object({
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string(),
  country: z.string(),
  postalCode: z.string().optional(),
});

const contactDetailsSchema = z.object({
  contactType: z.enum(['email', 'mobile', 'landline', 'other']),
  contactData: z.string(),
  isPrimary: z.boolean().default(false),
});

export const createIndividualCustomerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  personalId: z.string().optional(),
  notes: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  address: addressSchema.optional(),
  contactDetails: z.array(contactDetailsSchema).optional(),
});

export const createBusinessCustomerSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  isTaxRegistered: z.boolean().default(false),
  taxRegistrationNumber: z.string().optional(),
  notes: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  address: addressSchema.optional(),
  contactDetails: z.array(contactDetailsSchema).optional(),
});

export type CreateIndividualCustomerInput = z.infer<typeof createIndividualCustomerSchema>;
export type CreateBusinessCustomerInput = z.infer<typeof createBusinessCustomerSchema>;
