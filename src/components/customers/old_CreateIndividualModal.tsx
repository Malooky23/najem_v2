// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Form } from "@/components/ui/form";
// import { FormInputField } from "@/components/form/form-input-field";
// import { FormSwitchField } from "@/components/form/form-switch-field";
// import { FormComboboxField } from "@/components/form/form-combobox-field";
// import { toast } from "@/hooks/use-toast";
// import {
//   ContactTypeType,
//   createIndividualCustomerSchema,
// } from "@/lib/validations/customer";
// import React from "react";
// import { CONTACT_TYPE_OPTIONS } from "@/constants/contact_details";
// import { COUNTRIES } from "@/constants/countries";
// import { CustomerModalProps } from "@/lib/types/customer";




// const DEFAULT_VALUES = {
//   firstName: "",
//   middleName: "",
//   lastName: "",
//   personalId: "",
//   country: "",
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

// export function CreateIndividualModal({
//   open,
//   onClose,
//   onSuccess,
// }: CustomerModalProps) {
//   const form = useForm({
//     resolver: zodResolver(createIndividualCustomerSchema),
//     defaultValues: DEFAULT_VALUES,
//   });

//   const individualCountry = form.watch("country");
  
//   React.useEffect(() => {
//     if (individualCountry && !form.getValues("address.country")) {
//       form.setValue("address.country", individualCountry);
//     }
//   }, [individualCountry, form]);

//   const handleSubmit = async (
//     data: z.infer<typeof createIndividualCustomerSchema>
//   ) => {
//     try {
//       const cleanedData = {
//         ...data,
//         contacts: data.contacts.map((contact) => ({
//           contact_type: contact.contact_type.toLowerCase(),
//           contact_data: contact.contact_data,
//           is_primary: contact.is_primary,
//         })),
//       };

//       const response = await fetch("/api/customers/individual", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(cleanedData),
//       });

//       const result = await response.json();

//       if (result.success) {
//         toast({
//           title: "Success",
//           description: "Individual created successfully!",
//         });
//         form.reset();
//         onSuccess?.();
//         onClose();
//       } else {
//         toast({
//           title: "Error",
//           description: result.error || "Failed to create individual",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       console.error(error);
//       toast({
//         title: "Error",
//         description: "Failed to create individual",
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

//   const memoizedCountries = React.useMemo(() => COUNTRIES, []);

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
//         <DialogHeader>
//           <DialogTitle>Create New Individual Customer</DialogTitle>
//         </DialogHeader>

//         <Form {...form}>
//           <form 
//             onSubmit={form.handleSubmit(handleSubmit)} 
//             className="flex-1 flex flex-col overflow-hidden"
//           >
//             {/* Scrollable Content */}
//             <div className="flex-1 overflow-y-auto px-6">
//               <div className="space-y-6 pb-6"> {/* Added bottom padding */}
//                 {/* Basic Information */}
//                 <div className="space-y-4">
//                   <FormInputField
//                     control={form.control}
//                     name="firstName"
//                     label="First Name"
//                     placeholder="John"
//                     required
//                   />
//                   <FormInputField
//                     control={form.control}
//                     name="middleName"
//                     label="Middle Name"
//                     placeholder="Doe"
//                   />
//                   <FormInputField
//                     control={form.control}
//                     name="lastName"
//                     label="Last Name"
//                     placeholder="Smith"
//                     required
//                   />
//                   <FormInputField
//                     control={form.control}
//                     name="personalId"
//                     label="Personal ID"
//                     placeholder="1234567890"
//                   />
//                   <FormInputField
//                     control={form.control}
//                     name="country"
//                     label="Country"
//                     placeholder="Select a country"
//                     options={memoizedCountries}
//                     required
//                   />
//                 </div>

//                 {/* Address Section */}
//                 <AddressSection control={form.control} countryOptions={memoizedCountries} />

//                 {/* Contacts Section */}
//                 <ContactsSection
//                   control={form.control}
//                   form={form}
//                   contacts={form.watch("contacts")}
//                   onAddContact={addContact}
//                 />
//               </div>
//             </div>

//             {/* Fixed Footer */}
//             <div className="border-t p-6 mt-auto">
//               <div className="flex justify-end gap-2">
//                 <Button type="button" variant="outline" onClick={onClose}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">Create Individual</Button>
//               </div>
//             </div>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// function AddressSection({ control, countryOptions }: { control: any, countryOptions: typeof COUNTRIES }) {
//   const memoizedCountryOptions = React.useMemo(() => countryOptions, [countryOptions]);

//   return (
//     <div className="space-y-4 border p-4 rounded-lg">
//       <h3 className="font-medium">Address Information</h3>
//       <FormInputField
//         control={control}
//         name="address.address1"
//         label="Address 1"
//         required
//       />
//       <FormInputField
//         control={control}
//         name="address.address2"
//         label="Address 2"
//       />
//       <FormInputField
//         control={control}
//         name="address.city"
//         label="City"
//         required
//       />
//       <FormInputField
//         control={control}
//         name="address.postalCode"
//         label="Postal Code"
//         required
//       />
//       <FormComboboxField
//         control={control}
//         name="address.country"
//         label="Country"
//         options={memoizedCountryOptions}
//         required
//       />
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

