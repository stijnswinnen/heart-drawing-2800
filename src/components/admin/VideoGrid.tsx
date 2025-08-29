import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, RefreshCw, Clock, VideoIcon, Archive, AlertTriangle } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

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
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const ffmpegRef = useRef(new FFmpeg());
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
    setProgress(0);
    setProgressMessage("Initializing video generation...");
    
    try {
      // Record start of generation
      if (videoGeneration?.id) {
        await supabase
          .from('video_generation')
          .update({
            processed_count: 0,
            last_processed_drawing_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', videoGeneration.id);
      }
      const targetFrames = Math.min(parseInt(maxFrames), mode === "daily" ? 50 : 300);
      
      // Initialize FFmpeg if needed
      setProgressMessage("Loading video processor...");
      setProgress(5);
      
      const ffmpeg = ffmpegRef.current;
      
      if (!ffmpeg.loaded) {
        const cdnUrls = [
          'https://cdn.jsdelivr.net/npm/@ffmpeg/core-st@0.12.6/dist/esm',
          'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/esm'
        ];
        
        let loadError;
        for (const baseURL of cdnUrls) {
          try {
            await ffmpeg.load({
              coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
              wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
              workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
            });
            break; // Success, exit the loop
          } catch (error) {
            loadError = error;
            console.warn(`Failed to load FFmpeg from ${baseURL}:`, error);
          }
        }
        
        if (!ffmpeg.loaded) {
          throw new Error(`Failed to load FFmpeg from all CDNs. Last error: ${loadError?.message}`);
        }
      }
      
      setProgressMessage("Fetching approved drawings...");
      setProgress(15);
      
      // Fetch approved drawings
      const { data: drawings } = await supabase
        .from('drawings')
        .select('image_path')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(targetFrames);

      if (!drawings || drawings.length === 0) {
        throw new Error('No approved drawings found');
      }
      
      setProgressMessage(`Downloading ${drawings.length} images...`);
      setProgress(25);
      
      // Download and prepare images
      for (let i = 0; i < drawings.length; i++) {
        const drawing = drawings[i];
        const imageUrl = supabase.storage.from('optimized').getPublicUrl(drawing.image_path.split('/').pop() || '').data.publicUrl;
        
        try {
          const imageData = await fetchFile(imageUrl);
          await ffmpeg.writeFile(`image_${i.toString().padStart(4, '0')}.jpg`, imageData);
        } catch (err) {
          console.warn(`Failed to load image ${drawing.image_path}, skipping...`);
        }
        
        setProgress(25 + (i / drawings.length) * 40);
        setProgressMessage(`Downloaded ${i + 1}/${drawings.length} images...`);
      }
      
      setProgressMessage("Creating video...");
      setProgress(70);
      
      // Generate video using FFmpeg
      const frameDuration = 1 / parseInt(fps);
      await ffmpeg.exec([
        '-framerate', fps,
        '-i', 'image_%04d.jpg',
        '-vf', 'scale=650:650:force_original_aspect_ratio=decrease,pad=650:650:(ow-iw)/2:(oh-ih)/2,setsar=1',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-t', (drawings.length * frameDuration).toString(),
        'output.mp4'
      ]);
      
      setProgressMessage("Finalizing video...");
      setProgress(85);
      
      // Read the generated video
      const videoData = await ffmpeg.readFile('output.mp4');
      const videoBlob = new Blob([videoData], { type: 'video/mp4' });
      
      setProgressMessage("Uploading video...");
      setProgress(95);
      
      // Upload to storage
      const videoPath = `${mode}/hearts-compilation.mp4`;
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(videoPath, videoBlob, { 
          upsert: true,
          contentType: 'video/mp4'
        });
      
      if (uploadError) throw uploadError;
      
      // Update generation record
      if (videoGeneration?.id) {
        await supabase
          .from('video_generation')
          .update({
            processed_count: drawings.length,
            last_processed_drawing_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', videoGeneration.id);
      }
      
      setProgress(100);
      setProgressMessage("Video generation complete!");
      
      toast.success(`Successfully generated ${mode} video with ${drawings.length} frames`);
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["video-generation"] });
      
      // Clean up FFmpeg files
      try {
        for (let i = 0; i < drawings.length; i++) {
          await ffmpeg.deleteFile(`image_${i.toString().padStart(4, '0')}.jpg`);
        }
        await ffmpeg.deleteFile('output.mp4');
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }
      
    } catch (error: any) {
      console.error('Video generation error:', error);
      // Record failed generation attempt for visibility in the status card
      try {
        if (videoGeneration?.id) {
          await supabase
            .from('video_generation')
            .update({
              processed_count: 0,
              last_processed_drawing_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', videoGeneration.id);
        }
      } catch (logErr) {
        console.warn('Failed to record error state:', logErr);
      }
      toast.error(`Failed to generate video: ${error.message}`);
      // Ensure UI reflects completion state
      queryClient.invalidateQueries({ queryKey: ["video-generation"] });
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setProgressMessage("");
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
                {parseInt(maxFrames) > (mode === "daily" ? 50 : 300) && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Exceeds limit
                  </Badge>
                )}
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                {progressMessage && (
                  <p className="text-sm text-muted-foreground">{progressMessage}</p>
                )}
              </div>
            )}

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