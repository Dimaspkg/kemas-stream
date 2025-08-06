'use client';
import { useState, useEffect } from 'react';
import { FallbackForm } from '@/components/video-player';
import { getFallbackContent, type FallbackContent } from '@/services/video-service';

export default function AdminPage() {
    const [fallbackContent, setFallbackContent] = useState<FallbackContent | null>(null);

    useEffect(() => {
      async function fetchContent() {
        const content = await getFallbackContent();
        setFallbackContent(content);
      }
      fetchContent();
    }, []);

  return (
    <div className="flex-1 p-8 pt-6">
       <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Fallback Content Stream</h2>
        <p className="text-muted-foreground">
          This video or image will be shown when no other stream is scheduled.
        </p>
      </div>
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
                    playsInline 
                    className="h-full w-full"
                  >
                    Your browser does not support the video tag.
                  </video>
              ) : (
                <img 
                    src={fallbackContent.url} 
                    alt="Fallback Content" 
                    className="max-h-full max-w-full object-contain"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
