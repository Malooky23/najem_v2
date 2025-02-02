/// NEW CLAUDE REWRITE
'use server'
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { createIndividualCustomerSchema } from "@/lib/validations/customer";
import { sql } from "drizzle-orm";
import { revalidateCustomers } from "@/server/queries/customers";
import { apiGuardEmployee, UnauthorizedError} from "@/app/utils/isEmployee";

export async function POST(req: Request) {
  try {
    // Combined auth and employee check
    await apiGuardEmployee();

    // Validate request body
    const body = await req.json();
    // const validatedData = createIndividualCustomerSchema.parse(body);
    const validatedData = body;


    // Execute database function
    const result = await db.execute<{ result: any }>(sql`
      SELECT test_new_individual_customer(
        ${validatedData.firstName}::TEXT,
        ${validatedData.middleName}::TEXT,
        ${validatedData.lastName}::TEXT,
        ${validatedData.personalId}::TEXT,
        ${validatedData.country}::TEXT,
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
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    console.error("[BUSINESS_CUSTOMER_POST]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}