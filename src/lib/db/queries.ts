import { db } from "@/lib/db";
import { item, itemOwners, users, company, address, userType } from "@/lib/db/schema";
import { eq, sql, or, and, isNotNull, isNull, SQLWrapper, asc, desc } from "drizzle-orm";

export const itemsWithOwners = db
  .select({
    itemId: item.itemId,
    itemNumber: item.itemNumber,
    itemName: item.itemName,
    itemType: item.itemType,
    itemBrand: item.itemBrand,
    itemModel: item.itemModel,
    ownerName: users.username,
    ownerType: itemOwners.ownerType,
  })
  .from(item)
  .leftJoin(itemOwners, eq(item.itemId, itemOwners.itemId))
  .leftJoin(users, eq(itemOwners.ownerId, users.userId));

export const getItemOwnerOptions = db
  .select({
    id: users.userId,
    name: users.username,
    type: users.userType,
  })
  .from(users)
  .where(
    or(
      eq(users.userType, 'COMPANY'),
      eq(users.userType, 'CUSTOMER')
    )
  );

export const username = (userId: string) => {
  return db.query.users.findFirst({
    where: eq(users.userId, userId),
    columns: {
      username: true,
    },
  });
};

export async function getAllCompanies() {
  try {
    const result = await db
      .select({
        compId: company.compId,
        compName: company.compName,
        compNumber: company.compNumber,
        email: company.email,
        trn: company.trn,
        mobile: company.mobile,
        landline: company.landline,
        notes: company.notes,
        addressId: company.addressId,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      })
      .from(company);
    return result;
  } catch (error) {
    console.error('Error in getAllCompanies:', error);
    throw error;
  }
}

export async function getAllCustomers() {
  try {
    const result = await db
      .select({
        userId: users.userId,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        mobileNo1: users.mobileNo1,
        mobileNo2: users.mobileNo2,
        compId: users.compId,
        addressId: users.addressId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        // Company details if available
        compName: company.compName,
        // Address details if available
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        country: address.country,
        postalCode: address.postalCode,
      })
      .from(users)
      .leftJoin(company, eq(users.compId, company.compId))
      .leftJoin(address, eq(users.addressId, address.addressId))
      .where(eq(users.userType, 'CUSTOMER'));

    return result;
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    throw error;
  }
}

export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
    with: {
      company: true,
      address: true,
    }
  });
  return user;
}

export async function getUserByEmail(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      company: true,
      address: true,
    }
  });
  return user;
}

export async function updateUser(userId: string, data: Partial<typeof users.$inferInsert>) {
  const dateNow = new Date();
  const updatedUser = await db
    .update(users)
    .set({ ...data, updatedAt: dateNow.toString() })
    .where(eq(users.userId, userId))
    .returning();
  return updatedUser[0];
}

export async function createUser(data: typeof users.$inferInsert) {
  const newUser = await db.insert(users).values(data).returning();
  return newUser[0];
}

export async function getCompanyById(compId: string) {
  const companyData = await db.query.company.findFirst({
    where: eq(company.compId, compId),
    with: {
      address: true,
      users: true,
    }
  });
  return companyData;
}

// Item Queries
interface GetItemsOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  type?: string;
}

interface ItemWithOwner {
  itemId: string;
  itemNumber: number;
  itemName: string;
  itemType: string;
  itemBrand: string | null;
  itemModel: string | null;
  itemBarcode: string | null;
  dimensions: any | null;
  weightGrams: number | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  ownerId: string | null;
  ownerType: string | null;
  ownerUsername: string | null;
}

// export async function getItems({
//   page = 1,
//   limit = 50,
//   sortBy = 'itemNumber',
//   sortOrder = 'asc',
//   search = '',
//   type = '',
// }: GetItemsOptions = {}) {
//   try {
//     const offset = (page - 1) * limit;

