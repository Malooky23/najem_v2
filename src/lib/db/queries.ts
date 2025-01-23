import { db } from "@/lib/db";
import { item, itemOwners, users, customer, company } from "@/lib/db/schema";
import { eq, sql, or, and, isNotNull, isNull, SQLWrapper } from "drizzle-orm";

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
    type: sql<'COMPANY' | 'CUSTOMER'>`CASE 
      WHEN ${company.compId} IS NOT NULL THEN 'COMPANY'
      ELSE 'CUSTOMER'
    END`.as('type')
  })
  .from(users)
  .leftJoin(customer, eq(users.userId, customer.userId))
  .leftJoin(company, eq(customer.compId, company.compId))
  .where(
    or(
      isNotNull(company.compId),
      and(
        isNull(company.compId),
        eq(users.userType, 'CUSTOMER')
      )
    )
  );



export const username = (userId: string) => {
  return db.query.users.findFirst({
    where: eq(users.userId, userId),
    columns: {
      username: true,
    },
  });
}




