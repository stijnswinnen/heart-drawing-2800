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

export const ReplaceDrawingDialog = ({
  onConfirm,
  onCancel,
}: ReplaceDrawingDialogProps) => {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Replace Existing Drawing?</AlertDialogTitle>
          <AlertDialogDescription>
            You have already submitted a heart drawing. Would you like to replace it with your new drawing?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>No, Keep Original</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Yes, Replace</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};