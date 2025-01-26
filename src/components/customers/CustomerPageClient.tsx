"use client";

import { useState, useEffect } from 'react';
import { CreateCustomerModal } from './CreateCustomerModal';
import { CreateBusinessModal } from './CreateBusinessModal';

export function CustomerPageClient() {
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showCreateBusiness, setShowCreateBusiness] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const customerButton = target.closest('.create-customer-button');
      const businessButton = target.closest('.create-business-button');

      if (customerButton) {
        e.preventDefault();
        setShowCreateCustomer(true);
      }
      if (businessButton) {
        e.preventDefault();
        setShowCreateBusiness(true);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleCustomerCreated = () => {
    setShowCreateCustomer(false);
    // You might want to refresh the customer list here
    window.location.reload();
  };

  const handleBusinessCreated = () => {
    setShowCreateBusiness(false);
    // You might want to refresh the customer list here
    window.location.reload();
  };

  return (
    <>
      <CreateCustomerModal
        open={showCreateCustomer}
        onClose={() => setShowCreateCustomer(false)}
        onSuccess={handleCustomerCreated}
      />
      <CreateBusinessModal
        open={showCreateBusiness}
        onClose={() => setShowCreateBusiness(false)}
        onSuccess={handleBusinessCreated}
      />
    </>
  );
}