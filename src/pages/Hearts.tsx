import { Navigation } from "@/components/Navigation";
import { RandomApprovedHeart } from "@/components/RandomApprovedHeart";
import { ApprovedHeartsCarousel } from "@/components/ApprovedHeartsCarousel";

export default function Hearts() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4">
        <RandomApprovedHeart />
        <ApprovedHeartsCarousel />
      </div>
    </div>
  );
}