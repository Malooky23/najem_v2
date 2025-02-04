"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createItemSchema, CreateItemInput, itemTypes, Item } from "./types";
import { useSession } from "next-auth/react";
import { FormInputField } from "@/components/form/form-input-field";
import { FormSelectField } from "@/components/form/form-select-field";
import { EnrichedCustomer } from "@/lib/types/customer";
import { z } from "zod";

const FORM_FIELDS = {
  basic: [
    { name: "itemName", label: "Name", required: true },
  ],
  details: [
    { name: "itemBrand", label: "Brand" },
    { name: "itemModel", label: "Model" },
    { name: "itemCountryOfOrigin", label: "Country of Origin" },
    { name: "itemBarcode", label: "Barcode" },

  ],
  dimensions: [
    { name: "dimensions.length", label: "Length (cm)", type: "number", min: 0, step: 1 },
    { name: "dimensions.width", label: "Width (cm)", type: "number", min: 0, step: 1 },
    { name: "dimensions.height", label: "Height (cm)", type: "number", min: 0, step: 1 },
    { name: "weightGrams", label: "Weight (g)", type: "number", min: 0, step: 1 },
  ],
} as const;

export function CreateItemDialog({ 
  children,
  onSuccess // Add success callback prop
}: { 
  children: React.ReactNode;
  onSuccess?: (item: Item) => void;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const form = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      itemType: "OTHER",
      dimensions: {
        length: undefined,
        width: undefined,
        height: undefined,
      },
      weightGrams: undefined,
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
    initialData: () => queryClient.getQueryData(["customers"]),
    staleTime: 60 * 60 * 1000, // 1 hour to match page revalidation
  });

  const createItem = useMutation({
    mutationFn: async (data: CreateItemInput) => {
      console.log("Mutation called with data:", data);
      const cleanedData = {
        ...data,
        dimensions: data.dimensions?.width && data.dimensions.height && data.dimensions.length
          ? {
              width: Number(data.dimensions.width),
              height: Number(data.dimensions.height),
              length: Number(data.dimensions.length),
            }
          : undefined,
        weightGrams: data.weightGrams ? Number(data.weightGrams) : undefined,
        createdBy: session?.user?.id,
      };

      console.log("Cleaned data:", cleanedData);

      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create item");
      }
      return response.json();
    },
    onSuccess: (item: Item) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast({
        title: "Success",
        description: "Item created successfully",
      });
      setOpen(false);
      form.reset();
      onSuccess?.(item);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreateItemInput) => {
    console.log("Form submitted with data:", data);
    try {
      await createItem.mutateAsync(data);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  // Add this to debug form validation
  const handleSubmit = form.handleSubmit(onSubmit);
  console.log("Form state111111111:", {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    values: form.getValues(),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {FORM_FIELDS.basic.map((field) => (
                <FormInputField
                  key={field.name}
                  control={form.control}
                  name={field.name}
                  label={field.label}
                />
              ))}
            </div>


            <FormSelectField
              form={form}
              name="packingType"
              label="Packing Type"
              required
              options={itemTypes.map((type) => ({
                value: type,
                label: type.replace("_", " "),
              }))}
              placeholder="Select item type"
            />

            <FormSelectField
              form={form}
              name="customerId"
              label="Customer"
              required
              options={
                customers
                  ?.slice() // Create a copy to avoid mutating original array
                  .sort(
                    (
                      a: {
                        business: { businessName: string };
                        individual: { firstName: any; lastName: any };
                      },
                      b: {
                        business: { businessName: string };
                        individual: { firstName: any; lastName: any };
                      }
                    ) => {
                      const aName =
                        a.business?.businessName ||
                        `${a.individual?.firstName} ${a.individual?.lastName}`;
                      const bName =
                        b.business?.businessName ||
                        `${b.individual?.firstName} ${b.individual?.lastName}`;
                      return aName.localeCompare(bName);
                    }
                  )
                  .map(
                    (customer: {
                      customerId: any;
                      business: { businessName: any };
                      individual: { firstName: any; lastName: any };
                    }) => ({
                      value: customer.customerId,
                      label:
                        customer.business?.businessName ||
                        `${customer.individual?.firstName} ${customer.individual?.lastName}`,
                    })
                  ) || []
              }
              placeholder="Select customer"
            />

            {customers?.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No customers found. Please create customers first.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {FORM_FIELDS.details.map((field) => (
                <FormInputField
                  key={field.name}
                  control={form.control}
                  name={field.name}
                  label={field.label}
                />
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              {FORM_FIELDS.dimensions.map((field) => (
                <FormInputField
                  key={field.name}
                  control={form.control}
                  name={field.name}
                  label={field.label}
                />
              ))}
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createItem.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createItem.isPending}>
                {createItem.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
