import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, RefreshCw, Clock, VideoIcon, Archive, AlertTriangle, ExternalLink, Loader2, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface VideoJob {
  id: string;
  job_type: 'daily' | 'archive';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  max_frames: number;
  fps: number;
  video_path?: string;
  error_message?: string;
  logs: any; // Using any for JSONB logs from Supabase
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export const VideoGrid = () => {
  const [mode, setMode] = useState<"daily" | "archive">("daily");
  const [maxFrames, setMaxFrames] = useState("50");
  const [fps, setFps] = useState("2");
  const [sorting, setSorting] = useState<"new_to_old" | "random">("new_to_old");
  const [activeJob, setActiveJob] = useState<VideoJob | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<VideoJob | null>(null);
  const queryClient = useQueryClient();

  // Fetch approved drawings count
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

  // Fetch video jobs
  const { data: videoJobs, refetch: refetchJobs } = useQuery({
    queryKey: ["video-jobs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("video_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      return (data || []) as VideoJob[];
    },
    refetchInterval: 2000,
  });

  // Set active job (most recent processing job or null)
  useEffect(() => {
    const processingJob = videoJobs?.find(job => job.status === 'processing' || job.status === 'pending');
    setActiveJob(processingJob || null);
  }, [videoJobs]);

  // Periodically check status for active jobs
  useEffect(() => {
    if (!activeJob) return;

    const checkJobStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await supabase.functions.invoke('video-jobs-status', {
          body: { jobId: activeJob.id },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          }
        });
      } catch (error) {
        console.error('Error checking job status:', error);
      }
    };

    const interval = setInterval(checkJobStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [activeJob]);

  // Subscribe to real-time updates for video jobs
  useEffect(() => {
    const channel = supabase
      .channel('video-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_jobs'
        },
        (payload) => {
          console.log('Video job update:', payload);
          refetchJobs();
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedJob = payload.new as VideoJob;
            if (updatedJob.status === 'completed') {
              toast.success(`Video ${updatedJob.job_type} generation completed!`);
            } else if (updatedJob.status === 'failed') {
              toast.error(`Video ${updatedJob.job_type} generation failed: ${updatedJob.error_message}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchJobs]);

  const handleGenerateVideo = async () => {
    if (activeJob) {
      toast.error("A video generation is already in progress");
      return;
    }

    const targetFrames = mode === "daily" ? 50 : parseInt(maxFrames);
    
    try {
      toast.loading("Creating video generation job...");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke('video-jobs-create', {
        body: {
          mode,
          maxFrames: targetFrames,
          fps: parseInt(fps),
          sorting
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create video job');
      }

      const result = response.data;
      if (!result.success) {
        throw new Error(result.error || 'Failed to create video job');
      }

      toast.success("Video generation job created successfully!");
      refetchJobs();

    } catch (error: any) {
      console.error('Error creating video job:', error);
      toast.error(`Failed to create video job: ${error.message}`);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleDeleteJob = (job: VideoJob) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteJob = async () => {
    if (!selectedJob) return;

    try {
      toast.loading("Deleting job...");

      const { error } = await supabase
        .from('video_jobs')
        .delete()
        .eq('id', selectedJob.id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Job deleted successfully!");
      refetchJobs();
      setDeleteDialogOpen(false);
      setSelectedJob(null);

    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast.error(`Failed to delete job: ${error.message}`);
    }
  };

  const latestCompletedJobs = videoJobs?.filter(job => job.status === 'completed' && job.video_path) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Video Management</h1>
          <p className="text-muted-foreground">
            Generate and manage heart compilation videos using cloud processing
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
              Create a new video compilation from approved hearts using Rendi.dev cloud processing
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
                      Daily (50 frames)
                    </div>
                  </SelectItem>
                  <SelectItem value="archive">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      Archive (choose amount)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "archive" && (
              <div className="space-y-2">
                <Label htmlFor="maxFrames">Number of frames</Label>
                <Input
                  id="maxFrames"
                  type="number"
                  value={maxFrames}
                  onChange={(e) => setMaxFrames(e.target.value)}
                  min="1"
                  placeholder="Enter number of frames"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="sorting">Sorting</Label>
              <Select value={sorting} onValueChange={(value: "new_to_old" | "random") => setSorting(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_to_old">New to old</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                </SelectContent>
              </Select>
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

            {activeJob && (
              <div className="space-y-3">
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Video generation is in progress. Je kan dit veilig sluiten - de job blijft lopen in de cloud.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Voortgang</span>
                    <span>{activeJob.progress}%</span>
                  </div>
                  <Progress value={activeJob.progress} className="w-full" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(activeJob.status)}
                      <span>{activeJob.job_type} video - {activeJob.max_frames} frames @ {activeJob.fps} FPS</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          if (!session) throw new Error('Niet aangemeld');
                          toast.loading('Bezig met stoppen...');
                          const { error, data } = await supabase.functions.invoke('video-jobs-cancel', {
                            body: { jobId: activeJob.id },
                            headers: { Authorization: `Bearer ${session.access_token}` },
                          });
                          if (error) throw new Error(error.message);
                          if (!data?.success) throw new Error(data?.error || 'Stoppen mislukt');
                          toast.success('Job gestopt');
                          await refetchJobs();
                        } catch (e: any) {
                          console.error(e);
                          toast.error(e.message || 'Stoppen mislukt');
                        }
                      }}
                      disabled={activeJob.status !== 'processing' && activeJob.status !== 'pending'}
                    >
                      Stoppen
                    </Button>
                  </div>

                  {activeJob.logs && activeJob.logs.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Laatste log:</p>
                      <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                        {activeJob.logs[activeJob.logs.length - 1]?.message || 'Geen recente logs'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button 
              onClick={handleGenerateVideo} 
              disabled={!!activeJob || !approvedDrawings}
              className="w-full"
            >
              {activeJob ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generation in Progress...
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

        {/* Job History & Latest Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Job History & Videos
            </CardTitle>
            <CardDescription>
              Recent generation jobs and completed videos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Job History */}
            <div>
              <p className="text-sm font-medium mb-2">Recent Jobs</p>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                      {videoJobs && videoJobs.length > 0 ? (
                        videoJobs.map((job) => (
                           <div key={job.id} className="flex items-center justify-between p-2 border rounded-lg">
                             <div className="flex items-center gap-2">
                               {getStatusIcon(job.status)}
                               <div>
                                 <p className="text-sm font-medium">
                                   {job.job_type} - {job.max_frames} frames
                                 </p>
                                 <p className="text-xs text-muted-foreground">
                                   {new Date(job.created_at).toLocaleString()}
                                 </p>
                               </div>
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="text-right space-y-1">
                                 {getStatusBadge(job.status)}
                                 {job.status === 'processing' && (
                                   <div className="flex items-center gap-2 justify-end">
                                     <p className="text-xs text-muted-foreground">{job.progress}%</p>
                                     <Button
                                       variant="destructive"
                                       size="sm"
                                       onClick={async () => {
                                         try {
                                           const { data: { session } } = await supabase.auth.getSession();
                                           if (!session) throw new Error('Niet aangemeld');
                                           toast.loading('Bezig met stoppen...');
                                           const { error, data } = await supabase.functions.invoke('video-jobs-cancel', {
                                             body: { jobId: job.id },
                                             headers: { Authorization: `Bearer ${session.access_token}` },
                                           });
                                           if (error) throw new Error(error.message);
                                           if (!data?.success) throw new Error(data?.error || 'Stoppen mislukt');
                                           toast.success('Job gestopt');
                                           await refetchJobs();
                                         } catch (e: any) {
                                           console.error(e);
                                           toast.error(e.message || 'Stoppen mislukt');
                                         }
                                       }}
                                     >
                                       Stoppen
                                     </Button>
                                   </div>
                                 )}
                               </div>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleDeleteJob(job)}
                                 className="text-red-500 hover:text-red-700 hover:bg-red-50"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                        ))
                      ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No jobs found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Latest Videos */}
            {latestCompletedJobs.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Latest Completed Videos</p>
                <div className="space-y-4">
                  {latestCompletedJobs.slice(0, 2).map((job) => (
                    <div key={job.id}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          {job.job_type} - {job.max_frames} frames
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {new Date(job.completed_at!).toLocaleDateString()}
                        </Badge>
                      </div>
                      {job.video_path && renderVideoPlayer(job.video_path)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {latestCompletedJobs.length === 0 && (
              <div className="text-center py-8">
                <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No completed videos yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate your first video to see results here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verwijder Video Job</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze video job wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
              {selectedJob && (
                <div className="mt-4 p-3 bg-muted rounded-lg space-y-2">
                  <p><strong>Type:</strong> {selectedJob.job_type}</p>
                  <p><strong>Frames:</strong> {selectedJob.max_frames}</p>
                  <p><strong>FPS:</strong> {selectedJob.fps}</p>
                  <p><strong>Status:</strong> {selectedJob.status}</p>
                  <p><strong>Aangemaakt:</strong> {new Date(selectedJob.created_at).toLocaleString()}</p>
                  {selectedJob.video_path && (
                    <p className="text-yellow-600">
                      <strong>Waarschuwing:</strong> Deze job heeft een bijbehorende video die ook verloren gaat.
                    </p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteJob}
              className="bg-red-600 hover:bg-red-700"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};