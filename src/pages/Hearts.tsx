import { Navigation } from "@/components/Navigation";
import { RandomApprovedHeart } from "@/components/RandomApprovedHeart";
import { HeartTrail } from "@/components/HeartTrail";

export default function Hearts() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeartTrail />
      <Navigation />
      <div className="container mx-auto px-4 flex-grow flex items-center justify-center">
        <RandomApprovedHeart />
      </div>
    </div>
  );
}