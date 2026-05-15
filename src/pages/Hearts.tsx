import { Navigation } from "@/components/Navigation";
import { HeartsLoopVideo } from "@/components/HeartsLoopVideo";
import { HeartTrail } from "@/components/HeartTrail";
import { HomeFooter } from "@/components/HomeFooter";
import { Seo } from "@/components/Seo";

export default function Hearts() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Seo
        title="Hartjes voor Mechelen · 2800.love"
        description="Ontdek de groeiende collectie hartjes voor 2800. Elk hart is getekend door iemand met liefde voor Mechelen."
        path="/hearts"
      />
      <HeartTrail />
      <Navigation />
      <div className="container mx-auto px-4 flex-grow flex items-center justify-center pt-4">
        <HeartsLoopVideo />
      </div>
      <HomeFooter />
    </div>
  );
}