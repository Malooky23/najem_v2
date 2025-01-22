"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createItemSchema,  type ItemDimension } from "@/lib/validations/item";
import { CreateItemInput, ItemOwnerOption, itemTypes, ItemType } from "@/lib/types";
import { useSession } from "next-auth/react";
import { FormInputField } from "@/components/form/form-input-field";
import { FormSelectField } from "@/components/form/form-select-field";

const FORM_FIELDS = {
  basic: [
    { name: "itemName", label: "Name", required: true },
    { name: "itemBarcode", label: "Barcode" },
  ],
  details: [
    { name: "itemBrand", label: "Brand" },
    { name: "itemModel", label: "Model" },
  ],
  dimensions: [
    { name: "itemDimension.length", label: "Length (cm)", type: "number", min: 0 },
    { name: "itemDimension.width", label: "Width (cm)", type: "number", min: 0 },
    { name: "itemDimension.height", label: "Height (cm)", type: "number", min: 0 },
    { name: "weightGrams", label: "Weight (g)", type: "number", min: 0 },
  ],
} as const;

export function CreateItemDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  console.log('Session:', session);
  console.log('User ID:', session?.user?.id);

  const form = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      itemType: "OTHER",
      itemDimension: {
        length: undefined,
        width: undefined,
        height: undefined,
      },
      weightGrams: undefined,
      createdBy: "", // Will be set by useEffect
    },
  });

  // Update createdBy when session is available
  useEffect(() => {
    if (session?.user?.id) {
      form.setValue('createdBy', session.user.id);
    }
  }, [session, form]);

  
  const { data: itemOwners = [] } = useQuery({
      queryKey: ["itemOwners"],
      queryFn: async () => {
          const response = await fetch("/api/item-owners");
          if (!response.ok) throw new Error("Failed to fetch item owners");
          return response.json();
        },
    });
    // Update ownerType when ownerId changes
    useEffect(() => {
      const subscription = form.watch((value, { name }) => {
        if (name === 'ownerId') {
          const owner = itemOwners.find((o: ItemOwnerOption) => o.id === value.ownerId);
          if (owner) {
            form.setValue('ownerType', owner.type);
          }
        }
      });
  
      return () => subscription.unsubscribe();
    }, [form, itemOwners]);
    
    

  const createItem = useMutation({
    mutationFn: async (data: CreateItemInput) => {
      console.log('Mutation called with data:', data);
      const cleanedData = {
        ...data,
        itemDimension: data.itemDimension ? 
          Object.fromEntries(
            Object.entries(data.itemDimension as Record<string, number>)
              .filter(([_, value]) => value !== undefined)
          ) 
          : undefined,
        weightGrams: data.weightGrams || undefined,
      };

      console.log('Cleaned data:', cleanedData);

      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });
      if (!response.ok) throw new Error("Failed to create item");
      return response.json();
    },
    onSuccess: () => {
      console.log('Mutation succeeded');
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast({ title: "Success", description: "Item created successfully" });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreateItemInput) => {
    console.log('Form submitted with data:', data);
    try {
      await createItem.mutateAsync(data);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // Add this to debug form validation
  const handleSubmit = form.handleSubmit(onSubmit);
  console.log('Form state:', {
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
                  form={form}
                  {...field}
                />
              ))}
            </div>

            <FormSelectField
              form={form}
              name="itemType"
              label="Type"
              required
              options={itemTypes.map(type => ({
                value: type,
                label: type.replace('_', ' '),
              }))}
              placeholder="Select item type"
            />

            <FormSelectField
              form={form}
              name="ownerId"
              label="Owner"
              required
              options={itemOwners.map((owner: ItemOwnerOption) => ({
                value: owner.id,
                label: `${owner.name} (${owner.type})`,
              }))}
              placeholder="Select owner"
              onValueChange={(value) => {
                const owner = itemOwners.find((o: ItemOwnerOption) => o.id === value);
                if (owner) {
                  form.setValue("ownerType", owner.type);
                }
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              {FORM_FIELDS.details.map((field) => (
                <FormInputField
                  key={field.name}
                  form={form}
                  {...field}
                />
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              {FORM_FIELDS.dimensions.map((field) => (
                <FormInputField
                  key={field.name}
                  form={form}
                  {...field}
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
                      <Textarea {...field} />
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
              <Button
                type="submit"
                disabled={createItem.isPending}
              >
                {createItem.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 

