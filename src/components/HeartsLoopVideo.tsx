import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RandomApprovedHeart } from "./RandomApprovedHeart";

export function HeartsLoopVideo() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const fetchLoopVideo = async () => {
      const { data, error } = await supabase
        .from("hearts_loop_video")
        .select("video_path")
        .maybeSingle();

      if (!error && data?.video_path) {
        const { data: pub } = supabase.storage
          .from("videos")
          .getPublicUrl(data.video_path);
        setVideoUrl(pub.publicUrl);
      }
      setIsLoading(false);
    };

    fetchLoopVideo();
  }, []);

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading hearts...</div>;
  }

  if (!videoUrl || videoFailed) {
    return <RandomApprovedHeart />;
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 px-4 md:px-8">
      <h1 className="text-[100px] md:text-[150px] font-bold font-['Montserrat_Alternates'] text-center">
        2800
      </h1>
      <div className="w-[250px] h-[250px] md:w-[300px] md:h-[300px] animate-fade-in">
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoFailed(true)}
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
}
