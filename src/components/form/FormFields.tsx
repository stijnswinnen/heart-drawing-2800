import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormFieldsProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

export const FormFields = ({ form, disabled }: FormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Jouw naam</FormLabel>
            <FormControl>
              <Input 
                placeholder="Vul je naam in" 
                {...field} 
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Jouw e-mailadres</FormLabel>
            <FormControl>
              <Input 
                type="email" 
                placeholder="Vul je e-mailadres in" 
                {...field} 
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};