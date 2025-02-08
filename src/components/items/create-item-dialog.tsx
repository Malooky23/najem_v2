"use client";

import { useState } from "react";
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
import { VirtualizedSelect, Option } from "@/components/form/VirtualizedSelect";

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
  onSuccess // Optional callback after a successful create
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

  // Use React Query to fetch customers from your newly created API route.
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const createItem = useMutation({
    mutationFn: async (data: CreateItemInput) => {
      const cleanedData = {
        ...data,
        dimensions:
          data.dimensions?.width &&
          data.dimensions.height &&
          data.dimensions.length
            ? {
                width: Number(data.dimensions.width),
                height: Number(data.dimensions.height),
                length: Number(data.dimensions.length),
              }
            : undefined,
        weightGrams: data.weightGrams ? Number(data.weightGrams) : undefined,
        createdBy: session?.user?.id,
      };

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
    try {
      await createItem.mutateAsync(data);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  const customerOptions: Option[] = customersData
    ? customersData.map((customer: any) => ({
        value: customer.customerId,
        label: customer.business
          ? customer.business.businessName
          : customer.individual
          ? `${customer.individual.firstName} ${customer.individual.lastName}`
          : "Unknown",
      }))
    : [];

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
              control={form.control}

              name="packingType"
              label="Packing Type"
              required
              options={itemTypes.map((type) => ({
                value: type,
                label: type.replace("_", " "),
              }))}
              placeholder="Select item type"
            />

            <VirtualizedSelect
              options={customerOptions}
              value={form.getValues("customerId")}
              onChange={(val) => form.setValue("customerId", val)}
              height={250}
            />

            {customersLoading && (
              <div className="text-sm text-muted-foreground">
                Loading customers...
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
