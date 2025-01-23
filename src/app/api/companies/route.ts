'use server'
import { getAllCompanies } from "@/lib/db/queries";
import { NextResponse } from "next/server";
import { db } from '@/lib/db';
import { company } from '@/lib/db/schema';
import { createCompanySchema } from "@/lib/validations/company";
import { auth } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { ZodError } from "zod";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { error: "You must be logged in to view companies" },
        { status: 401 }
      );
    }

    const companies = await db
      .select()
      .from(company)
      .orderBy(asc(company.compNumber));

    return Response.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return Response.json(
      { error: "An error occurred while fetching companies" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { error: "You must be logged in to create companies" },
        { status: 401 }
      );
    }

    const json = await req.json();
    const body = createCompanySchema.parse(json);

    const [newCompany] = await db.insert(company)
      .values({
        compName: body.compName,
        email: body.email || null,
        trn: body.trn || null,
        mobile: body.mobile || null,
        landline: body.landline || null,
        notes: body.notes || null,
      })
      .returning();

    return Response.json(newCompany);
  } catch (error: unknown) {
    interface CustomError extends Error {
      code?: string | number;
    }

    if (error instanceof ZodError) {
      console.error('Validation error:', error.errors);
      return Response.json(
        { error: 'Invalid company data: ' + error.errors[0].message },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      const customError = error as CustomError;
      if (customError.code === '23505') { // Unique constraint violation
        // Check which unique constraint was violated
        const message = customError.message || '';
        if (message.includes('email')) {
          return Response.json(
            { error: 'A company with this email already exists' },
            { status: 400 }
          );
        }
        if (message.includes('mobile')) {
          return Response.json(
            { error: 'A company with this mobile number already exists' },
            { status: 400 }
          );
        }
        if (message.includes('trn')) {
          return Response.json(
            { error: 'A company with this TRN already exists' },
            { status: 400 }
          );
        }
        return Response.json(
          { error: 'This company already exists' },
          { status: 400 }
        );
      }
    }

    console.error('Error creating company:', error);
    return Response.json(
      { error: 'Failed to create company. Please try again.' },
      { status: 500 }
    );
  }
}

// Add this to handle OPTIONS requests (for CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
  });
} 