//     const preparedQuery = db
//       .select({
//         itemId: item.itemId,
//         itemNumber: item.itemNumber,
//         itemName: item.itemName,
//         itemType: item.itemType,
//         itemBrand: item.itemBrand,
//         itemModel: item.itemModel,
//         itemBarcode: item.itemBarcode,
//         dimensions: item.dimensions,
//         weightGrams: item.weightGrams,
//         notes: item.notes,
//         createdBy: item.createdBy,
//         createdAt: item.createdAt,
//         ownerId: itemOwners.ownerId,
//         ownerType: itemOwners.ownerType,
//         ownerUsername: users.username,
//       })
//       .from(item)
//       .leftJoin(itemOwners, eq(item.itemId, itemOwners.itemId))
//       .leftJoin(users, eq(itemOwners.ownerId, users.userId))
//       .where((fields, operators) => {
//         const conditions: SQLWrapper[] = [];

//         if (search) {
//           conditions.push(
//             operators.or(
//               sql`${item.itemName} ILIKE ${`%${search}%`}`,
//               sql`${item.itemBarcode} ILIKE ${`%${search}%`}`,
//               sql`${item.itemBrand} ILIKE ${`%${search}%`}`,
//               sql`${item.itemModel} ILIKE ${`%${search}%`}`
//             )
//           );
//         }

//         if (type) {
//           conditions.push(eq(item.itemType, type));
//         }

//         return conditions.length > 0 ? operators.and(...conditions) : undefined;
//       })
//       .orderBy(sortOrder === 'desc' ? desc(item[sortBy as keyof typeof item] || item.itemNumber) : asc(item[sortBy as keyof typeof item] || item.itemNumber))
//       .limit(limit)
//       .offset(offset)
//       .prepare('get_items');

//     const [items, count] = await Promise.all([
//       preparedQuery.execute(),
//       db.select({ count: sql<number>`cast(count(*) as integer)` })
//         .from(item)
//         .where((fields, operators) => {
//           const conditions: SQLWrapper[] = [];

//           if (search) {
//             conditions.push(
//               operators.or(
//                 sql`${item.itemName} ILIKE ${`%${search}%`}`,
//                 sql`${item.itemBarcode} ILIKE ${`%${search}%`}`,
//                 sql`${item.itemBrand} ILIKE ${`%${search}%`}`,
//                 sql`${item.itemModel} ILIKE ${`%${search}%`}`
//               )
//             );
//           }

//           if (type) {
//             conditions.push(eq(item.itemType, type));
//           }

//           return conditions.length > 0 ? operators.and(...conditions) : undefined;
//         })
//         .prepare('get_items_count')
//         .execute(),
//     ]);

//     const totalPages = Math.ceil((count[0]?.count || 0) / limit);

//     return {
//       items,
//       metadata: {
//         currentPage: page,
//         totalPages,
//         totalItems: count[0]?.count || 0,
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//       },
//     };
//   } catch (error) {
//     console.error('Error in getItems:', error);
//     throw error;
//   }
// }


export async function getItemById(itemId: string): Promise<ItemWithOwner | null> {
  try {
    const [itemData] = await db
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
        updatedAt: item.updatedAt,
        ownerId: itemOwners.ownerId,
        ownerType: itemOwners.ownerType,
        ownerUsername: users.username,
      })
      .from(item)
      .leftJoin(itemOwners, eq(item.itemId, itemId))
      .leftJoin(users, eq(itemOwners.ownerId, users.userId))
      .where(eq(item.itemId, itemId));

    // Check if itemData exists and itemType is not null before returning
    if (!itemData) return null;
    return {
      ...itemData,
      itemType: itemData.itemType || '' // Ensure itemType is never null
    };
  } catch (error) {
    console.error("Error in getItemById:", error);
    throw error;
  }
}

export async function createItem(
  data: typeof item.$inferInsert, 
  ownerId?: string, 
  ownerType?: 'CUSTOMER' | 'COMPANY'
) 
{
  try {
    return await db.transaction(async (tx) => {
      // Create the item
      const [createdItem] = await tx
        .insert(item)
        .values(data)
        .returning();

      // Create owner association if provided
      if (ownerId && ownerType) {
        await tx.insert(itemOwners).values({
          itemId: createdItem.itemId,
          ownerId,
          ownerType,
        });
      }

      // Return the complete item with owner information
      const [completeItem] = await tx
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
        .leftJoin(itemOwners, eq(item.itemId, createdItem.itemId))
        .leftJoin(users, eq(itemOwners.ownerId, users.userId))
        .where(eq(item.itemId, createdItem.itemId));

      return completeItem;
    });
  } catch (error) {
    console.error("Error in createItem:", error);
    throw error;
  }
}

