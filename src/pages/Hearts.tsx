import { Navigation } from "@/components/Navigation";
import { RandomApprovedHeart } from "@/components/RandomApprovedHeart";

export default function Hearts() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4">
        <RandomApprovedHeart />
      </div>
    </div>
  );
}