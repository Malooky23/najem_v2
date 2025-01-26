// app/dashboard/customers/CreateCustomerModal.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField } from "@/components/form/form-input-field";
import { FormSelectField } from "@/components/form/form-select-field";
import { toast } from "@/hooks/use-toast";
import { customerType } from "@/server/db/schema";
import { FormAddressFields } from "@/components/form/form-address-fields";
import { FormContactDetailsFields } from "@/components/form/form-contact-details-fields";
import { createIndividualCustomerSchema, type CreateIndividualCustomerInput } from "@/lib/validations/customer";

const createCustomerSchema = z.object({
  customerType: z.enum(['INDIVIDUAL', 'BUSINESS']),
  // Common fields
  country: z.string().min(1, "Country is required"),
  notes: z.string().optional(),
  // Individual fields
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  personalId: z.string().optional(),
  // Business fields
  businessName: z.string().optional(),
  taxNumber: z.string().optional(),
  isTaxRegistered: z.boolean().optional(),
});

type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCustomerModal({ open, onClose, onSuccess }: CreateCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerType, setCustomerType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      customerType: 'INDIVIDUAL',
      isTaxRegistered: false
    }
  });

  const individualForm = useForm<CreateIndividualCustomerInput>({
    resolver: zodResolver(createIndividualCustomerSchema),
    defaultValues: {
      contactDetails: [],
    }
  });

  const onSubmit = async (data: CreateCustomerInput) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create customer");
      
      toast({ title: "Success", description: "Customer created successfully" });
      onClose();
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create customer", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onIndividualSubmit = async (data: CreateIndividualCustomerInput) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/customers/individual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create customer");
      
      toast({ title: "Success", description: "Customer created successfully" });
      onClose();
      individualForm.reset();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to create customer", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormSelectField
              form={form}
              name="customerType"
              label="Customer Type"
              options={[
                { value: 'INDIVIDUAL', label: 'Individual' },
                { value: 'BUSINESS', label: 'Business' }
              ]}
              onValueChange={(value) => setCustomerType(value as any)}
            />

            {/* Common Fields */}
            <FormInputField
              form={form}
              name="country"
              label="Country"
              required
            />

            {/* Conditional Fields */}
            {customerType === 'INDIVIDUAL' ? (
              <Form {...individualForm}>
                <form onSubmit={individualForm.handleSubmit(onIndividualSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <FormInputField
                        form={individualForm}
                        name="firstName"
                        label="First Name"
                        required
                      />
                      <FormInputField
                        form={individualForm}
                        name="middleName"
                        label="Middle Name"
                      />
                      <FormInputField
                        form={individualForm}
                        name="lastName"
                        label="Last Name"
                        required
                      />
                      <FormInputField
                        form={individualForm}
                        name="personalId"
                        label="Personal ID"
                      />
                      <FormInputField
                        form={individualForm}
                        name="notes"
                        label="Notes"
                        multiline
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <FormAddressFields form={individualForm} />
                      <FormContactDetailsFields form={individualForm} />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Customer"}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <>
                <FormInputField
                  form={form}
                  name="businessName"
                  label="Business Name"
                  required
                />
                <FormInputField
                  form={form}
                  name="taxNumber"
                  label="Tax Number"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...form.register('isTaxRegistered')}
                    className="h-4 w-4"
                  />
                  <label>Tax Registered</label>
                </div>
              </>
            )}

            <FormInputField
              form={form}
              name="notes"
              label="Notes"
              type="textarea"
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}