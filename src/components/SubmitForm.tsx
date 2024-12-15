import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Naam moet minstens 2 karakters bevatten.",
  }),
  email: z.string().email({
    message: "Gelieve een geldig e-mailadres in te vullen.",
  }),
  newsletter: z.boolean().default(false),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: "Je moet akkoord gaan met de privacyverklaring om verder te gaan.",
  }),
});

interface SubmitFormProps {
  onClose: () => void;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

export const SubmitForm = ({ onClose, onSubmit }: SubmitFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      newsletter: false,
      privacyConsent: false,
    },
  });

  return (
    <Dialog defaultOpen onOpenChange={onClose}>
      <DialogContent aria-describedby="submit-form-description">
        <DialogHeader>
          <DialogTitle>Verstuur je hart</DialogTitle>
          <DialogDescription id="submit-form-description">
            Gelieve onderstaande gegevens in te vullen om jouw hart tekening te versturen.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naam</FormLabel>
                  <FormControl>
                    <Input placeholder="Jouw naam" {...field} />
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
                  <FormLabel>E-mailadres</FormLabel>
                  <FormControl>
                    <Input placeholder="jouw.mail@voorbeeld.be" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <FormLabel>
                      Ik schrijf me in op de nieuwsbrief
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
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
                    <FormLabel className="text-sm">
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
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuleer
              </Button>
              <Button type="submit">Verzend hart</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};