import { db } from "@/lib/db";
import { item, itemOwners, users, type Item } from "@/lib/db/schema";
import { createItemSchema } from "@/lib/validations/item";
import { auth } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import { ZodError } from "zod"; // Ensure ZodError is imported

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "You must be logged in to create items" }, { status: 401 });
    }

    const json = await req.json();
    const body = createItemSchema.parse(json);

    const newItem = await db.transaction(async (tx) => {
      const [createdItem] = await tx.insert(item)
        .values({
          itemName: body.itemName,
          itemType: body.itemType,
          itemModel: body.itemModel ?? null,
          itemBrand: body.itemBrand ?? null,
          weightGrams: body.weightGrams ? Math.floor(Number(body.weightGrams)) : null,
          notes: body.notes ?? null,
          dimensions: body.dimensions ?? null,
          itemBarcode: body.itemBarcode ?? null,
          createdBy: session.user.id!,
        })
        .returning();

      if (body.ownerId && body.ownerType) {
        await tx.insert(itemOwners).values({
          itemId: createdItem.itemId,
          ownerId: body.ownerId,
          ownerType: body.ownerType,
        });
      }

      return createdItem;
    });

    return Response.json(newItem);
  } catch (error: unknown) {
    interface CustomError extends Error {
      code?: string | number; 
    }
    // console.error('Error creating item:', error);
    if (error instanceof ZodError) { 
      console.error('Zod error:', error.errors);
      return Response.json({ error: 'Invalid item data: ' + error.errors[0].message }, { status: 400 });
    }
    if (error instanceof Error){
      const customError = error as CustomError; 
      if (customError.code === '23505') { // Unique constraint violation
        console.error('XOLE:', customError.code);
        return Response.json({ error: 'An item with this barcode already exists' }, { status: 400 });
      }
    }
    return Response.json({ error: 'Failed to create item. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { error: "You must be logged in to view items" },
        { status: 401 }
      );
    }

    const items = await db
      .select({
        itemId: item.itemId,
        itemNumber: item.itemNumber,
        itemName: item.itemName,
        itemType: item.itemType,
        itemBrand: item.itemBrand,
        itemModel: item.itemModel,
        itemBarcode: item.itemBarcode,
        dimensions: item.dimensions,
        weightGrams: item.weightGrams,
        notes: item.notes,
        createdBy: item.createdBy,
        createdAt: item.createdAt,
        ownerId: itemOwners.ownerId,
        ownerType: itemOwners.ownerType,
        ownerUsername: users.username,
      })
      .from(item)
      .leftJoin(itemOwners, eq(item.itemId, itemOwners.itemId))
      .leftJoin(users, eq(itemOwners.ownerId, users.userId))
      .orderBy(asc(item.itemNumber));

    return Response.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return Response.json(
      { error: "An error occurred while fetching items" },
      { status: 500 }
    );
  }
} 