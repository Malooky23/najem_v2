/// NEW CLAUDE REWRITE
'use server'
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { createBusinessCustomerSchema } from "@/lib/validations/customer";
import { sql } from "drizzle-orm";
import { revalidateCustomers } from "@/server/queries/customers";

export async function POST(req: Request) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validatedData = createBusinessCustomerSchema.parse(body);

    // Execute database function
    const result = await db.execute<{ result: any }>(sql`
      SELECT new_business_customer(
        ${validatedData.country}::TEXT,
        ${validatedData.businessName}::TEXT,
        ${validatedData.isTaxRegistered}::BOOLEAN,
        ${validatedData.taxNumber}::TEXT,
        ${JSON.stringify(validatedData.address)}::JSONB,
        ${JSON.stringify(validatedData.contacts)}::JSONB
      ) as result
    `);

    // Handle database response
    const dbResult = result.rows[0].result;
    if (dbResult.error_message) {
      return NextResponse.json(
        { success: false, error: dbResult.error_message },
        { status: 400 }
      );
    }

    // Use the helper function instead of direct tag revalidation
    await revalidateCustomers();

    return NextResponse.json({ success: true, data: dbResult });
  } catch (error) {
    console.error("[BUSINESS_CUSTOMER_POST]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}