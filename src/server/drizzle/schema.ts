import { pgTable, uuid, text, boolean, timestamp, varchar, foreignKey, unique, integer, serial, inet, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const contactType = pgEnum("contact_type", ['email', 'mobile', 'landline', 'other'])
export const customerType = pgEnum("customer_type", ['INDIVIDUAL', 'BUSINESS'])
export const userType = pgEnum("user_type", ['EMPLOYEE', 'CUSTOMER', 'DEMO'])


export const contactDetails = pgTable("contact_details", {
	contactDetailsId: uuid("contact_details_id").defaultRandom().primaryKey().notNull(),
	contactType: contactType("contact_type").notNull(),
	contactData: text("contact_data").notNull(),
	isPrimary: boolean("is_primary").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const address = pgTable("address", {
	addressId: uuid("address_id").defaultRandom().primaryKey().notNull(),
	address1: text("address_1"),
	address2: text("address_2"),
	city: text().notNull(),
	country: text().notNull(),
	postalCode: varchar("postal_code", { length: 20 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const individualCustomers = pgTable("individual_customers", {
	customerIndividualId: uuid("customer_individual_id").primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	middleName: text("middle_name"),
	lastName: text("last_name").notNull(),
	personalId: text("personal_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.customerIndividualId],
			foreignColumns: [customers.customerId],
			name: "individual_customers_customer_individual_id_customers_customer_"
		}),
	unique("individual_customers_personal_id_unique").on(table.personalId),
]);

export const entityAddresses = pgTable("entity_addresses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	addressId: uuid("address_id").notNull(),
	entityType: text("entity_type").notNull(),
	entityId: uuid("entity_id").notNull(),
	addressType: text("address_type").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [address.addressId],
			name: "entity_addresses_address_id_address_address_id_fk"
		}),
]);

export const entityContactDetails = pgTable("entity_contact_details", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contactDetailsId: uuid("contact_details_id").notNull(),
	entityType: text("entity_type").notNull(),
	entityId: uuid("entity_id").notNull(),
	contactType: text("contact_type"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.contactDetailsId],
			foreignColumns: [contactDetails.contactDetailsId],
			name: "entity_contact_details_contact_details_id_contact_details_conta"
		}),
]);

export const users = pgTable("users", {
	userId: uuid("user_id").defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	firstName: varchar("first_name", { length: 50 }).notNull(),
	lastName: varchar("last_name", { length: 50 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	isAdmin: boolean("is_admin").default(false).notNull(),
	customerId: uuid("customer_id"),
	loginCount: integer("login_count").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	userType: userType("user_type").default('CUSTOMER').notNull(),
	lastLogin: timestamp("last_login", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.customerId],
			name: "users_customer_id_customers_customer_id_fk"
		}),
	unique("users_email_unique").on(table.email),
]);

export const customers = pgTable("customers", {
	customerId: uuid("customer_id").defaultRandom().primaryKey().notNull(),
	customerNumber: serial("customer_number").notNull(),
	customerType: customerType("customer_type").notNull(),
	notes: text(),
	country: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const businessCustomers = pgTable("business_customers", {
	customerBusinessId: uuid("customer_business_id").primaryKey().notNull(),
	businessName: text("business_name").notNull(),
	isTaxRegistered: boolean("is_tax_registered").default(false).notNull(),
	taxRegistrationNumber: text("tax_registration_number"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.customerBusinessId],
			foreignColumns: [customers.customerId],
			name: "business_customers_customer_business_id_customers_customer_id_f"
		}),
	unique("business_customers_business_name_unique").on(table.businessName),
	unique("business_customers_tax_registration_number_unique").on(table.taxRegistrationNumber),
]);

export const loginAttempts = pgTable("login_attempts", {
	loginAttemptId: serial("login_attempt_id").primaryKey().notNull(),
	userId: uuid("user_id"),
	success: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	ipAddress: inet("ip_address"),
	userAgent: text("user_agent"),
	errorMessage: text("error_message"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "login_attempts_user_id_users_user_id_fk"
		}),
]);
