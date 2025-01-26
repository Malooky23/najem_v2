import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    serial,
    text,
    boolean,
    pgEnum,
    unique,
    integer,inet
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const userType = pgEnum("user_type", ['EMPLOYEE', 'CUSTOMER', "DEMO"])
export const customerType = pgEnum("customer_type", ['INDIVIDUAL', 'BUSINESS'])
export const contactType = pgEnum("contact_type", ["email","mobile","landline","other"])
export const entityType = pgEnum("entity_type", ["CUSTOMER", "USER"]);
export const addressType = pgEnum("address_type", ["PRIMARY", "BILLING", "SHIPPING"]);


//Contact Details such as Email
export const contactDetails = pgTable("contact_details", {
    contactDetailsId: uuid("contact_details_id").defaultRandom().primaryKey(),

    contactType: contactType("contact_type").notNull(),
    contactData: text("contact_data").notNull(),
    isPrimary: boolean("is_primary").default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(()=>sql`CURRENT_TIMESTAMP`)
})

export const entityContactDetails = pgTable("entity_contact_details", {
    entityId: uuid("entity_id").notNull(),
    entityType: entityType("entity_type").notNull(),
    contactDetailsId: uuid("contact_details_id")
      .references(() => contactDetails.contactDetailsId, { onDelete: "cascade" })
      .notNull(),
    // Optional: Add a "type" field (e.g., "primary", "billing")
    contactType: text("contact_type"), 
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  });

// ADDRESS TABLE
export const addressDetails = pgTable("address", {
    addressId: uuid("address_id").defaultRandom().primaryKey(),
    
    address1: text("address_1"),
    address2: text("address_2"),
    city: text().notNull(),
    country: text().notNull(),
    postalCode: varchar("postal_code", { length: 20 }),

    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(()=>sql`CURRENT_TIMESTAMP`)
})

export const entityAddresses = pgTable("entity_addresses", {
    entityId: uuid("entity_id").notNull(),
    entityType: entityType("entity_type").notNull(),
    addressId: uuid("address_id")
      .references(() => addressDetails.addressId, { onDelete: "cascade" })
      .notNull(),
    // Add an address type (e.g., "billing", "shipping", "office")
    addressType: addressType("address_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  });

// Individual Customer Details
export const individualCustomers = pgTable("individual_customers", {
    individualCustomerId: uuid("individual_customer_id")
    .primaryKey()
    .references(() => customers.customerId, { onDelete: "cascade" }),
    
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name").notNull(),
    personalID: text("personal_id").unique(),

    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(()=>sql`CURRENT_TIMESTAMP`)
})

// Business Customer Details
export const businessCustomers = pgTable("business_customers", {
    businessCustomerId: uuid("business_customer_id")
    .primaryKey()
    .references(() => customers.customerId, { onDelete: "cascade" }),
    
    businessName: text("business_name").unique().notNull(),
    isTaxRegistered: boolean("is_tax_registered").default(false).notNull(),
    taxNumber: text("tax_registration_number").unique(), //can be null, not all business have.

    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(()=>sql`CURRENT_TIMESTAMP`)
})

//CUSTOMERS - Individual or Business
export const customers = pgTable("customers", {
    customerId: uuid("customer_id").defaultRandom().primaryKey().notNull(),
    customerNumber: serial("customer_number").notNull(),
    customerType: customerType("customer_type").notNull(),

    notes: text(),
    country: text().notNull(), //we need to specify customer country irregardles of address table.

    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(()=>sql`CURRENT_TIMESTAMP`)
});

// Relations


//USERS
export const users = pgTable("users", {
    userId: uuid("user_id").defaultRandom().primaryKey().notNull(),

    email: text().notNull().unique(),
    passwordHash: text("password_hash").notNull(),

    firstName: varchar("first_name", { length: 50 }).notNull(),
    lastName: varchar("last_name", { length: 50 }).notNull(),

    isActive: boolean("is_active").default(true).notNull(),
    isAdmin: boolean("is_admin").default(false).notNull(),
	userType: userType("user_type").default('CUSTOMER').notNull(),

    // Optional Customer Association
    customerId: uuid("customer_id").references(() => customers.customerId),
    lastLogin: timestamp("last_login", { withTimezone: true }),

    loginCount: integer('login_count').default(sql`0`).$onUpdateFn(() => sql`login_count + 1`),

    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(()=>sql`CURRENT_TIMESTAMP`)
})

// SESSIONS
export const loginAttempts = pgTable("login_attempts", {
    loginAttemptId: serial("login_attempt_id").primaryKey().notNull(),
    userId: uuid("user_id").references(() => users.userId),
    success: boolean().default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    ip_address: inet("ip_address"),
    user_agent: text("user_agent"),
    error_message: text("error_message"),})


export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export type IndividualCustomer = typeof individualCustomers.$inferSelect;
export type InsertIndividualCustomer = typeof individualCustomers.$inferInsert;

export type BusinessCustomer = typeof businessCustomers.$inferSelect;
export type InsertBusinessCustomer = typeof businessCustomers.$inferInsert;

export type ContactDetails = typeof contactDetails.$inferSelect;
export type InsertContactDetails = typeof contactDetails.$inferInsert;

export type EntityContactDetails = typeof entityContactDetails.$inferSelect;
export type InsertEntityContactDetails = typeof entityContactDetails.$inferInsert;

export type AddressDetails = typeof addressDetails.$inferSelect;
export type InsertAddressDetails = typeof addressDetails.$inferInsert;

export type EntityAddresses = typeof entityAddresses.$inferSelect;
export type InsertEntityAddresses = typeof entityAddresses.$inferInsert;

export type LoginAttempts = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempts = typeof loginAttempts.$inferInsert;
