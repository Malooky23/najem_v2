// 'use server'

// import { db } from '@/server/db';
// import { and, eq } from 'drizzle-orm';
// import {
//   customers,
//   individualCustomers,
//   businessCustomers,
//   entityContactDetails,
//   contactDetails,
//   entityAddresses,
//   addressDetails,
// } from '@/server/db/schema';
// import { unstable_cache } from 'next/cache';
// import { type EnrichedCustomer } from '@/lib/types/customer'
// import { revalidateTag } from 'next/cache';
// import { CACHE_KEYS, CACHE_TAGS, CACHE_REVALIDATE_SECONDS } from '@/lib/config/cache';

// // Helper function to create a delay
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// export const getCustomers = unstable_cache(
//   async (): Promise<EnrichedCustomer[]> => {
//     try {
//       // Add a 5-second delay at the beginning
//       // console.log('Fetching customers...');
//       // await delay(5000);
//       // console.log('Customers fetched 5 seconds');

//       // Fetch customer data
//       const results = await db
//         .select({
//           customerId: customers.customerId,
//           customerNumber: customers.customerNumber,
//           customerType: customers.customerType,
//           createdAt: customers.createdAt,
//           updatedAt: customers.updatedAt,
//           country: customers.country,
//           individual: {
//             firstName: individualCustomers.firstName,
//             middleName: individualCustomers.middleName,
//             lastName: individualCustomers.lastName,
//             personalId: individualCustomers.personalID,
//           },
//           business: {
//             businessName: businessCustomers.businessName,
//             taxRegistrationNumber: businessCustomers.taxNumber,
//             isTaxRegistered: businessCustomers.isTaxRegistered,
//           },
//         })
//         .from(customers)
//         .leftJoin(
//           individualCustomers,
//           eq(customers.customerId, individualCustomers.individualCustomerId)
//         )
//         .leftJoin(
//           businessCustomers,
//           eq(customers.customerId, businessCustomers.businessCustomerId)
//         );

//       // Add a 2-second delay after fetching customer data

//       // Fetch contact details and addresses for each customer
//       const enrichedCustomers = await Promise.all(
//         results.map(async (customer) => {
//           // Add a 1-second delay before fetching contact details for each customer

//           // Get contact details
//           const customerContacts = await db
//             .select({
//               contactType: contactDetails.contactType,
//               contactData: contactDetails.contactData,
//               isPrimary: contactDetails.isPrimary,
//             })
//             .from(entityContactDetails)
//             .innerJoin(
//               contactDetails,
//               eq(contactDetails.contactDetailsId, entityContactDetails.contactDetailsId)
//             )
//             .where(
//               and(
//                 eq(entityContactDetails.entityType, 'CUSTOMER'),
//                 eq(entityContactDetails.entityId, customer.customerId)
//               )
//             );

//           // Add a 1-second delay before fetching addresses for each customer

//           // Get addresses
//           const customerAddresses = await db
//             .select({
//               address1: addressDetails.address1,
//               address2: addressDetails.address2,
//               city: addressDetails.city,
//               country: addressDetails.country,
//               postalCode: addressDetails.postalCode,
//             })
//             .from(entityAddresses)
//             .innerJoin(
//               addressDetails,
//               eq(addressDetails.addressId, entityAddresses.addressId)
//             )
//             .where(
//               and(
//                 eq(entityAddresses.entityType, 'CUSTOMER'),
//                 eq(entityAddresses.entityId, customer.customerId)
//               )
//             );

//           return {
//             ...customer,
//             contactDetails: customerContacts,
//             addresses: customerAddresses,
//           };
//         })
//       );

//       return enrichedCustomers as EnrichedCustomer[];
//     } catch (error) {
//       console.error('[GET_CUSTOMERS_CACHE]', error);
//       throw error;
//     }
//   },
//   [CACHE_KEYS.customers],
//   {
//     tags: [CACHE_TAGS.customers],
//     revalidate: CACHE_REVALIDATE_SECONDS.customers
//   }
// );

// // Add a revalidation helper
// export async function revalidateCustomers() {
//   revalidateTag(CACHE_TAGS.customers);
// }

