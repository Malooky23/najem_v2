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
import {InferSelectModel, sql} from "drizzle-orm"

export const deliveryMethod = pgEnum("delivery_method", ['PICKUP', 'DELIVERY'])
export const movementType = pgEnum("movement_type", ['IN', 'OUT'])
export const orderStatus = pgEnum("order_status", ['PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'])
export const orderType = pgEnum("order_type", ['CUSTOMER_ORDER', 'MANUAL_ADJUSTMENT', 'INVENTORY_COUNT', 'TRANSFER_LOCATION'])
export const packingType = pgEnum("packing_type", ['SACK', 'PALLET', 'CARTON', 'OTHER', 'NONE'])
export const userType = pgEnum("user_type", ['CUSTOMER', 'EMPLOYEE', 'COMPANY'])
export const vendorType = pgEnum("vendor_type", ['FORKLIFT', 'LABOUR', 'OTHER'])


export const address = pgTable("address", {
  addressId: uuid("address_id").defaultRandom().primaryKey().notNull(),
  ownerId: uuid("owner_id").notNull(),
  ownerType: userType("owner_type").notNull(),
  address1: varchar("address_1", {length: 255}).notNull(),
  address2: varchar("address_2", {length: 255}),
  city: varchar({length: 100}).notNull(),
  country: varchar({length: 2}).notNull(),
  postalCode: varchar("postal_code", {length: 20}),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const company = pgTable("company", {
  compId: uuid("comp_id").defaultRandom().primaryKey().notNull(),
  compName: varchar("comp_name", {length: 100}).notNull(),
  compNumber: serial("comp_number").notNull(),
  email: varchar({length: 100}),
  trn: varchar({length: 15}),
  mobile: varchar({length: 16}),
  landline: varchar({length: 16}),
  addressId: uuid("address_id"),
  notes: text(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  foreignKey({
      columns: [table.addressId],
      foreignColumns: [address.addressId],
      name: "company_address_id_fkey"
  }).onDelete("set null"),
  unique("company_comp_number_key").on(table.compNumber),
  unique("company_email_key").on(table.email),
  unique("company_trn_key").on(table.trn),
  unique("company_mobile_key").on(table.mobile),
  unique("company_landline_key").on(table.landline),
]);

export const users = pgTable("users", {
  userId: uuid("user_id").defaultRandom().primaryKey().notNull(),
  username: varchar({length: 50}).notNull(),
  passwordHash: varchar("password_hash", {length: 255}).notNull(),
  email: varchar({length: 255}).notNull(),
  firstName: varchar("first_name", {length: 50}).notNull(),
  lastName: varchar("last_name", {length: 50}).notNull(),
  mobileNo1: varchar("mobile_no_1", {length: 20}).notNull(),
  mobileNo2: varchar("mobile_no_2", {length: 20}),
  userType: userType("user_type").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  lastLogin: timestamp("last_login", {withTimezone: true, mode: 'string'}),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  unique("users_username_key").on(table.username),
  unique("users_email_key").on(table.email),
]);


export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
      .notNull()
      .references(() => users.userId ),
  expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date"
  }).notNull()
});


export const customer = pgTable("customer", {
  cusId: uuid("cus_id").defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  compId: uuid("comp_id"),
  addressId: uuid("address_id"),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  foreignKey({
      columns: [table.userId],
      foreignColumns: [users.userId],
      name: "customer_user_id_fkey"
  }),
  foreignKey({
      columns: [table.compId],
      foreignColumns: [company.compId],
      name: "customer_comp_id_fkey"
  }).onDelete("set null"),
  foreignKey({
      columns: [table.addressId],
      foreignColumns: [address.addressId],
      name: "customer_address_id_fkey"
  }).onDelete("set null"),
  unique("customer_user_id_key").on(table.userId),
]);

export const employee = pgTable("employee", {
  empId: uuid("emp_id").defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  foreignKey({
      columns: [table.userId],
      foreignColumns: [users.userId],
      name: "employee_user_id_fkey"
  }),
  unique("employee_user_id_key").on(table.userId),
]);

export const item = pgTable("item", {
  itemId: uuid("item_id").defaultRandom().primaryKey().notNull(),
  itemNumber: serial("item_number").notNull(),
  itemName: varchar("item_name", {length: 50}).notNull(),
  itemType: varchar("item_type", {length: 50}),
  itemBrand: varchar("item_brand", {length: 100}),
  itemModel: varchar("item_model", {length: 100}),
  itemBarcode: varchar("item_barcode", {length: 100}),
  dimensions: jsonb(),
  weightGrams: numeric("weight_grams", {precision: 10, scale: 2}),
  notes: text(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.userId],
      name: "item_created_by_fkey"
  }).onDelete("restrict"),
  unique("item_item_number_key").on(table.itemNumber),
  unique("item_item_barcode_key").on(table.itemBarcode),
]);

