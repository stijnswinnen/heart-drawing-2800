import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { z } from "zod";

interface SubmitFormProps {
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; newsletter: boolean }) => void;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

export const SubmitForm = ({ onClose, onSubmit }: SubmitFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      formSchema.parse({ name, email });
      onSubmit({ name, email, newsletter });
      toast.success("Thank you for your submission! ❤️");
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = {};
        error.errors.forEach((err) => {
          formattedErrors[err.path[0]] = err.message;
        });
        setErrors(formattedErrors);
      }
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Your Heart</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={newsletter}
              onCheckedChange={(checked) => setNewsletter(checked as boolean)}
            />
            <Label htmlFor="newsletter" className="text-sm">
              Yes, I want to receive news and updates on the 2800.love project.
            </Label>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Submit
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};