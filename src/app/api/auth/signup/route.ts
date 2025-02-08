import { db } from "@/server/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";


interface NewUserResponse{
    success: boolean,
    user_id?: string,
    error_code?:string,
    error_message?:string

}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, firstName, lastName, userType } = body;



        const result = await db.execute<{ new_user: NewUserResponse }>(
            sql`SELECT new_user(
              ${email}::TEXT,
              ${password}::TEXT,
              ${firstName}::VARCHAR(50),
              ${lastName}::VARCHAR(50),
              ${userType}::user_type
            )`
        );

        const signupResult = result.rows[0].new_user;

        if (!signupResult?.success) {
            return NextResponse.json({ success: false, error_message: signupResult?.error_message || "Signup 123" }, { status: 400 });
        }

        return NextResponse.json({ success: true, user_id: signupResult?.user_id });

    } catch (error) {
        console.error("Signup API error:", error);
        return NextResponse.json({ success: false, error_message: "Internal server error" }, { status: 500 });
    }
} 