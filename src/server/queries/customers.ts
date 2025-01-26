import { db } from '@/server/db';
import { and, eq } from 'drizzle-orm';
import { customers, individualCustomers, businessCustomers, entityContactDetails, contactDetails, entityAddresses, addressDetails } from '@/server/db/schema';

export const getCustomers = async () => {
  const results = await db.select({
    customerId: customers.customerId,
    customerType: customers.customerType,
    createdAt: customers.createdAt,
    updatedAt: customers.updatedAt,
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
  .leftJoin(individualCustomers, eq(customers.customerId, individualCustomers.individualCustomerId))
  .leftJoin(businessCustomers, eq(customers.customerId, businessCustomers.businessCustomerId));

  // Fetch contact details and addresses for each customer
  const enrichedCustomers = await Promise.all(
    results.map(async (customer) => {
      // Get contact details
      const customerContacts = await db
        .select({
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
            eq(entityContactDetails.entityId, customer.customerId)
          )
        );

      // Get addresses
      const customerAddresses = await db
        .select({
          address1: addressDetails.address1,
          address2: addressDetails.address2,
          city: addressDetails.city,
          country: addressDetails.country,
          postalCode: addressDetails.postalCode,
          addressType: entityAddresses.addressType,
        })
        .from(entityAddresses)
        .innerJoin(
          addressDetails,
          eq(addressDetails.addressId, entityAddresses.addressId)
        )
        .where(
          and(
            eq(entityAddresses.entityType, 'CUSTOMER'),
            eq(entityAddresses.entityId, customer.customerId)
          )
        );

      return {
        ...customer,
        contactDetails: customerContacts,
        addresses: customerAddresses,
      };
    })
  );

  return enrichedCustomers;
};