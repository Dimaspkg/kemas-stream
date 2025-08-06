
'use client';
import { useState, useEffect } from 'react';
import { FallbackForm } from '@/components/video-player';
import { getFallbackContent, type FallbackContent, getScheduledVideos, type Schedule, getActiveContent } from '@/services/video-service';
import { PreviewDialog } from '@/components/schedule/preview-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, differenceInSeconds } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';


function CountdownTimer({ startTime, endTime }: { startTime: Date; endTime: Date }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diffStart = differenceInSeconds(startTime, now);
  const diffEnd = differenceInSeconds(endTime, now);

  if (diffStart > 0) {
    const days = Math.floor(diffStart / (60 * 60 * 24));
    const hours = Math.floor((diffStart % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((diffStart % (60 * 60)) / 60);
    const seconds = diffStart % 60;
    return (
      <div className="text-right">
        <div className="text-xs text-muted-foreground">Akan Datang Dalam:</div>
        <div className="text-lg font-semibold text-primary">
            {days > 0 && `${days}h `}{`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
        </div>
      </div>
    );
  }

  if (diffEnd > 0) {
    return (
      <div className="text-right">
          <div className="text-sm font-semibold text-green-600">
            Sedang Tayang
          </div>
      </div>
    );
  }

  return (
    <div className="text-right">
        <div className="text-sm text-muted-foreground">
            Telah Selesai
        </div>
    </div>
  );
}

function onContentChange(callback: (content: FallbackContent | null) => void): () => void {
  const handleUpdate = async () => {
    const content = await getActiveContent();
    callback(content);
  };

  handleUpdate();

  const scheduleUnsubscribe = onSnapshot(collection(db, 'schedule'), handleUpdate);
  const fallbackUnsubscribe = onSnapshot(doc(db, 'settings', 'fallbackContent'), handleUpdate);

  return () => {
    scheduleUnsubscribe();
    fallbackUnsubscribe();
  };
}

export default function AdminPage() {
    const [fallbackContent, setFallbackContent] = useState<FallbackContent | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [activeContent, setActiveContent] = useState<FallbackContent | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
      async function fetchSchedules() {
        const scheduledData = await getScheduledVideos();
        setSchedules(scheduledData);
      }
      fetchSchedules();

      const unsubscribe = onContentChange((content) => {
        setActiveContent(content);
        setIsLoadingPreview(false);
      });

      return () => unsubscribe();
    }, []);

    const handleFallbackUpdate = (content: FallbackContent) => {
      setFallbackContent(content);
      // If no schedule is active, the active content might be the fallback.
      // We can re-fetch active content to be sure.
      getActiveContent().then(setActiveContent);
    };

    const handleCopyUrl = (url: string) => {
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: "URL Copied",
          description: "The content URL has been copied to your clipboard.",
        });
      }).catch(err => {
        console.error('Failed to copy URL: ', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy URL.",
        });
      });
    };

  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
           <h2 className="text-2xl font-bold tracking-tight mb-4">Fallback Content</h2>
          <FallbackForm setFallbackContentOnPage={handleFallbackUpdate} />
        </div>
        <div>
           <h2 className="text-2xl font-bold tracking-tight mb-4">Live Preview</h2>
          {isLoadingPreview ? (
            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                <Skeleton className="h-full w-full" />
            </div>
           ) : activeContent?.url ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center">
              {activeContent.type === 'video' ? (
                 <video 
                    key={activeContent.url}
                    src={activeContent.url} 
                    controls 
                    autoPlay
                    loop
                    muted
                    playsInline 
                    className="h-full w-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
              ) : (
                <img 
                    src={activeContent.url} 
                    alt="Live Content" 
                    className="h-full w-full object-cover"
                />
              )}
            </div>
          ) : (
             <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No content is live.</p>
             </div>
          )}
        </div>
      </div>

       <Separator className="my-8" />

       <div className="flex-1 flex flex-col">
        
        {schedules.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {schedules.map((schedule) => (
               <Card key={schedule.id} className="flex flex-col">
                <CardHeader className="p-4">
                   <div className="flex justify-between items-start">
                     <div>
                       <CardTitle className="text-base mb-1">{schedule.title}</CardTitle>
                       <Badge variant={schedule.type === 'video' ? 'secondary' : 'outline'}>
                        {schedule.type}
                       </Badge>
                     </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCopyUrl(schedule.url)}>
                           <Copy className="h-4 w-4" />
                           <span className="sr-only">Copy URL</span>
                        </Button>
                        <PreviewDialog schedule={schedule} />
                      </div>
                   </div>
                </CardHeader>
                <Separator />
                <CardContent className="flex-grow p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                          <span className="font-semibold">Start:</span> {format(schedule.startTime, "PPp")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-semibold">End:</span> {format(schedule.endTime, "PPp")}
                      </p>
                    </div>
                    <div className="flex justify-end items-center">
                       <CountdownTimer startTime={schedule.startTime} endTime={schedule.endTime} />
                    </div>
                  </div>
                </CardContent>
            </Card>
            ))}
           </div>
        ) : (
             <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No content scheduled yet.</p>
             </div>
        )}
       </div>
    </div>
  );
}
