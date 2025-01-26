import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { customers, individualCustomers, contactDetails, addressDetails, entityContactDetails, entityAddresses } from "@/server/db/schema";
import { createIndividualCustomerSchema } from "@/lib/validations/customer";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = createIndividualCustomerSchema.parse(body);
    
    const result = await db.transaction(async (tx) => {
      // Create customer
      const customer = await tx
        .insert(customers)
        .values({
          customerType: 'INDIVIDUAL',
          country: validatedData.country,
        })
        .returning({ customerId: customers.customerId });

      // Create individual customer
      const individual = await tx
        .insert(individualCustomers)
        .values({
          individualCustomerId: customer[0].customerId,
          firstName: validatedData.firstName,
          middleName: validatedData.middleName ?? null,
          lastName: validatedData.lastName,
          personalID: validatedData.personalId ?? null,
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

      return { customer: customer[0], individual: individual[0] };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[INDIVIDUAL_CUSTOMER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
