import { Navigation } from "@/components/Navigation";
import { RandomApprovedHeart } from "@/components/RandomApprovedHeart";

export default function Hearts() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="container mx-auto px-4 flex-grow flex items-center justify-center">
        <RandomApprovedHeart />
      </div>
    </div>
  );
}