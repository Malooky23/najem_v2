import { relations } from "drizzle-orm/relations";
import { address, company, users, customer, employee, item, inventory, itemHierarchy, orders, vendors, vendorServices, vendorPayment, vendorLedger, vendorTransactions, orderItems, itemTransactions, itemOwners } from "./schema";

export const companyRelations = relations(company, ({one, many}) => ({
	address: one(address, {
		fields: [company.addressId],
		references: [address.addressId]
	}),
	customers: many(customer),
}));

export const addressRelations = relations(address, ({many}) => ({
	companies: many(company),
	customers: many(customer),
	orders: many(orders),
}));

export const customerRelations = relations(customer, ({one, many}) => ({
	user: one(users, {
		fields: [customer.userId],
		references: [users.userId]
	}),
	company: one(company, {
		fields: [customer.compId],
		references: [company.compId]
	}),
	address: one(address, {
		fields: [customer.addressId],
		references: [address.addressId]
	}),
	orders: many(orders),
	vendorTransactions: many(vendorTransactions),
}));

export const usersRelations = relations(users, ({many}) => ({
	customers: many(customer),
	employees: many(employee),
	items: many(item),
	orders: many(orders),
	vendorServices: many(vendorServices),
}));

export const employeeRelations = relations(employee, ({one, many}) => ({
	user: one(users, {
		fields: [employee.userId],
		references: [users.userId]
	}),
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

export const inventoryRelations = relations(inventory, ({one, many}) => ({
	item: one(item, {
		fields: [inventory.itemId],
		references: [item.itemId]
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
	user: one(users, {
		fields: [orders.creatorId],
		references: [users.userId]
	}),
	customer: one(customer, {
		fields: [orders.cusId],
		references: [customer.cusId]
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
	user: one(users, {
		fields: [vendorServices.createdBy],
		references: [users.userId]
	}),
	vendorTransactions: many(vendorTransactions),
}));

export const vendorsRelations = relations(vendors, ({many}) => ({
	vendorServices: many(vendorServices),
	vendorPayments: many(vendorPayment),
	vendorLedgers: many(vendorLedger),
	vendorTransactions: many(vendorTransactions),
}));

export const vendorPaymentRelations = relations(vendorPayment, ({one}) => ({
	vendor: one(vendors, {
		fields: [vendorPayment.vendorId],
		references: [vendors.vendorId]
	}),
	employee: one(employee, {
		fields: [vendorPayment.empId],
		references: [employee.empId]
	}),
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
	customer: one(customer, {
		fields: [vendorTransactions.cusId],
		references: [customer.cusId]
	}),
	vendorService: one(vendorServices, {
		fields: [vendorTransactions.vendorServiceId],
		references: [vendorServices.vendorServiceId]
	}),
	employee: one(employee, {
		fields: [vendorTransactions.empId],
		references: [employee.empId]
	}),
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
}));