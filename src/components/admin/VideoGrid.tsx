import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, RefreshCw, Clock, VideoIcon, Archive, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
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
  const [detailedLog, setDetailedLog] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState("");
  const ffmpegRef = useRef(new FFmpeg());
  const queryClient = useQueryClient();

  // Navigation warning when generation is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGenerating) {
        const message = "Video generation is in progress. Leaving this page will stop the process. Are you sure?";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGenerating]);

  // Helper function to log with timestamp
  const logWithTimestamp = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    
    console[level]('[VideoGrid]', logMessage);
    setDetailedLog(prev => [...prev, logMessage]);
    
    if (level === 'error') {
      toast.error(message);
    }
  };

  // Helper function to update progress with logging
  const updateProgress = (newProgress: number, message: string, step?: string) => {
    setProgress(newProgress);
    setProgressMessage(message);
    if (step) setCurrentStep(step);
    logWithTimestamp(`Progress: ${Math.round(newProgress)}% - ${message}`);
  };

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
    setDetailedLog([]);
    setStartTime(new Date());
    setCurrentStep("initialization");
    
    logWithTimestamp("=== Video Generation Started ===");
    logWithTimestamp(`Mode: ${mode}, Max Frames: ${maxFrames}, FPS: ${fps}`);
    
    try {
      // Record start of generation
      logWithTimestamp("Recording generation start in database...");
      if (videoGeneration?.id) {
        await supabase
          .from('video_generation')
          .update({
            processed_count: 0,
            last_processed_drawing_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', videoGeneration.id);
        logWithTimestamp("Database record updated successfully");
      }
      
      const targetFrames = Math.min(parseInt(maxFrames), mode === "daily" ? 50 : 300);
      logWithTimestamp(`Target frames calculated: ${targetFrames}`);
      
      // Initialize FFmpeg if needed
      updateProgress(5, "Loading video processor...", "ffmpeg-loading");
      
      const ffmpeg = ffmpegRef.current;
      logWithTimestamp(`FFmpeg loaded status: ${ffmpeg.loaded}`);
      
      if (!ffmpeg.loaded) {
        const cdnUrls = [
          'https://cdn.jsdelivr.net/npm/@ffmpeg/core-st@0.12.6/dist/esm',
          'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/esm'
        ];
        
        logWithTimestamp("Starting FFmpeg load from CDNs...");
        let loadError;
        let loadedSuccessfully = false;
        
        for (let i = 0; i < cdnUrls.length; i++) {
          const baseURL = cdnUrls[i];
          try {
            logWithTimestamp(`Attempting to load FFmpeg from CDN ${i + 1}/${cdnUrls.length}: ${baseURL}`);
            updateProgress(5 + (i * 2), `Loading FFmpeg from CDN ${i + 1}...`);
            
            const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
            const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
            const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');
            
            logWithTimestamp("Blob URLs created, loading FFmpeg...");
            
            await ffmpeg.load({
              coreURL,
              wasmURL,
              workerURL,
            });
            
            loadedSuccessfully = true;
            logWithTimestamp(`FFmpeg loaded successfully from ${baseURL}`);
            break;
          } catch (error) {
            loadError = error;
            logWithTimestamp(`Failed to load FFmpeg from ${baseURL}: ${error}`, 'warn');
          }
        }
        
        if (!loadedSuccessfully || !ffmpeg.loaded) {
          throw new Error(`Failed to load FFmpeg from all CDNs. Last error: ${loadError?.message}`);
        }
      }
      
      updateProgress(15, "Fetching approved drawings...", "fetching-drawings");
      
      // Fetch approved drawings
      logWithTimestamp("Querying database for approved drawings...");
      const { data: drawings } = await supabase
        .from('drawings')
        .select('image_path')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(targetFrames);

      if (!drawings || drawings.length === 0) {
        throw new Error('No approved drawings found');
      }
      
      logWithTimestamp(`Found ${drawings.length} approved drawings`);
      updateProgress(25, `Downloading ${drawings.length} images...`, "downloading-images");
      
      // Download and prepare images
      let successfulDownloads = 0;
      for (let i = 0; i < drawings.length; i++) {
        const drawing = drawings[i];
        const fileName = drawing.image_path.split('/').pop() || '';
        const imageUrl = supabase.storage.from('optimized').getPublicUrl(fileName).data.publicUrl;
        
        try {
          logWithTimestamp(`Downloading image ${i + 1}/${drawings.length}: ${fileName}`);
          const imageData = await fetchFile(imageUrl);
          await ffmpeg.writeFile(`image_${i.toString().padStart(4, '0')}.jpg`, imageData);
          successfulDownloads++;
          logWithTimestamp(`Successfully processed image ${i + 1}`);
        } catch (err) {
          logWithTimestamp(`Failed to load image ${drawing.image_path}: ${err}`, 'warn');
        }
        
        const progressPercent = 25 + (i / drawings.length) * 40;
        updateProgress(progressPercent, `Downloaded ${i + 1}/${drawings.length} images (${successfulDownloads} successful)...`);
      }
      
      if (successfulDownloads === 0) {
        throw new Error('Failed to download any images');
      }
      
      logWithTimestamp(`Image download completed: ${successfulDownloads}/${drawings.length} successful`);
      
      updateProgress(70, "Creating video...", "video-generation");
      
      // Generate video using FFmpeg
      const frameDuration = 1 / parseInt(fps);
      const totalDuration = successfulDownloads * frameDuration;
      
      logWithTimestamp(`Starting video generation with ${successfulDownloads} frames, ${fps} FPS, ${totalDuration}s duration`);
      
      const ffmpegArgs = [
        '-framerate', fps,
        '-i', 'image_%04d.jpg',
        '-vf', 'scale=650:650:force_original_aspect_ratio=decrease,pad=650:650:(ow-iw)/2:(oh-ih)/2,setsar=1',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-t', totalDuration.toString(),
        'output.mp4'
      ];
      
      logWithTimestamp(`FFmpeg command: ${ffmpegArgs.join(' ')}`);
      await ffmpeg.exec(ffmpegArgs);
      
      updateProgress(85, "Finalizing video...", "finalizing");
      
      // Read the generated video
      logWithTimestamp("Reading generated video file...");
      const videoData = await ffmpeg.readFile('output.mp4');
      const videoBlob = new Blob([videoData], { type: 'video/mp4' });
      
      logWithTimestamp(`Video blob created: ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`);
      updateProgress(95, "Uploading video...", "uploading");
      
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
      logWithTimestamp("Updating database with completion status...");
      if (videoGeneration?.id) {
        await supabase
          .from('video_generation')
          .update({
            processed_count: successfulDownloads,
            last_processed_drawing_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', videoGeneration.id);
      }
      
      updateProgress(100, "Video generation complete!", "complete");
      
      const endTime = new Date();
      const elapsedMs = endTime.getTime() - (startTime?.getTime() || 0);
      const elapsedSeconds = Math.round(elapsedMs / 1000);
      
      logWithTimestamp(`=== Video Generation Completed Successfully ===`);
      logWithTimestamp(`Total time: ${elapsedSeconds} seconds`);
      logWithTimestamp(`Processed frames: ${successfulDownloads}/${drawings.length}`);
      
      toast.success(`Successfully generated ${mode} video with ${successfulDownloads} frames in ${elapsedSeconds}s`);
      
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
      const endTime = new Date();
      const elapsedMs = endTime.getTime() - (startTime?.getTime() || 0);
      const elapsedSeconds = Math.round(elapsedMs / 1000);
      
      logWithTimestamp(`=== Video Generation Failed ===`, 'error');
      logWithTimestamp(`Error: ${error.message}`, 'error');
      logWithTimestamp(`Failed after ${elapsedSeconds} seconds`, 'error');
      logWithTimestamp(`Current step: ${currentStep}`, 'error');
      
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
          logWithTimestamp("Error state recorded in database");
        }
      } catch (logErr) {
        logWithTimestamp(`Failed to record error state: ${logErr}`, 'warn');
      }
      
      toast.error(`Failed to generate video: ${error.message}`);
      // Ensure UI reflects completion state
      queryClient.invalidateQueries({ queryKey: ["video-generation"] });
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setProgressMessage("");
      setCurrentStep("");
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
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Video generation is in progress. Do not navigate away from this page or close your browser until complete.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  {progressMessage && (
                    <p className="text-sm text-muted-foreground">{progressMessage}</p>
                  )}
                  {currentStep && (
                    <p className="text-xs text-muted-foreground">Step: {currentStep}</p>
                  )}
                  {startTime && (
                    <p className="text-xs text-muted-foreground">
                      Elapsed: {Math.floor((new Date().getTime() - startTime.getTime()) / 1000)}s
                    </p>
                  )}
                </div>
                
                {detailedLog.length > 0 && (
                  <div className="mt-2">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Show detailed logs ({detailedLog.length} entries)
                      </summary>
                      <div className="mt-2 max-h-32 overflow-y-auto bg-muted/30 p-2 rounded text-xs font-mono">
                        {detailedLog.slice(-10).map((log, i) => (
                          <div key={i} className="text-muted-foreground">{log}</div>
                        ))}
                      </div>
                    </details>
                  </div>
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