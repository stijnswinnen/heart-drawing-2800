import { AuthDialogContent } from "./auth/AuthDialogContent";
import { useAuthStateChange } from "./auth/useAuthStateChange";

interface AuthDialogProps {
  onClose: () => void;
}

export const AuthDialog = ({ onClose }: AuthDialogProps) => {
  useAuthStateChange(onClose);
  return <AuthDialogContent onClose={onClose} />;
};