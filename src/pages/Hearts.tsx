import { Navigation } from "@/components/Navigation";
import { RandomApprovedHeart } from "@/components/RandomApprovedHeart";
import { HeartTrail } from "@/components/HeartTrail";
import { HomeFooter } from "@/components/HomeFooter";

export default function Hearts() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeartTrail />
      <Navigation />
      <div className="container mx-auto px-4 flex-grow flex items-center justify-center pt-4">
        <RandomApprovedHeart />
      </div>
      <HomeFooter />
    </div>
  );
}