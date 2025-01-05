import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

interface NewsletterFieldProps {
  form: UseFormReturn<any>;
}

export const NewsletterField = ({ form }: NewsletterFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="newsletter"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <label className="text-sm">
              Ik schrijf me in op de nieuwsbrief
            </label>
          </div>
        </FormItem>
      )}
    />
  );
};