import { Lock } from "lucide-react";

interface LockButtonProps {
  onClick: () => void;
}

export const LockButton = ({ onClick }: LockButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 left-4 p-2 text-gray-300 hover:text-gray-500 transition-colors"
    >
      <Lock className="w-5 h-5" />
    </button>
  );
};