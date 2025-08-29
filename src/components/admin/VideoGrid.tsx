import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, RefreshCw, Clock, VideoIcon, Archive } from "lucide-react";

interface VideoGenerationLog {
  timestamp: string;
  mode: string;
  maxFrames: number;
  fps: number;
  duration: string;
  status: 'success' | 'error';
  message?: string;
  videoPath?: string;
}

export const VideoGrid = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<"daily" | "archive">("daily");
  const [maxFrames, setMaxFrames] = useState("50");
  const [fps, setFps] = useState("2");
  const queryClient = useQueryClient();

  const { data: videoGeneration } = useQuery({
    queryKey: ["video-generation"],
    queryFn: async () => {
      const { data } = await supabase
        .from("video_generation")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1);
      return data?.[0] || null;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: approvedDrawings } = useQuery({
    queryKey: ["approved-drawings-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("drawings")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");
      return count || 0;
    },
  });

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-daily-video', {
        body: {
          mode,
          maxFrames: parseInt(maxFrames),
          fps: parseInt(fps),
          source: "admin"
        }
      });

      if (error) throw error;

      toast.success(`Video generation started in ${mode} mode`);
      
      // Refresh the video generation status
      queryClient.invalidateQueries({ queryKey: ["video-generation"] });
    } catch (error: any) {
      console.error('Video generation error:', error);
      toast.error(`Failed to generate video: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getVideoUrl = (path: string) => {
    const { data } = supabase.storage.from('videos').getPublicUrl(path);
    return data.publicUrl;
  };

  const renderVideoPlayer = (path: string) => (
    <div className="mt-4">
      <video
        controls
        className="w-full max-w-md rounded-lg"
        preload="metadata"
      >
        <source src={getVideoUrl(path)} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Video Management</h1>
          <p className="text-muted-foreground">
            Generate and manage heart compilation videos
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Generation Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Generate Video
            </CardTitle>
            <CardDescription>
              Create a new video compilation from approved hearts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mode">Generation Mode</Label>
              <Select value={mode} onValueChange={(value: "daily" | "archive") => setMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    <div className="flex items-center gap-2">
                      <VideoIcon className="h-4 w-4" />
                      Daily (Max 50 frames)
                    </div>
                  </SelectItem>
                  <SelectItem value="archive">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      Archive (Max 300 frames)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFrames">Max Frames</Label>
              <Input
                id="maxFrames"
                type="number"
                value={maxFrames}
                onChange={(e) => setMaxFrames(e.target.value)}
                min="1"
                max={mode === "daily" ? "50" : "300"}
              />
              <p className="text-sm text-muted-foreground">
                Current limit: {mode === "daily" ? "50" : "300"} frames
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fps">Frames per Second</Label>
              <Input
                id="fps"
                type="number"
                value={fps}
                onChange={(e) => setFps(e.target.value)}
                min="1"
                max="10"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {approvedDrawings} approved hearts available
                </Badge>
              </div>
            </div>

            <Button 
              onClick={handleGenerateVideo} 
              disabled={isGenerating || !approvedDrawings}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Status & Latest Video */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Generation Status
            </CardTitle>
            <CardDescription>
              Current generation status and latest videos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {videoGeneration ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Last Generation</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(videoGeneration.updated_at).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Processed Count</p>
                  <Badge variant="secondary">
                    {videoGeneration.processed_count} frames
                  </Badge>
                </div>

                <Separator />

                {/* Latest Daily Video */}
                <div>
                  <p className="text-sm font-medium mb-2">Latest Daily Video</p>
                  {renderVideoPlayer("daily/hearts-compilation.mp4")}
                </div>

                {/* Latest Archive Video */}
                <div>
                  <p className="text-sm font-medium mb-2">Latest Archive Video</p>
                  {renderVideoPlayer("archive/hearts-compilation.mp4")}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No video generation history found
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};