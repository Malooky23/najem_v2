'use server'
import {db} from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";   


export async function getUsername(userId: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.userId, userId),
        columns: {
            username: true,
        },
    });
    return user?.username;
}