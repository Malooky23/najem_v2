"use client";

import { useState, useEffect } from "react";
// import { CreateIndividualModal } from "./CreateIndividualModal";
// import { CreateBusinessModal } from "./CreateBusinessModal";
import { CreateCustomerModal } from "./CreateCustomerModal";

export function CustomerPageClient() {
  const [showCreateIndividual, setShowCreateIndividual] = useState(false);
  const [showCreateBusiness, setShowCreateBusiness] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const individualButton = target.closest(".create-individual-button");
      const businessButton = target.closest(".create-business-button");

      if (individualButton) {
        e.preventDefault();
        setShowCreateIndividual(true);
      }
      if (businessButton) {
        e.preventDefault();
        setShowCreateBusiness(true);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleIndividualCreated = () => {
    setShowCreateIndividual(false);
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
        open={showCreateBusiness}
        onClose={() => setShowCreateBusiness(false)}
        onSuccess={handleBusinessCreated}
        type="business"
      />
      <CreateCustomerModal
        open={showCreateIndividual}
        onClose={() => setShowCreateIndividual(false)}
        onSuccess={handleBusinessCreated}
        type="individual"
      />
      
    </>
  );
}
