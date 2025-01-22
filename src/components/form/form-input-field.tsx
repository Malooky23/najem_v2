import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface FormInputFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
}

export function FormInputField({
  form,
  name,
  label,
  type = "text",
  required = false,
  placeholder,
  min,
}: FormInputFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label} {required && "*"}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              min={min}
              {...field}
              onChange={e => {
                if (type === "number") {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  field.onChange(value);
                } else {
                  field.onChange(e.target.value);
                }
              }}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 