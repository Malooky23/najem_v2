import { db } from '@/server/db';
import { items, itemStock, stockMovements, businessCustomers, individualCustomers, customers, users } from '@/server/db/schema';
import { eq, asc, desc, sql, and, gt } from 'drizzle-orm';
import { z } from 'zod';

// Type for sorting parameters
export type SortParams = {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filter?: any; // Add filter type here - making it 'any' for simplicity, refine as needed
};

// Get paginated items with related data
export async function getPaginatedItems(
  page: number = 1,
  limit: number = 50,
  sortParams: SortParams = {}
) {
  const { sortBy = 'itemNumber', sortOrder = 'asc', search = '', filter = {} } = sortParams; // Destructure filter from sortParams

  // Validate sortable columns
  const validSortColumns = [
    'itemNumber', 'itemName', 'itemType', 'createdAt', 'updatedAt'
  ] as const;

  const validSortBy = validSortColumns.includes(sortBy as any)
    ? sortBy as keyof typeof items.$inferSelect
    : 'itemNumber';

  // Construct the WHERE clause with search and filter conditions
  const whereConditions = and(
    eq(items.isDeleted, false), // Always filter for not deleted items
    search
      ? sql`items.item_name ILIKE ${`%${search}%`}`
      : undefined, // Conditionally add search condition
    filter.updatedAt ? gt(items.updatedAt, filter.updatedAt.gt) : undefined // Conditionally add updatedAt filter
  );

  console.log('filter.updatedAt',filter.updatedAt)

  const query = db
    .select({
      item: items,
      customer: {
        businessName: businessCustomers.businessName,
        individualFirstName: individualCustomers.firstName,
        individualLastName: individualCustomers.lastName
      },
      stock: itemStock,
      movements: stockMovements,
      user: users
    })
    .from(items)
    .leftJoin(itemStock, eq(items.itemId, itemStock.itemId))
    .leftJoin(stockMovements, eq(items.itemId, itemStock.itemId))
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
    .where(whereConditions) // Apply the combined WHERE clause
    .orderBy(sortOrder === 'asc' ? asc(items[validSortBy]) : desc(items[validSortBy]))
    .limit(limit)
    .offset((page - 1) * limit);

  const [itemsData, total] = await Promise.all([
    query,
    db.select({ count: sql<number>`count(*)` }).from(items).where(whereConditions) // Apply the same WHERE clause to count query
  ]);

  return {
    items: itemsData.map(result => ({
      ...result.item,
      customerName: result.customer?.businessName || result.customer?.individualFirstName + " " + result.customer?.individualLastName,
      stock: result.stock?.currentQuantity,
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