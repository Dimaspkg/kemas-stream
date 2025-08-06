
'use client';
import { useState, useEffect } from 'react';
import { FallbackForm } from '@/components/video-player';
import { getFallbackContent, type FallbackContent, getScheduledVideos, type Schedule } from '@/services/video-service';
import { PreviewDialog } from '@/components/schedule/preview-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function AdminPage() {
    const [fallbackContent, setFallbackContent] = useState<FallbackContent | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);

    useEffect(() => {
      async function fetchContent() {
        const content = await getFallbackContent();
        setFallbackContent(content);
        const scheduledData = await getScheduledVideos();
        setSchedules(scheduledData);
      }
      fetchContent();
    }, []);

  return (
    <div className="flex-1 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <FallbackForm setFallbackContentOnPage={setFallbackContent} />
        </div>
        <div>
          {fallbackContent?.url && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center">
              {fallbackContent.type === 'video' ? (
                 <video 
                    key={fallbackContent.url}
                    src={fallbackContent.url} 
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
                    src={fallbackContent.url} 
                    alt="Fallback Content" 
                    className="h-full w-full object-cover"
                />
              )}
            </div>
          )}
        </div>
      </div>
       <div className="mt-12">
        <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Upcoming Scheduled Content</h2>
            <p className="text-muted-foreground">
                Here is a list of all your scheduled content.
            </p>
        </div>
        {schedules.length > 0 ? (
          <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent>
                {schedules.map((schedule) => (
                  <CarouselItem key={schedule.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                       <Card className="h-full flex flex-col">
                        <CardHeader>
                           <div className="flex justify-between items-start">
                             <div>
                               <CardTitle className="text-lg mb-1">{schedule.title}</CardTitle>
                               <Badge variant={schedule.type === 'video' ? 'secondary' : 'outline'}>
                                {schedule.type}
                               </Badge>
                             </div>
                             <PreviewDialog schedule={schedule} />
                           </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">Start:</span> {format(schedule.startTime, "PPpp")}
                            </p>
                             <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">End:</span> {format(schedule.endTime, "PPpp")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2 max-w-full truncate">
                                <span className="font-semibold">URL:</span> {schedule.url}
                            </p>
                        </CardContent>
                    </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
        ) : (
             <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No content scheduled yet.</p>
             </div>
        )}
       </div>
    </div>
  );
}
