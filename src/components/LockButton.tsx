import { Lock } from "lucide-react";

interface LockButtonProps {
  onClick: () => void;
}

export const LockButton = ({ onClick }: LockButtonProps) => {
  return (
    <div className="fixed bottom-4 left-4 flex items-center gap-4">
      <button
        onClick={onClick}
        className="p-2 text-gray-300 hover:text-gray-500 transition-colors"
      >
        <Lock className="w-5 h-5" />
      </button>
      <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-300 hover:text-gray-500 transition-colors text-sm"
      >
        Privacy Policy
      </a>
    </div>
  );
};