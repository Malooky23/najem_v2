import { db } from "@/lib/db";
import { item, itemOwners, users, type Item } from "@/lib/db/schema";
import { createItemSchema } from "@/lib/validations/item";
import { auth } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const body = createItemSchema.parse(json);

    const newItem = await db.transaction(async (tx) => {
      const insertValues: Item = {
        itemName: body.itemName,
        itemType: body.itemType,
        itemModel: body.itemModel ?? null,
        itemBrand: body.itemBrand ?? null,
        weightGrams: body.weightGrams!.toString(), // Convert to string
        notes: body.notes ?? null,
        dimensions: body.dimensions ?? null,
        itemBarcode: body.itemBarcode ?? null,
        createdBy: session.user.id!,
        createdAt: undefined!,
        updatedAt: undefined!,
        itemId: undefined!,
        itemNumber: undefined!
      };

      const [createdItem] = await tx.insert(item)
        .values(insertValues)
        .returning();

      // const [createdItem] = await tx.insert(item).values({
      //   itemName: body.itemName,
      //   itemType: body.itemType,
      //   itemModel: body.itemModel || null,
      //   itemBrand: body.itemBrand || null,
      //   weightGrams: body.weightGrams || null,
      //   notes: body.notes || null,
      //   dimensions: body.dimensions || null,
      //   itemBarcode: body.itemBarcode || null,
      //   createdBy: session.user.id,
        
      // }).returning();

      await tx.insert(itemOwners).values({
        itemId: createdItem.itemId,
        ownerId: body.ownerId,
        ownerType: body.ownerType,
      });

      return createdItem;
    });

    return Response.json(newItem);
  } catch (error) {
    console.error('Create item error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create item" }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
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
    console.error('Get items error:', error);
    return Response.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
} 