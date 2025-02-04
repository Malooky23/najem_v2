import { db } from '@/server/db';
import { items, itemStock, stockMovements, businessCustomers, individualCustomers, customers, users } from '@/server/db/schema';
import { eq, asc, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

// Type for sorting parameters
export type SortParams = {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
};

// Get paginated items with related data
export async function getPaginatedItems(
  page: number = 1,
  limit: number = 50,
  sortParams: SortParams = {}
) {
  const { sortBy = 'itemNumber', sortOrder = 'asc', search = '' } = sortParams;

  // Validate sortable columns
  const validSortColumns = [
    'itemNumber', 'itemName', 'itemType', 'createdAt', 'updatedAt'
  ] as const;

  const validSortBy = validSortColumns.includes(sortBy as any) 
    ? sortBy as keyof typeof items.$inferSelect
    : 'itemNumber';

  const query = db
    .select({
      item: items,
      customer: {
        businessName: businessCustomers.businessName,
        individualName: sql<string>`concat(${individualCustomers.firstName}, ' ', ${individualCustomers.lastName})`
      },
      stock: itemStock,
      movements: stockMovements,
      user: users
    })
    .from(items)
    .leftJoin(itemStock, eq(items.itemId, itemStock.itemId))
    .leftJoin(stockMovements, eq(items.itemId, stockMovements.itemId))
    .leftJoin(customers, eq(items.customerId, customers.customerId))
    .leftJoin(
      businessCustomers, 
      eq(customers.customerId, businessCustomers.businessCustomerId)
    )
    .leftJoin(
      individualCustomers, 
      eq(customers.customerId, individualCustomers.individualCustomerId)
    )
    .leftJoin(users, eq(items.createdBy, users.userId))
    // .where(search ? sql`items.item_name ILIKE ${`%${search}%`}` : undefined)
    .where(search ? sql`
        items.item_name ILIKE ${`%${search}%`}
        AND items.item_name_tsvector @@ to_tsquery('english', ${search.split(' ').join(' & ')})
      ` : undefined)
    .orderBy(sortOrder === 'asc' ? asc(items[validSortBy]) : desc(items[validSortBy]))
    .limit(limit)
    .offset((page - 1) * limit);

  const [itemsData, total] = await Promise.all([
    query,
    db.select({ count: sql<number>`count(*)` }).from(items)
  ]);

  return {
    items: itemsData.map(result => ({
      ...result.item,
      customerName: result.customer?.businessName || result.customer?.individualName,
      stock: result.stock,
      movements: result.movements,
      createdBy: result.user?.firstName + " " + result.user?.lastName
    })),
    total: Number(total[0].count),
    page,
    totalPages: Math.ceil(Number(total[0].count) / limit),
  };
}

// Create new item with validation
export async function createItem(data: z.infer<typeof itemSchema>) {
  const [newItem] = await db.insert(items).values(data).returning();
  return newItem;
}

// Item schema for validation
export const itemSchema = z.object({
  itemName: z.string().min(1),
  itemType: z.string().optional(),
  itemBrand: z.string().optional(),
  itemModel: z.string().optional(),
  itemBarcode: z.string().optional(),
  itemCountryOfOrigin: z.string().optional(),
  packingType: z.string().optional(),
  weightGrams: z.coerce.number().nonnegative().optional(),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
    length: z.number(),
  }).optional(),
  notes: z.string().optional(),
  customerId: z.string().uuid(),
  createdBy: z.string().uuid(),
});