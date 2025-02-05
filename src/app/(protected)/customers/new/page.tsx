// ////// CLAUDE REWRITE
// "use client";
// // 'use cache'
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import { Form } from "@/components/ui/form";
// import { FormInputField } from "@/components/form/form-input-field";
// import { FormSwitchField } from "@/components/form/form-switch-field";
// import { toast } from "@/hooks/use-toast";
// import { contactType } from "@/server/db/schema";
// import {
//   createBusinessCustomerSchema,
//   ContactTypeType,
// } from "@/lib/validations/customer";
// import { useRouter } from "next/navigation";

// // Constants
// const CONTACT_TYPE_OPTIONS = [
//   { value: "email", label: "Email" },
//   { value: "mobile", label: "Mobile" },
//   { value: "landline", label: "Landline" },
//   { value: "other", label: "Other" },
// ];

// const DEFAULT_VALUES = {
//   businessName: "",
//   country: "",
//   isTaxRegistered: false,
//   taxNumber: "",
//   address: {
//     address1: "",
//     address2: "",
//     city: "",
//     postalCode: "",
//     country: "",
//   },
//   contacts: [
//     {
//       contact_type: "email" as ContactTypeType,
//       contact_data: "",
//       is_primary: true,
//     },
//   ],
// };

// export default function CreateBusinessPage() {
//   const router = useRouter();
//   const form = useForm({
//     resolver: zodResolver(createBusinessCustomerSchema),
//     defaultValues: DEFAULT_VALUES,
//   });

//   const handleSubmit = async (
//     data: z.infer<typeof createBusinessCustomerSchema>
//   ) => {
//     try {
//       const cleanedData = {
//         ...data,
//         taxNumber: data.isTaxRegistered ? data.taxNumber || null : null,
//         contacts: data.contacts.map((contact) => ({
//           contact_type: contact.contact_type.toLowerCase(),
//           contact_data: contact.contact_data,
//           is_primary: contact.is_primary,
//         })),
//       };

//       const response = await fetch("/api/customers/business", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(cleanedData),
//       });

//       const result = await response.json();

//       if (result.success) {
//         toast({
//           title: "Success",
//           description: "Business created successfully!",
//         });
//         form.reset();
//         router.push('/customers');
//       } else {
//         toast({
//           title: "Error",
//           description: result.error || "Failed to create business",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       console.error(error);
//       toast({
//         title: "Error",
//         description: "Failed to create business",
//         variant: "destructive",
//       });
//     }
//   };

//   const addContact = () => {
//     const currentContacts = form.getValues().contacts;
//     form.setValue("contacts", [
//       ...currentContacts,
//       {
//         contact_type: "email" as ContactTypeType,
//         contact_data: "",
//         is_primary: false,
//       },
//     ]);
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Create New Business Customer</h1>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
//           {/* Basic Information */}
//           <div className="space-y-4">
//             <FormInputField
//               control={form.control}
//               name="businessName"
//               label="Business Name"
//               placeholder="Acme Corp"
//               required
//             />
//             <FormInputField
//               control={form.control}
//               name="country"
//               label="Country"
//               placeholder="Country"
//               required
//             />
//             <FormSwitchField
//               control={form.control}
//               form={form}
//               name="isTaxRegistered"
//               label="Tax Registered"
//             />
//             {form.watch("isTaxRegistered") && (
//               <FormInputField
//                 control={form.control}
//                 name="taxNumber"
//                 label="Tax Registration Number"
//                 placeholder="Tax ID"
//               />
//             )}
//           </div>

//           {/* Address Section */}
//           <AddressSection control={form.control} />

//           {/* Contacts Section */}
//           <ContactsSection
//             control={form.control}
//             form={form}
//             contacts={form.watch("contacts")}
//             onAddContact={addContact}
//           />

//           <Button type="submit" className="w-full">
//             Create Business
//           </Button>
//         </form>
//       </Form>
//     </div>
//   );
// }

// // Separate components for better organization
// function AddressSection({ control }: { control: any }) {
//   return (
//     <div className="space-y-4 border p-4 rounded-lg">
//       <h3 className="font-medium">Address Information</h3>
//       {["address1", "address2", "city", "postalCode", "country"].map(
//         (field) => (
//           <FormInputField
//             key={field}
//             control={control}
//             name={`address.${field}`}
//             label={field.charAt(0).toUpperCase() + field.slice(1)}
//             required={field === "address2" ? false : true}
//           />
//         )
//       )}
//     </div>
//   );
// }

// function ContactsSection({
//   control,
//   form,
//   contacts,
//   onAddContact,
// }: {
//   control: any;
//   form: any;
//   contacts: any[];
//   onAddContact: () => void;
// }) {
//   return (
//     <div className="space-y-4 border p-4 rounded-lg">
//       <h3 className="font-medium">Contact Information</h3>
//       {contacts.map((_, index) => (
//         <div key={index} className="space-y-2">
//           <FormInputField
//             control={control}
//             name={`contacts.${index}.contact_data`}
//             label="Contact Data"
//             placeholder="email@example.com or +1234567890"
//             required
//           />
//           <div className="flex gap-4 items-center">
//             <FormInputField
//               control={control}
//               name={`contacts.${index}.contact_type`}
//               label="Type"
//               as="select"
//               placeholder='Email'
//               options={CONTACT_TYPE_OPTIONS}
//             />
//             <FormSwitchField
//               control={control}
//               form={form}
//               name={`contacts.${index}.is_primary`}
//               label="Primary"
//             />
//           </div>
//         </div>
//       ))}
//       <Button type="button" variant="outline" onClick={onAddContact}>
//         Add Contact
//       </Button>
//     </div>
//   );
// }
