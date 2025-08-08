
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScheduleForm } from '@/components/schedule/schedule-form';
import { ScheduleList } from '@/components/schedule/schedule-list';
import { getActiveContent, onContentChange, type ActiveContent } from '@/services/video-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
    const [activeContent, setActiveContent] = useState<ActiveContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleContentUpdate = (content: ActiveContent | null) => {
            setActiveContent(content);
            if (isLoading) {
                setIsLoading(false);
            }
        };

        const fetchInitialData = async () => {
            const initialContent = await getActiveContent();
            handleContentUpdate(initialContent);
        };
        
        fetchInitialData();

        const unsubscribe = onContentChange(handleContentUpdate);

        return () => unsubscribe();
    }, [isLoading]);


    const renderPreview = () => {
        if (isLoading) {
            return <Skeleton className="aspect-video w-full" />;
        }
        
        if (activeContent?.type === 'scheduled-video') {
             return (
                <video
                    key={activeContent.id}
                    src={activeContent.url}
                    controls
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="aspect-video w-full rounded-lg bg-black object-contain"
                >
                    Your browser does not support the video tag.
                </video>
            );
        }

        if (activeContent?.type === 'playlist' && activeContent.items.length > 0) {
            // Preview the first video of the playlist
            const firstVideo = activeContent.items[0];
             return (
                <video
                    key={firstVideo.id}
                    src={firstVideo.url}
                    controls
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="aspect-video w-full rounded-lg bg-black object-contain"
                >
                    Your browser does not support the video tag.
                </video>
            );
        }
        
        if (activeContent?.type === 'fallback') {
            if (activeContent.type === 'video') {
                 return (
                    <video
                        key={activeContent.id}
                        src={activeContent.url}
                        controls
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="aspect-video w-full rounded-lg bg-black object-contain"
                    >
                        Your browser does not support the video tag.
                    </video>
                );
            }
             if (activeContent.type === 'image') {
                 return (
                     <img 
                        src={activeContent.url} 
                        alt="Current Fallback Content"
                        className="aspect-video w-full rounded-lg bg-muted object-contain"
                     />
                 )
            }
        }

        return (
            <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground text-center p-4">
                    Nothing is scheduled and the playlist is empty. The final fallback content will be shown.
                </p>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Live Preview</CardTitle>
                            <CardDescription>
                                This is what your audience is currently seeing on the main page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderPreview()}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Schedule a Video</CardTitle>
                            <CardDescription>
                                Add a video to be played at a specific time. Scheduled videos will override the playlist and fallback content.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ScheduleForm />
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <Separator />

            <div>
                 <h2 className="text-2xl font-bold tracking-tight mb-2">Upcoming & Live</h2>
                 <p className="text-muted-foreground mb-4">
                    Manage your scheduled broadcast. The live item is what is currently playing.
                </p>
                <ScheduleList />
            </div>
        </div>
    );
}
