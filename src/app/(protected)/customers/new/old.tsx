"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputField } from "@/components/form/form-input-field";
import { FormSwitchField } from "@/components/form/form-switch-field";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { contactType as drizzleContactType } from "@/server/db/schema";

const ContactType = z.enum(drizzleContactType.enumValues);
type ContactTypeType = z.infer<typeof ContactType>;

const businessSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  country: z.string().min(2, "Country is required"),
  isTaxRegistered: z.boolean().default(false),
  taxNumber: z.string().optional(),
  address: z.object({
    address1: z.string().min(2),
    address2: z.string().min(2),
    city: z.string().min(2),
    postalCode: z.string().min(2),
    country: z.string().min(2),
  }),
  contacts: z
    .array(
      z.object({
        type: ContactType,
        data: z.string().min(3),
        isPrimary: z.boolean().default(false),
      })
    )
    .min(1, "At least one contact required"),
});

export default function CreateBusinessPage() {
  const form = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: "",
      country: "",
      isTaxRegistered: false,
      taxNumber: "",
      address: {
        address1: "",
        address2: "",
        city: "",
        postalCode: "",
        country: "",
      },
      contacts: [
        {
          type: "email" as ContactTypeType,
          data: "",
          isPrimary: true,
        },
      ],
    },
  });

  const onSubmit = async (data: z.infer<typeof businessSchema>) => {
    try {
      const response = await fetch("/api/customers/business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: data.businessName,
          country: data.country,
          isTaxRegistered: data.isTaxRegistered,
          taxNumber: data.taxNumber || "", // Ensure empty string if undefined
          address: data.address,
          contacts: data.contacts.map((contact) => ({
            contact_type: contact.type.toLowerCase(), // Ensure lowercase enum value
            contact_data: contact.data,
            is_primary: contact.isPrimary,
          })),
        }),
      });

      const result = await response.json();
      console.log("result", result);
      if (result.success) {
        toast({
          title: "Success",
          description: "Business created successfully!",
        });
        form.reset();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create business",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create business",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Business Customer</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormInputField
            control={form.control}
            // form={form}
            name="businessName"
            label="Business Name"
            placeholder="Acme Corp"
            required
          />

          <FormInputField
            control={form.control}
            // form={form}
            name="country"
            label="Country"
            placeholder="Country"
            required
          />

          <FormSwitchField
            control={form.control}
            form={form}
            name="isTaxRegistered"
            label="Tax Registered"
          />

          {form.watch("isTaxRegistered") && (
            <FormInputField
              control={form.control}
              //   form={form}
              name="taxNumber"
              label="Tax Registration Number"
              placeholder="Tax ID"
            />
          )}

          <div className="space-y-4 border p-4 rounded-lg">
            <h3 className="font-medium">Address Information</h3>
            <FormInputField
              control={form.control}
              //   form={form}
              name="address.address1"
              label="Street Address"
              required
            />
            <FormInputField
              control={form.control}
              //   form={form}
              name="address.address2"
              label="Street Address 2"
              required
            />
            <FormInputField
              control={form.control}
              //   form={form}
              name="address.city"
              label="City"
              required
            />
            <FormInputField
              control={form.control}
              //   form={form}
              name="address.postalCode"
              label="Postal Code"
              required
            />
            <FormInputField
              control={form.control}
              //   form={form}
              name="address.country"
              label="Country"
              required
            />
          </div>

          <div className="space-y-4 border p-4 rounded-lg">
            <h3 className="font-medium">Contact Information</h3>
            {form.watch("contacts").map((_, index) => (
              <div key={index} className="space-y-2">
                <FormInputField
                  control={form.control}
                  name={`contacts.${index}.data`}
                  label="Contact Data"
                  placeholder="email@example.com or +1234567890"
                  required
                />
                <div className="flex gap-4 items-center">
                  <FormInputField
                    control={form.control}
                    name={`contacts.${index}.type`}
                    label="Type"
                    as="select"
                    options={[
                      { value: "email", label: "Email" },
                      { value: "mobile", label: "Mobile" },
                    ]}
                  />
                  <FormSwitchField
                    control={form.control}
                    form={form}
                    name={`contacts.${index}.isPrimary`}
                    label="Primary"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.setValue("contacts", [
                  ...form.getValues().contacts,
                  {
                    type: "email",
                    data: "",
                    isPrimary: false,
                  },
                ]);
              }}
            >
              Add Contact
            </Button>
          </div>

          <Button type="submit" className="w-full">
            Create Business
          </Button>
        </form>
      </Form>
    </div>
  );
}
