"use client";

import { useState } from 'react';
import { CreateCustomerModal } from './CreateCustomerModal';
import { CreateCompanyModal } from './CreateCompanyModal';

export function CustomerPageClient() {
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);

  // Add click event listeners to the buttons
  if (typeof window !== 'undefined') {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.create-customer-button')) {
        setShowCreateCustomer(true);
      }
      if (target.closest('.create-company-button')) {
        setShowCreateCompany(true);
      }
    });
  }

  return (
    <>
      {showCreateCustomer && (
        <CreateCustomerModal
          open={showCreateCustomer}
          onClose={() => setShowCreateCustomer(false)}
          companies={[]} // You'll need to fetch companies and pass them here
        />
      )}
      {showCreateCompany && (
        <CreateCompanyModal
          open={showCreateCompany}
          onClose={() => setShowCreateCompany(false)}
        />
      )}
    </>
  );
} 