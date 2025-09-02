import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
interface NewsletterFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}
export const NewsletterField = ({
  form,
  disabled
}: NewsletterFieldProps) => {
  return <FormField control={form.control} name="newsletter" render={({
    field
  }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} className="text-base bg-white text-stone-950" />
          </FormControl>
          <FormLabel className="font-normal">
            Ik wil graag op de hoogte blijven van nieuws en updates.
          </FormLabel>
        </FormItem>} />;
};