import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

interface PrivacyConsentFieldProps {
  form: UseFormReturn<any>;
}

export const PrivacyConsentField = ({ form }: PrivacyConsentFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="privacyConsent"
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
              Ik heb kennisgenomen van de{" "}
              <a 
                href="/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                privacyverklaring
              </a>{" "}
              en ga hiermee akkoord.
            </label>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};