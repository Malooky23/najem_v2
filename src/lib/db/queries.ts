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




export async function getAllCompanies() {
  const companies = await db.query.company.findMany({
    with: {
      customers: true,
    },
    orderBy: (company, { desc }) => [desc(company.createdAt)],
  });
  return companies;
}




export async function getCustomerById(cusId: string) {
  const customerData = await db.query.customer.findFirst({
    where: eq(customer.cusId, cusId),
    with: {
      user: true,
      company: true,
      address: true,
    },
  });
  return customerData;
}

export async function getCustomerByUserId(userId: string) {
  const customerData = await db.query.customer.findFirst({
    where: eq(customer.userId, userId),
    with: {
      user: true,
      company: true,
      address: true,
    },
  });
  return customerData;
}

export async function createCustomer(data: typeof customer.$inferInsert) {
  const newCustomer = await db.insert(customer).values(data).returning();
  return newCustomer[0];
}

export async function updateCustomer(cusId: string, data: Partial<typeof customer.$inferInsert>) {
  const dateNow = new Date();
  const updatedCustomer = await db
    .update(customer)
    .set({ ...data, updatedAt: dateNow.toString() })
    .where(eq(customer.cusId, cusId))
    .returning();
  return updatedCustomer[0];
} 

// ... existing code ...

export async function getAllCustomers() {
  try {
    const result = await db
      .select({
        cusId: customer.cusId,
        compId: customer.compId,
        addressId: customer.addressId,
        // User details
        userId: users.userId,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        mobileNo1: users.mobileNo1,
        mobileNo2: users.mobileNo2,
        userType: users.userType,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      })
      .from(customer)
      .innerJoin(users, eq(customer.userId, users.userId));
      
    return result;
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    throw error;
  }
}

export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });
  return user;
}

export async function getUserByEmail(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
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