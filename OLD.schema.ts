import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  foreignKey,
  unique,
  serial,
  text,
  boolean,
  jsonb,
  numeric,
  check,
  integer,
  primaryKey,
  pgEnum
} from "drizzle-orm/pg-core"
import {InferColumnsDataTypes, InferSelectModel, sql} from "drizzle-orm"

export const deliveryMethod = pgEnum("delivery_method", ['PICKUP', 'DELIVERY'])
export const movementType = pgEnum("movement_type", ['IN', 'OUT'])
export const orderStatus = pgEnum("order_status", ['PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'])
export const orderType = pgEnum("order_type", ['CUSTOMER_ORDER', 'MANUAL_ADJUSTMENT', 'INVENTORY_COUNT', 'TRANSFER_LOCATION'])
export const packingType = pgEnum("packing_type", ['SACK', 'PALLET', 'CARTON', 'OTHER', 'NONE'])
export const userType = pgEnum("user_type", ['EMPLOYEE', 'CUSTOMER'])
export const customerType = pgEnum("customer_type", ['INDIVIDUAL', 'BUSINESS'])
export const vendorType = pgEnum("vendor_type", ['FORKLIFT', 'LABOUR', 'OTHER'])

export const address = pgTable("address", {
  addressId: uuid("address_id").defaultRandom().primaryKey(),
  address1: text("address_1").notNull(),
  address2: text("address_2"),
  city: text().notNull(),
  country: text().notNull(),
  postalCode: varchar("postal_code", {length: 20}),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
});

export const company = pgTable("company", {
  compId: uuid("comp_id").defaultRandom().primaryKey().notNull(),
  compName: varchar("comp_name").notNull(),
  compNumber: serial("comp_number").notNull(),
  email: varchar(),
  trn: varchar({length: 15}),
  mobile: varchar(),
  landline: varchar(),
  notes: text(),
  addressId: uuid("address_id").references(() => address.addressId),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  unique("company_email_key").on(table.email),
  unique("company_trn_key").on(table.trn),
  unique("company_mobile_key").on(table.mobile),
  unique("company_landline_key").on(table.landline),
]);

export const customers = pgTable("customers", {
  customerId: uuid("customer_id").defaultRandom().primaryKey().notNull(),
  customerNumber: serial("customer_number").notNull(),
  customerType: customerType("customer_type").notNull(),
  firstName: varchar("first_name", {length: 100}),  // For individuals
  lastName: varchar("last_name", {length: 100}),    // For individuals
  companyName: varchar("company_name", {length: 255}), // For businesses
  email: varchar("email", {length: 255}),
  phone: varchar("phone", {length: 20}),
  addressId: uuid("address_id").references(() => address.addressId),
  notes: text(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  check("valid_customer_info", sql`
    (customer_type = 'INDIVIDUAL' AND first_name IS NOT NULL AND last_name IS NOT NULL AND company_name IS NULL) OR
    (customer_type = 'BUSINESS' AND company_name IS NOT NULL AND first_name IS NULL AND last_name IS NULL)
  `)
]);



export const users = pgTable("users", {
  userId: uuid("user_id").defaultRandom().primaryKey().notNull(),
  username: varchar({length: 50}).notNull(),
  passwordHash: varchar("password_hash", {length: 255}).notNull(),
  email: varchar({length: 255}).notNull(),
  firstName: varchar("first_name", {length: 50}).notNull(),
  lastName: varchar("last_name", {length: 50}).notNull(),
  mobileNo1: varchar("mobile_no_1", {length: 20}).notNull(),
  userType: userType("user_type").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  compId: uuid("comp_id").references(() => company.compId),
  addressId: uuid("address_id").references(() => address.addressId),
  lastLogin: timestamp("last_login", {withTimezone: true, mode: 'string'}),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  unique("users_username_key").on(table.username),
  unique("users_email_key").on(table.email),
]);

export const sessionTable = pgTable("session", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
      .notNull()
      .references(() => users.userId ),
  expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date"
  }).notNull()
});

export const item = pgTable("item", {
  itemId: uuid("item_id").defaultRandom().primaryKey().notNull(),
  itemNumber: serial("item_number").notNull(),
  itemName: varchar("item_name").notNull(),
  itemType: varchar("item_type", {length: 50}),
  itemBrand: varchar("item_brand", {length: 100}),
  itemModel: varchar("item_model", {length: 100}),
  itemBarcode: varchar("item_barcode", {length: 100}).unique(),
  itemCountryOfOrigin: varchar("item_country_of_origin", {length: 100}),
  dimensions: jsonb(),
  weightGrams: integer("weight_grams"),
  notes: text(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.userId],
      name: "item_created_by_fkey"
  }).onDelete("restrict"),
]);

