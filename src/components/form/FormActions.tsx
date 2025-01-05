import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onClose: () => void;
  isVerifying: boolean;
}

export const FormActions = ({ onClose, isVerifying }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onClose}>
        Annuleer
      </Button>
      <Button type="submit" disabled={isVerifying}>
        {isVerifying ? "Bezig met versturen..." : "Verzend hart"}
      </Button>
    </div>
  );
};