export async function updateItem(
  itemId: string,
  data: Partial<typeof item.$inferInsert>,
  ownerId?: string,
  ownerType?: 'CUSTOMER' | 'COMPANY'
) {
  try {
    return await db.transaction(async (tx) => {
      // Update item
      await tx
        .update(item)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(item.itemId, itemId));

      // Update owner if provided
      if (ownerId && ownerType) {
        await tx
          .update(itemOwners)
          .set({
            ownerId,
            ownerType,
          })
          .where(eq(itemOwners.itemId, itemId));
      }

      // Return updated item with owner information
      const [completeItem] = await tx
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
          updatedAt: item.updatedAt,
          ownerId: itemOwners.ownerId,
          ownerType: itemOwners.ownerType,
          ownerUsername: users.username,
        })
        .from(item)
        .leftJoin(itemOwners, eq(item.itemId, itemId))
        .leftJoin(users, eq(itemOwners.ownerId, users.userId))
        .where(eq(item.itemId, itemId));

      return completeItem;
    });
  } catch (error) {
    console.error("Error in updateItem:", error);
    throw error;
  }
}

export async function deleteItem(itemId: string) {
  try {
    await db.transaction(async (tx) => {
      // Delete owner associations first
      await tx
        .delete(itemOwners)
        .where(eq(itemOwners.itemId, itemId));

      // Then delete the item
      await tx
        .delete(item)
        .where(eq(item.itemId, itemId));
    });
    return true;
  } catch (error) {
    console.error("Error in deleteItem:", error);
    throw error;
  }
}


/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////

export async function getItems({
  page = 1,
  limit = 50,
  sortBy = 'itemNumber',
  sortOrder = 'asc',
  search = '',
  type = '',
}: GetItemsOptions = {}) {
  try {
    const offset = (page - 1) * limit;

    // Define a mapping of valid sort columns
    const validSortColumns = {
      itemNumber: item.itemNumber,
      itemName: item.itemName,
      itemType: item.itemType,
      itemBrand: item.itemBrand,
      itemModel: item.itemModel,
      itemBarcode: item.itemBarcode,
      createdAt: item.createdAt,
    };

    // Get the sort column or fall back to itemNumber
    const sortColumn = validSortColumns[sortBy as keyof typeof validSortColumns] || item.itemNumber;

    // Build the main query
    const itemsQuery = db
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
      .where(() => {
        const conditions = [];

        if (search) {
          conditions.push(
            sql`
              ${item.itemName} ILIKE ${`%${search}%`} OR
              ${item.itemBarcode} ILIKE ${`%${search}%`} OR
              ${item.itemBrand} ILIKE ${`%${search}%`} OR
              ${item.itemModel} ILIKE ${`%${search}%`}
            `
          );
        }

        if (type) {
          conditions.push(eq(item.itemType, type));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
      })
      .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset(offset);

    // Build the count query
    const countQuery = db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(item)
      .leftJoin(itemOwners, eq(item.itemId, itemOwners.itemId))
      .leftJoin(users, eq(itemOwners.ownerId, users.userId))
      .where(() => {
        const conditions = [];

        if (search) {
          conditions.push(
            sql`
              ${item.itemName} ILIKE ${`%${search}%`} OR
              ${item.itemBarcode} ILIKE ${`%${search}%`} OR
              ${item.itemBrand} ILIKE ${`%${search}%`} OR
              ${item.itemModel} ILIKE ${`%${search}%`}
            `
          );
        }

        if (type) {
          conditions.push(eq(item.itemType, type));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
      });

    // Execute both queries concurrently
    const [items, countResult] = await Promise.all([
      itemsQuery.execute(),
      countQuery.execute(),
    ]);

    const totalItems = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      metadata: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error('Error in getItems:', error);
    throw error;
  }
}