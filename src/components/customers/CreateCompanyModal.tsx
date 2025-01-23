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
import { toast } from "@/hooks/use-toast";
import { createCompanySchema, type CreateCompanyInput } from "@/lib/validations/company";

interface CreateCompanyModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCompanyModal({ open, onClose }: CreateCompanyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
  });

  const onSubmit = async (data: CreateCompanyInput) => {
    console.log('check data', data);
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create company");
      }

      toast({
        title: "Success",
        description: "Company created successfully",
      });
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: "Error",
        description: "Failed to create company",
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
          <DialogTitle>Create New Company</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInputField
              form={form}
              name="comp_name"
              label="Company Name"
              required
            />
            <FormInputField
              form={form}
              name="email"
              label="Email"
              type="email"
            />
            <FormInputField
              form={form}
              name="trn"
              label="TRN"
            />
            <FormInputField
              form={form}
              name="mobile"
              label="Mobile"
            />
            <FormInputField
              form={form}
              name="landline"
              label="Landline"
            />
            <FormInputField
              form={form}
              name="notes"
              label="Notes"
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