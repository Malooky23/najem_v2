'use server'

import { db } from '@/server/db';
import { and, eq, inArray } from 'drizzle-orm';
import {
  customers,
  individualCustomers,
  businessCustomers,
  entityContactDetails,
  contactDetails,
  entityAddresses,
  addressDetails,
} from '@/server/db/schema';
import { unstable_cache } from 'next/cache';
import { type EnrichedCustomer } from '@/lib/types/customer'
import { revalidateTag } from 'next/cache';
// import { CACHE_KEYS, CACHE_TAGS, CACHE_REVALIDATE_SECONDS } from '@/lib/config/cache';

/**
 * Utility function to group items by a specified key.
 */
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// export const getCustomers = unstable_cache(
export const getCustomers = (

  async (): Promise<EnrichedCustomer[]> => {
    try {
      // Fetch primary customer data (without contact details and addresses)
      const customerRecords = await db
        .select({
          customerId: customers.customerId,
          customerNumber: customers.customerNumber,
          customerType: customers.customerType,
          createdAt: customers.createdAt,
          updatedAt: customers.updatedAt,
          country: customers.country,
          notes: customers.notes,
          individual: {
            firstName: individualCustomers.firstName,
            middleName: individualCustomers.middleName,
            lastName: individualCustomers.lastName,
            personalId: individualCustomers.personalID,
          },
          business: {
            businessName: businessCustomers.businessName,
            taxRegistrationNumber: businessCustomers.taxNumber,
            isTaxRegistered: businessCustomers.isTaxRegistered,
          },
        })
        .from(customers)
        .leftJoin(
          individualCustomers,
          eq(customers.customerId, individualCustomers.individualCustomerId)
        )
        .leftJoin(
          businessCustomers,
          eq(customers.customerId, businessCustomers.businessCustomerId)
        );

      // Extract all customer IDs
      const customerIds = customerRecords.map((cust) => cust.customerId);

      // Fetch all contact details in one query
      const contacts = await db
        .select({
          customerId: entityContactDetails.entityId, // to know which customer these belong to
          contactType: contactDetails.contactType,
          contactData: contactDetails.contactData,
          isPrimary: contactDetails.isPrimary,
        })
        .from(entityContactDetails)
        .innerJoin(
          contactDetails,
          eq(contactDetails.contactDetailsId, entityContactDetails.contactDetailsId)
        )
        .where(
          and(
            eq(entityContactDetails.entityType, 'CUSTOMER'),
            // Using the IN operator to filter by customerIds
            inArray(entityContactDetails.entityId, customerIds)

          )
        );

      // Group contacts by customerId for quick look-up
      const groupedContacts = groupBy(contacts, 'customerId');

      // Fetch all addresses in one query
      const addresses = await db
        .select({
          customerId: entityAddresses.entityId,
          address1: addressDetails.address1,
          address2: addressDetails.address2,
          city: addressDetails.city,
          country: addressDetails.country,
          postalCode: addressDetails.postalCode,
        })
        .from(entityAddresses)
        .innerJoin(
          addressDetails,
          eq(addressDetails.addressId, entityAddresses.addressId)
        )
        .where(
          and(
            eq(entityAddresses.entityType, 'CUSTOMER'),
            inArray(entityAddresses.entityId, customerIds)
          )
        );

      // Group addresses by customerId for quick look-up
      const groupedAddresses = groupBy(addresses, 'customerId');

      // Merge the contact details and addresses with the primary customer records
      const enrichedCustomers = customerRecords.map((customer) => ({
        ...customer,
        contactDetails: groupedContacts[customer.customerId] || [],
        addresses: groupedAddresses[customer.customerId] || [],
      }));

      return enrichedCustomers as EnrichedCustomer[];
    } catch (error) {
      console.error('[GET_CUSTOMERS_CACHE]', error);
      throw error;
    }
  // },
  // [CACHE_KEYS.customers],
  // {
  //   tags: [CACHE_TAGS.customers],
  //   revalidate: CACHE_REVALIDATE_SECONDS.customers
  // }
// );
  })

// Add a revalidation helper
export async function revalidateCustomers() {
  // revalidateTag(CACHE_TAGS.customers);
  console.log("something called revalidate cache tags")
}