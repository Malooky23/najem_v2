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

const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  companyId: z.string().optional(),
});

type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  companies: { id: string; name: string }[];
}

export function CreateCustomerModal({ open, onClose, companies }: CreateCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
  });

  const onSubmit = async (data: CreateCustomerInput) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create customer");
      }

      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInputField
              form={form}
              name="name"
              label="Name"
              required
            />
            <FormInputField
              form={form}
              name="email"
              label="Email"
              type="email"
              required
            />
            <FormInputField
              form={form}
              name="phone"
              label="Phone"
            />
            <FormSelectField
              form={form}
              name="companyId"
              label="Company"
              options={companies.map(company => ({
                value: company.id,
                label: company.name,
              }))}
              placeholder="Select company"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 