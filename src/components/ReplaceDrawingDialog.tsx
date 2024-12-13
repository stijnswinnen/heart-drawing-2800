import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReplaceDrawingDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ReplaceDrawingDialog = ({ onConfirm, onCancel }: ReplaceDrawingDialogProps) => {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent aria-describedby="replace-drawing-description">
        <AlertDialogHeader>
          <AlertDialogTitle>Replace Existing Drawing?</AlertDialogTitle>
          <AlertDialogDescription id="replace-drawing-description">
            You already have a drawing submitted. Would you like to replace it with your new drawing?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Replace Drawing</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};