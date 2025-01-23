import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });
  return user;
}

export async function getUserByEmail(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return user;
}

export async function updateUser(userId: string, data: Partial<typeof users.$inferInsert>) {
  const updatedUser = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.userId, userId))
    .returning();
  return updatedUser[0];
} 