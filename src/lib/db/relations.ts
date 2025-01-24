import { relations } from "drizzle-orm/relations";
import { address, company, users, item, inventory, inventoryLocation, itemHierarchy, orders, vendors, vendorServices, vendorPayment, vendorLedger, vendorTransactions, orderItems, itemTransactions, itemOwners } from "./schema";

export const companyRelations = relations(company, ({one, many}) => ({
  address: one(address, {
    fields: [company.addressId],
    references: [address.addressId]
  }),
  users: many(users)
}));

export const addressRelations = relations(address, ({many}) => ({
  companies: many(company),
  users: many(users),
  orders: many(orders),
}));

export const userRelations = relations(users, ({one, many}) => ({
  company: one(company, {
    fields: [users.compId],
    references: [company.compId]
  }),
  address: one(address, {
    fields: [users.addressId],
    references: [address.addressId]
  }),
  orders: many(orders),
  items: many(item),
  vendorPayments: many(vendorPayment),
  vendorTransactions: many(vendorTransactions),
}));

export const itemRelations = relations(item, ({one, many}) => ({
  user: one(users, {
    fields: [item.createdBy],
    references: [users.userId]
  }),
  inventories: many(inventory),
  itemHierarchies_parentItemId: many(itemHierarchy, {
    relationName: "itemHierarchy_parentItemId_item_itemId"
  }),
  itemHierarchies_childItemId: many(itemHierarchy, {
    relationName: "itemHierarchy_childItemId_item_itemId"
  }),
  orderItems: many(orderItems),
  itemTransactions: many(itemTransactions),
  itemOwners: many(itemOwners),
}));

export const inventoryLocationRelations = relations(inventoryLocation, ({many}) => ({
  inventories: many(inventory)
}));

export const inventoryRelations = relations(inventory, ({one, many}) => ({
  item: one(item, {
    fields: [inventory.itemId],
    references: [item.itemId]
  }),
  location: one(inventoryLocation, {
    fields: [inventory.inventoryLocationId],
    references: [inventoryLocation.inventoryLocationId]
  }),
  itemTransactions: many(itemTransactions),
}));

export const itemHierarchyRelations = relations(itemHierarchy, ({one}) => ({
  item_parentItemId: one(item, {
    fields: [itemHierarchy.parentItemId],
    references: [item.itemId],
    relationName: "itemHierarchy_parentItemId_item_itemId"
  }),
  item_childItemId: one(item, {
    fields: [itemHierarchy.childItemId],
    references: [item.itemId],
    relationName: "itemHierarchy_childItemId_item_itemId"
  }),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
  creator: one(users, {
    fields: [orders.creatorId],
    references: [users.userId]
  }),
  owner: one(users, {
    fields: [orders.ownerId],
    references: [users.userId]
  }),
  address: one(address, {
    fields: [orders.addressId],
    references: [address.addressId]
  }),
  vendorTransactions: many(vendorTransactions),
  orderItems: many(orderItems),
  itemTransactions: many(itemTransactions),
}));

export const vendorServicesRelations = relations(vendorServices, ({one, many}) => ({
  vendor: one(vendors, {
    fields: [vendorServices.vendorId],
    references: [vendors.vendorId]
  }),
  creator: one(users, {
    fields: [vendorServices.createdBy],
    references: [users.userId]
  }),
  vendorTransactions: many(vendorTransactions)
}));

export const vendorsRelations = relations(vendors, ({many}) => ({
  vendorServices: many(vendorServices),
  vendorPayments: many(vendorPayment),
  vendorLedgers: many(vendorLedger),
  vendorTransactions: many(vendorTransactions),
}));

export const vendorLedgerRelations = relations(vendorLedger, ({one}) => ({
  vendor: one(vendors, {
    fields: [vendorLedger.vendorId],
    references: [vendors.vendorId]
  }),
}));

export const vendorTransactionsRelations = relations(vendorTransactions, ({one}) => ({
  vendor: one(vendors, {
    fields: [vendorTransactions.vendorId],
    references: [vendors.vendorId]
  }),
  order: one(orders, {
    fields: [vendorTransactions.orderId],
    references: [orders.orderId]
  }),
  customer: one(users, {
    fields: [vendorTransactions.cusId],
    references: [users.userId]
  }),
  vendorService: one(vendorServices, {
    fields: [vendorTransactions.vendorServiceId],
    references: [vendorServices.vendorServiceId]
  }),
  employee: one(users, {
    fields: [vendorTransactions.empId],
    references: [users.userId]
  }),
}));

export const vendorPaymentRelations = relations(vendorPayment, ({one}) => ({
  vendor: one(vendors, {
    fields: [vendorPayment.vendorId],
    references: [vendors.vendorId]
  }),
  creator: one(users, {
    fields: [vendorPayment.createdBy],
    references: [users.userId]
  }),
  vendorTransaction: one(vendorTransactions, {
    fields: [vendorPayment.vendorTxId],
    references: [vendorTransactions.vendorTxId]
  })
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.orderId]
  }),
  item: one(item, {
    fields: [orderItems.itemId],
    references: [item.itemId]
  }),
}));

export const itemTransactionsRelations = relations(itemTransactions, ({one}) => ({
  order: one(orders, {
    fields: [itemTransactions.orderId],
    references: [orders.orderId]
  }),
  item: one(item, {
    fields: [itemTransactions.itemId],
    references: [item.itemId]
  }),
  inventory: one(inventory, {
    fields: [itemTransactions.inventoryId],
    references: [inventory.inventoryId]
  }),
}));

export const itemOwnersRelations = relations(itemOwners, ({one}) => ({
  item: one(item, {
    fields: [itemOwners.itemId],
    references: [item.itemId]
  }),
  owner: one(users, {
    fields: [itemOwners.ownerId],
    references: [users.userId]
  })
}));