export const inventoryLocation = pgTable("inventory_location", {
  inventoryLocationId: uuid("inventory_location_id").defaultRandom().primaryKey().notNull(),
  locationName: varchar("location_name", {length: 100}),
  locationCode: varchar("location_code", {length: 50}),
  locationRoom: varchar("location_room", {length: 50}),
  locationStand: varchar("location_stand", {length: 50}),
  notes: text(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`)
});

export const inventory = pgTable("inventory", {
  inventoryId: uuid("inventory_id").defaultRandom().primaryKey().notNull(),
  itemId: uuid("item_id").notNull(),
  quantity: integer().default(0).notNull(),
  inventoryLocationId: uuid("inventory_location_id"),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  foreignKey({
      columns: [table.itemId],
      foreignColumns: [item.itemId],
      name: "inventory_item_id_fkey"
  }),
  check("inventory_quantity_check", sql`quantity
  >= 0`),
]);

export const itemHierarchy = pgTable("item_hierarchy", {
  itemHierarchyId: serial("item_hierarchy_id").primaryKey(),
  parentItemId: uuid("parent_item_id").notNull(),
  childItemId: uuid("child_item_id").notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  foreignKey({
      columns: [table.parentItemId],
      foreignColumns: [item.itemId],
      name: "item_hierarchy_parent_item_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
      columns: [table.childItemId],
      foreignColumns: [item.itemId],
      name: "item_hierarchy_child_item_id_fkey"
  }).onDelete("cascade"),
  check("no_self_reference", sql`parent_item_id
  <> child_item_id`),
]);

export const orders = pgTable("orders", {
  orderId: uuid("order_id").defaultRandom().primaryKey().notNull(),
  orderNumber: serial("order_number").notNull(),
  creatorId: uuid("creator_id").notNull(),
  ownerId: uuid("owner_id").notNull(),
  ownerType: userType("owner_type").notNull(),
  orderType: orderType("order_type").notNull(),
  movement: movementType().notNull(),
  packingType: packingType("packing_type").notNull(),
  deliveryMethod: deliveryMethod("delivery_method").notNull(),
  notes: text(),
  status: orderStatus().default('PENDING').notNull(),
  addressId: uuid("address_id").references(() => address.addressId),
  fulfilledAt: timestamp("fulfilled_at", {withTimezone: true, mode: 'string'}),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  foreignKey({
      columns: [table.creatorId],
      foreignColumns: [users.userId],
      name: "orders_creator_id_fkey"
  }).onDelete("restrict"),
  foreignKey({
      columns: [table.ownerId, table.ownerType],
      foreignColumns: [
table.ownerType === userType.enumValues[1] ? company.compId : users.userId,
        table.ownerType
      ],
      name: "orders_owner_id_fkey"
  }).onDelete("restrict"),
  foreignKey({
      columns: [table.addressId],
      foreignColumns: [address.addressId],
      name: "orders_address_id_fkey"
  }).onDelete("set null"),
  check("valid_owner_type", sql`owner_type IN ('CUSTOMER', 'COMPANY')`),
]);

export const vendors = pgTable("vendors", {
  vendorId: uuid("vendor_id").defaultRandom().primaryKey().notNull(),  
  vendorNumber: serial("vendor_number").notNull(),
  vendorName: varchar("vendor_name").notNull(),
  vendorType: varchar("vendor_type").notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
});

export const vendorServices = pgTable("vendor_services", {
  vendorServiceId: uuid("vendor_services_id").defaultRandom().primaryKey().notNull(),  
  vendorServicesNumber: serial("vendor_services_number").notNull(),
  vendorId: uuid("vendor_id").notNull(),
  serviceName: varchar("service_name", {length: 255}).notNull(),
  rate: numeric("rate", { precision: 10, scale: 2 }).notNull(),
  createdBy: uuid("created_by").notNull(),
  notes: text(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendors.vendorId],
      name: "vendor_services_vendor_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.userId],
      name: "vendor_services_created_by_fkey"
  }).onDelete("restrict"),
  check("vendor_services_rate_check", sql`rate
  >= 0`),
]);

export const vendorPayment = pgTable("vendor_payment", {
  payId: uuid("pay_id").defaultRandom().primaryKey().notNull(),
  payNumber: serial("pay_number").notNull(),
  vendorId: uuid("vendor_id").notNull(),
  vendorTxId: uuid("vendor_tx_id").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  createdBy: uuid("created_by").notNull(),
  paymentDate: timestamp("payment_date", {
      withTimezone: true,
      mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendors.vendorId],
      name: "vendor_payment_vendor_id_fkey"
  }).onDelete("restrict"),
  foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.userId],
      name: "vendor_payment_user_id_fkey"
  }).onDelete("restrict"),
  check("vendor_payment_amount_check", sql`amount
  > (0)::numeric`),
]);

export const vendorLedger = pgTable("vendor_ledger", {
  ledgerId: uuid("ledger_id").defaultRandom().primaryKey().notNull(),
  ledgerNumber: serial("ledger_number").notNull(),
  vendorId: uuid("vendor_id").notNull(),
  transactionDate: timestamp("transaction_date", {
      withTimezone: true,
      mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  transactionType: varchar("transaction_type", {length: 50}).notNull(),
  debit: numeric("debit", { precision: 10, scale: 2 }).default('0').notNull(),
  credit: numeric("credit", { precision: 10, scale: 2 }).default('0').notNull(),
  description: text(),
  // txId: uuid("vendor_tx_id").notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendors.vendorId],
      name: "vendor_ledger_vendor_id_fkey"
  }).onDelete("restrict"),
  check("vendor_ledger_check", sql`(debit >= (0):: numeric)
                                   AND (credit >= (0)::numeric)`),
  check("vendor_ledger_check1", sql`NOT ((debit = (0)::numeric) AND (credit = (0)::numeric))`),
]);

export const vendorTransactions = pgTable("vendor_transactions", {
  vendorTxId: uuid("vendor_tx_id").defaultRandom().primaryKey().notNull(),
  vendorTxNumber: serial("vendor_tx_number").notNull(),
  vendorId: uuid("vendor_id").notNull(),
  orderId: uuid("order_id"),
  txDate: timestamp("tx_date", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  cusId: uuid("cus_id"),
  vendorServiceId: uuid("vendor_service_id").notNull(),
  rate: numeric("rate", { precision: 10, scale: 2 }).notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  totalCost: numeric("total_cost", {precision: 10, scale: 2}).notNull(),
  empId: uuid("emp_id").notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendors.vendorId],
      name: "vendor_transactions_vendor_id_fkey"
  }).onDelete("restrict"),
  foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.orderId],
      name: "vendor_transactions_order_id_fkey"
  }).onDelete("set null"),
  foreignKey({
      columns: [table.cusId],
      foreignColumns: [users.userId],
      name: "vendor_transactions_cus_id_fkey"
  }).onDelete("set null"),
  foreignKey({
      columns: [table.vendorServiceId],
      foreignColumns: [vendorServices.vendorServiceId],
      name: "vendor_transactions_vendor_service_id_fkey"
  }).onDelete("restrict"),
  foreignKey({
      columns: [table.empId],
      foreignColumns: [users.userId],
      name: "vendor_transactions_emp_id_fkey"
  }).onDelete("restrict"),
  check("vendor_transactions_rate_check", sql`rate
  >= 0`),
  check("vendor_transactions_quantity_check", sql`quantity
  > 0`),
]);

export const orderItems = pgTable("order_items", {
  orderItemsId: uuid("order_items_id").defaultRandom().primaryKey().notNull(),
  orderId: uuid("order_id").notNull(),
  itemId: uuid("item_id").notNull(),
  quantity: integer().notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.orderId],
      name: "order_items_order_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
      columns: [table.itemId],
      foreignColumns: [item.itemId],
      name: "order_items_item_id_fkey"
  }).onDelete("restrict"),
]);

export const itemTransactions = pgTable("item_transactions", {
  itemTxId: uuid("item_tx_id").defaultRandom().primaryKey().notNull(),
  itemTxNumber: serial("item_tx_number").notNull(),
  orderId: uuid("order_id").notNull(),
  itemId: uuid("item_id").notNull(),
  inventoryId: uuid("inventory_id").notNull(),
  movement: movementType().notNull(),
  movementAmt: integer("movement_amt").notNull(),
  prevStock: integer("prev_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  notes: text(),
  txDate: timestamp("tx_date", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.orderId],
      name: "item_transactions_order_id_fkey"
  }).onDelete("restrict"),
  foreignKey({
      columns: [table.itemId],
      foreignColumns: [item.itemId],
      name: "item_transactions_item_id_fkey"
  }).onDelete("restrict"),
  foreignKey({
      columns: [table.inventoryId],
      foreignColumns: [inventory.inventoryId],
      name: "item_transactions_inventory_id_fkey"
  }),
  check("valid_stock_movement", sql`((movement = 'IN'::movement_type) AND (new_stock = (prev_stock + movement_amt)))
                                    OR ((movement = 'OUT'::movement_type) AND (new_stock = (prev_stock - movement_amt)))`),
]);

export const itemOwners = pgTable("item_owners", {
  itemOwnerId: uuid("item_owner_id").primaryKey().defaultRandom().notNull(),
  itemId: uuid("item_id").notNull(),
  ownerId: uuid("owner_id").notNull(),
  ownerType: userType("owner_type").notNull(),
}, (table) => [
  foreignKey({
      columns: [table.itemId],
      foreignColumns: [item.itemId],
      name: "item_owners_item_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
      columns: [table.ownerId],
      foreignColumns: [users.userId],
      name: "item_owners_owner_id_fkey"
  }).onDelete("restrict"),
]);

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessionTable>;
export type Item = InferSelectModel<typeof item>;
