"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField } from "@/components/form/form-input-field";
import { FormSwitchField } from "@/components/form/form-switch-field";
import { toast } from "@/hooks/use-toast";
import { createBusinessCustomerSchema, type CreateBusinessCustomerInput } from "@/lib/validations/customer";
import { FormAddressFields } from "@/components/form/form-address-fields";
import { FormContactDetailsFields } from "@/components/form/form-contact-details-fields";

interface CreateBusinessModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateBusinessModal({ open, onClose, onSuccess }: CreateBusinessModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateBusinessCustomerInput>({
    resolver: zodResolver(createBusinessCustomerSchema),
    defaultValues: {
      isTaxRegistered: false,
      contactDetails: [],
    }
  });

  const onSubmit = async (data: CreateBusinessCustomerInput) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/customers/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create business customer");
      }

      toast({
        title: "Success",
        description: "Business customer created successfully",
      });
      onClose();
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating business customer:', error);
      toast({
        title: "Error",
        description: "Failed to create business customer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Business Customer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <FormInputField
                  form={form}
                  name="businessName"
                  label="Business Name"
                  required
                />
                <FormSwitchField
                  form={form}
                  name="isTaxRegistered"
                  label="Tax Registered"
                />
                {form.watch("isTaxRegistered") && (
                  <FormInputField
                    form={form}
                    name="taxRegistrationNumber"
                    label="Tax Registration Number"
                  />
                )}
                <FormInputField
                  form={form}
                  name="notes"
                  label="Notes"
                  type="textarea"
                />
              </div>
              
              <div className="space-y-4">
                <FormAddressFields form={form} />
                <FormContactDetailsFields form={form} />
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
                {isSubmitting ? "Creating..." : "Create Business"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
