import { relations } from "drizzle-orm/relations";
import { customers, individualCustomers, address, entityAddresses, contactDetails, entityContactDetails, users, businessCustomers, loginAttempts } from "./schema";

export const individualCustomersRelations = relations(individualCustomers, ({one}) => ({
	customer: one(customers, {
		fields: [individualCustomers.customerIndividualId],
		references: [customers.customerId]
	}),
}));

export const customersRelations = relations(customers, ({many}) => ({
	individualCustomers: many(individualCustomers),
	users: many(users),
	businessCustomers: many(businessCustomers),
}));

export const entityAddressesRelations = relations(entityAddresses, ({one}) => ({
	address: one(address, {
		fields: [entityAddresses.addressId],
		references: [address.addressId]
	}),
}));

export const addressRelations = relations(address, ({many}) => ({
	entityAddresses: many(entityAddresses),
}));

export const entityContactDetailsRelations = relations(entityContactDetails, ({one}) => ({
	contactDetail: one(contactDetails, {
		fields: [entityContactDetails.contactDetailsId],
		references: [contactDetails.contactDetailsId]
	}),
}));

export const contactDetailsRelations = relations(contactDetails, ({many}) => ({
	entityContactDetails: many(entityContactDetails),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	customer: one(customers, {
		fields: [users.customerId],
		references: [customers.customerId]
	}),
	loginAttempts: many(loginAttempts),
}));

export const businessCustomersRelations = relations(businessCustomers, ({one}) => ({
	customer: one(customers, {
		fields: [businessCustomers.customerBusinessId],
		references: [customers.customerId]
	}),
}));

export const loginAttemptsRelations = relations(loginAttempts, ({one}) => ({
	user: one(users, {
		fields: [loginAttempts.userId],
		references: [users.userId]
	}),
}));