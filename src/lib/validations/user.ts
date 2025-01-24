import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  password: z.string().min(6),
  mobileNo1: z.string().min(8).max(15),
  mobileNo2: z.string().min(8).max(15).optional(),
  userType: z.enum(['CUSTOMER', 'COMPANY', 'EMPLOYEE']),
  compId: z.string().uuid().optional(),
  addressId: z.string().uuid().optional(),
});

export const updateUserSchema = createUserSchema.partial();
