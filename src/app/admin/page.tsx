
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScheduleForm } from '@/components/schedule/schedule-form';
import { ScheduleList } from '@/components/schedule/schedule-list';
import { getActiveContent, onContentChange, type PlaylistItem } from '@/services/video-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
    const [activeContent, setActiveContent] = useState<PlaylistItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleContentUpdate = (content: PlaylistItem | null) => {
            setActiveContent(content);
            if (isLoading) {
                setIsLoading(false);
            }
        };
        
        // Initial fetch
        getActiveContent().then(handleContentUpdate);

        // Listen for real-time updates
        const unsubscribe = onContentChange(handleContentUpdate);

        return () => unsubscribe();
    }, [isLoading]);


    const renderPreview = () => {
        if (isLoading) {
            return <Skeleton className="aspect-video w-full" />;
        }

        if (activeContent?.url) {
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

        return (
            <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No active content or playlist is empty.</p>
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
                                Add a video to be played at a specific time. Scheduled videos will override the default playlist.
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
                    Manage your scheduled broadcast.
                </p>
                <ScheduleList />
            </div>
        </div>
    );
}
