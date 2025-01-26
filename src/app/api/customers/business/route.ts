import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { customers, businessCustomers, contactDetails, addressDetails, entityContactDetails, entityAddresses } from "@/server/db/schema";
import { createBusinessCustomerSchema } from "@/lib/validations/customer";

import { Pool, neonConfig } from '@neondatabase/serverless';


export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = createBusinessCustomerSchema.parse(body);

    const result = await db.transaction(async (tx) => {
      // Create customer
      const customer = await tx
        .insert(customers)
        .values({
          customerType: 'BUSINESS',
          country: validatedData.country,
        })
        .returning({ customerId: customers.customerId });

      // Create business customer
      const business = await tx
        .insert(businessCustomers)
        .values({
          businessCustomerId: customer[0].customerId,
          businessName: validatedData.businessName,
          isTaxRegistered: validatedData.isTaxRegistered,
          taxNumber: validatedData.taxRegistrationNumber ?? null,
        })
        .returning();

      // Create address if provided
      if (validatedData.address) {
        const address = await tx
          .insert(addressDetails)
          .values({
            ...validatedData.address,
          })
          .returning({ addressId: addressDetails.addressId });

        await tx.insert(entityAddresses).values({
          entityId: customer[0].customerId,
          entityType: 'CUSTOMER',
          addressId: address[0].addressId,
          addressType: 'PRIMARY',
        });
      }

      // Create contact details if provided
      if (validatedData.contactDetails?.length) {
        for (const contact of validatedData.contactDetails) {
          const contactDetail = await tx
            .insert(contactDetails)
            .values({
              ...contact,
            })
            .returning({ contactDetailsId: contactDetails.contactDetailsId });

          await tx.insert(entityContactDetails).values({
            entityId: customer[0].customerId,
            entityType: 'CUSTOMER',
            contactDetailsId: contactDetail[0].contactDetailsId,
          });
        }
      }

      return { customer: customer[0], business: business[0] };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[BUSINESS_CUSTOMER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