export const inventory = pgTable("inventory", {
  inventoryId: uuid("inventory_id").defaultRandom().primaryKey().notNull(),
  itemId: uuid("item_id").notNull(),
  locationCode: varchar("location_code", {length: 50}),
  quantity: integer().default(0).notNull(),
  lastUpdated: timestamp("last_updated", {
      withTimezone: true,
      mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
  rowId: serial("row_id").primaryKey().notNull(),
  parentItemId: uuid("parent_item_id").notNull(),
  childItemId: uuid("child_item_id").notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
  cusId: uuid("cus_id").notNull(),
  orderType: orderType("order_type").notNull(),
  movement: movementType().notNull(),
  packingType: packingType("packing_type").notNull(),
  deliveryMethod: deliveryMethod("delivery_method").notNull(),
  notes: text(),
  status: orderStatus().default('PENDING').notNull(),
  addressId: uuid("address_id"),
  fulfilledAt: timestamp("fulfilled_at", {withTimezone: true, mode: 'string'}),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  foreignKey({
      columns: [table.creatorId],
      foreignColumns: [users.userId],
      name: "orders_creator_id_fkey"
  }).onDelete("restrict"),
  foreignKey({
      columns: [table.cusId],
      foreignColumns: [customer.cusId],
      name: "orders_cus_id_fkey"
  }).onDelete("restrict"),
  foreignKey({
      columns: [table.addressId],
      foreignColumns: [address.addressId],
      name: "orders_address_id_fkey"
  }).onDelete("set null"),
  unique("orders_order_number_key").on(table.orderNumber),
]);

export const vendors = pgTable("vendors", {
  vendorId: uuid("vendor_id").defaultRandom().primaryKey().notNull(),
  vendorNumber: serial("vendor_number").notNull(),
  vendorName: varchar("vendor_name", {length: 100}).notNull(),
  vendorType: vendorType("vendor_type").notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  unique("vendors_vendor_number_key").on(table.vendorNumber),
]);

export const vendorServices = pgTable("vendor_services", {
  vendorServiceId: uuid("vendor_service_id").defaultRandom().primaryKey().notNull(),
  vendorServicesNumber: serial("vendor_services_number").notNull(),
  vendorId: uuid("vendor_id").notNull(),
  serviceName: varchar("service_name", {length: 255}).notNull(),
  rate: integer().notNull(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
  unique("vendor_services_vendor_services_number_key").on(table.vendorServicesNumber),
  check("vendor_services_rate_check", sql`rate
  >= 0`),
]);

export const vendorPayment = pgTable("vendor_payment", {
  payId: uuid("pay_id").defaultRandom().primaryKey().notNull(),
  vendorId: uuid("vendor_id").notNull(),
  amount: numeric().notNull(),
  empId: uuid("emp_id").notNull(),
  paymentDate: timestamp("payment_date", {
      withTimezone: true,
      mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendors.vendorId],
      name: "vendor_payment_vendor_id_fkey"
  }).onDelete("restrict"),
  foreignKey({
      columns: [table.empId],
      foreignColumns: [employee.empId],
      name: "vendor_payment_emp_id_fkey"
  }).onDelete("restrict"),
  check("vendor_payment_amount_check", sql`amount
  > (0)::numeric`),
]);

export const vendorLedger = pgTable("vendor_ledger", {
  ledgerId: uuid("ledger_id").defaultRandom().primaryKey().notNull(),
  vendorId: uuid("vendor_id").notNull(),
  transactionDate: timestamp("transaction_date", {
      withTimezone: true,
      mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  transactionType: varchar("transaction_type", {length: 50}).notNull(),
  debit: numeric({precision: 10, scale: 2}).default('0').notNull(),
  credit: numeric({precision: 10, scale: 2}).default('0').notNull(),
  description: text(),
  relatedTransactionId: uuid("related_transaction_id"),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendors.vendorId],
      name: "vendor_ledger_vendor_id_fkey"
  }).onDelete("restrict"),
  check("vendor_ledger_transaction_type_check", sql`(transaction_type)
                                                    ::text = ANY ((ARRAY['PAYMENT'::character varying, 'INVOICE'::character varying, 'ADJUSTMENT'::character varying, 'STARTING_BALANCE'::character varying])::text[])`),
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
  rate: integer().notNull(),
  quantity: integer().notNull(),
  totalCost: numeric("total_cost", {precision: 10, scale: 2}).generatedAlwaysAs(sql`(rate * quantity)`),
  empId: uuid("emp_id").notNull(),
  createdAt: timestamp("created_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
      foreignColumns: [customer.cusId],
      name: "vendor_transactions_cus_id_fkey"
  }).onDelete("set null"),
  foreignKey({
      columns: [table.vendorServiceId],
      foreignColumns: [vendorServices.vendorServiceId],
      name: "vendor_transactions_vendor_service_id_fkey"
  }).onDelete("restrict"),
  foreignKey({
      columns: [table.empId],
      foreignColumns: [employee.empId],
      name: "vendor_transactions_emp_id_fkey"
  }).onDelete("restrict"),
  unique("vendor_transactions_vendor_tx_number_key").on(table.vendorTxNumber),
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
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
  check("order_items_quantity_check", sql`quantity
  > 0`),
]);

export const itemTransactions = pgTable("item_transactions", {
  itemTxId: serial("item_tx_id").primaryKey().notNull(),
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
  updatedAt: timestamp("updated_at", {withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
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
  itemId: uuid("item_id").notNull(),
  ownerId: uuid("owner_id").notNull(),
  ownerType: varchar("owner_type", {length: 50}).notNull(),
}, (table) => [
  foreignKey({
      columns: [table.itemId],
      foreignColumns: [item.itemId],
      name: "item_owners_item_id_fkey"
  }).onDelete("cascade"),
  primaryKey({columns: [table.itemId, table.ownerId, table.ownerType], name: "item_owners_pkey"}),
]);


export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessionTable>;
export type Item = InferSelectModel<typeof item>;

