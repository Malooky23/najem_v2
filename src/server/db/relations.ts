// relations.ts
import { relations } from "drizzle-orm";
import {
  customers,
  individualCustomers,
  businessCustomers,
  users,
  contactDetails,
  entityContactDetails,
  addressDetails,
  entityAddresses,
  loginAttempts
} from "./schema";

// Customer Relations
export const customersRelations = relations(customers, ({ one, many }) => ({
  individual: one(individualCustomers, {
    fields: [customers.customerId],
    references: [individualCustomers.customerIndividualId]
  }),
  business: one(businessCustomers, {
    fields: [customers.customerId],
    references: [businessCustomers.customerBusinessId]
  }),
  addresses: many(entityAddresses),
  contacts: many(entityContactDetails),
  users: many(users)
}));

// Individual Customer Relations
export const individualCustomersRelations = relations(individualCustomers, ({ one }) => ({
  customer: one(customers, {
    fields: [individualCustomers.customerIndividualId],
    references: [customers.customerId]
  })
}));

// Business Customer Relations
export const businessCustomersRelations = relations(businessCustomers, ({ one }) => ({
  customer: one(customers, {
    fields: [businessCustomers.customerBusinessId],
    references: [customers.customerId]
  })
}));

// User Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  customer: one(customers, {
    fields: [users.customerId],
    references: [customers.customerId]
  }),
  loginAttempts: many(loginAttempts)
}));

// Contact Details Relations
export const contactDetailsRelations = relations(contactDetails, ({ many }) => ({
  entityRelations: many(entityContactDetails)
}));



// Entity Contact Details Relations
export const entityContactDetailsRelations = relations(entityContactDetails, ({ one }) => ({
  contactDetail: one(contactDetails, {
    fields: [entityContactDetails.contactDetailsId],
    references: [contactDetails.contactDetailsId]
  }),
  customer: one(customers, {
    fields: [entityContactDetails.entityId],
    references: [customers.customerId],
  })
    // You'll add similar relations for other entity types later:
    // order: one(orders, { ... }),
    // vendor: one(vendors, { ... }),
}));


// Address Details Relations
export const addressDetailsRelations = relations(addressDetails, ({ many }) => ({
  entityRelations: many(entityAddresses)
}));

// relations.ts
export const entityAddressesRelations = relations(entityAddresses, ({ one }) => ({
    address: one(addressDetails, {
      fields: [entityAddresses.addressId],
      references: [addressDetails.addressId]
    }),
    // For customer addresses
    customer: one(customers, {
      fields: [entityAddresses.entityId],
      references: [customers.customerId]
    })
    // You'll add similar relations for other entity types later:
    // order: one(orders, { ... }),
    // vendor: one(vendors, { ... }),
  }));




// Login Attempts Relations
export const loginAttemptsRelations = relations(loginAttempts, ({ one }) => ({
  user: one(users, {
    fields: [loginAttempts.userId],
    references: [users.userId]
  })
}));