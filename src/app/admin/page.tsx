
'use client';
import { useState, useEffect } from 'react';
import { FallbackForm } from '@/components/video-player';
import { getFallbackContent, type FallbackContent, onContentChange } from '@/services/video-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
    const [fallbackContent, setFallbackContent] = useState<FallbackContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const unsubscribe = onContentChange((content) => {
            setFallbackContent(content);
            setIsLoading(false);
        });

        // Initial fetch to make sure we have the content.
        getActiveContentFromService();

        return () => unsubscribe();
    }, []);

    const getActiveContentFromService = async () => {
         const content = await getFallbackContent();
         setFallbackContent(content);
         setIsLoading(false);
    }

    const handleFallbackUpdate = (content: FallbackContent) => {
        setFallbackContent(content);
    };

    return (
        <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4">Fallback Content</h2>
                    <FallbackForm setFallbackContentOnPage={handleFallbackUpdate} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4">Live Preview</h2>
                     {isLoading ? (
                        <div className="flex items-center justify-center aspect-video border-2 border-dashed rounded-lg bg-muted">
                            <Skeleton className="h-full w-full" />
                        </div>
                    ) : fallbackContent?.url ? (
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
                                    alt="Live Content"
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center aspect-video border-2 border-dashed rounded-lg bg-muted">
                            <p className="text-muted-foreground">No content is live.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
