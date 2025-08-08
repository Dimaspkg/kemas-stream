
'use client';

import { useState, useEffect } from 'react';
import { getActiveContent, onContentChange, type ActiveContent } from '@/services/video-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [activeContent, setActiveContent] = useState<ActiveContent | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const handleContentUpdate = (content: ActiveContent | null) => {
      // If content type changes, reset playlist index
      if (activeContent?.type !== content?.type && content?.type === 'playlist') {
        setCurrentVideoIndex(0);
      }
      setActiveContent(content);
      if (isLoading) {
        setIsLoading(false);
      }
    };
    
    // onContentChange will provide the initial state.
    const unsubscribe = onContentChange(handleContentUpdate);

    // Initial fetch to prevent blank screen on first load
     getActiveContent().then(content => {
      handleContentUpdate(content);
    });

    return () => unsubscribe();
  }, [isLoading, activeContent?.type]);

  const handleVideoEnded = () => {
    if (activeContent?.type === 'playlist' && activeContent.items.length > 0) {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % activeContent.items.length);
    }
  };

  const renderContent = () => {
    if (isLoading) {
       return (
        <div className="flex h-full w-full items-center justify-center bg-black">
          <Skeleton className="h-full w-full" />
        </div>
      );
    }
    
    // Priority 1: Scheduled Video
    if (activeContent?.type === 'video') {
       return (
          <video 
            key={activeContent.id} 
            src={activeContent.url}
            autoPlay 
            controls
            muted
            playsInline
            className="h-full w-full object-contain bg-black"
          >
            Your browser does not support the video tag.
          </video>
        );
    }

    // Priority 2: Playlist
    if (activeContent?.type === 'playlist' && activeContent.items.length > 0) {
      const activeVideo = activeContent.items[currentVideoIndex];
       if (!activeVideo) {
         // This can happen if the playlist is modified while playing
         setCurrentVideoIndex(0);
         return null;
       }
      return (
        <video 
          key={activeVideo.id} 
          src={activeVideo.url}
          autoPlay 
          controls
          muted
          playsInline
          onEnded={handleVideoEnded}
          className="h-full w-full object-contain bg-black"
        >
          Your browser does not support the video tag.
        </video>
      );
    }
    
    // Priority 3: Fallback Image
    if (activeContent?.type === 'image') {
        return (
            <div className="h-full w-full bg-black flex items-center justify-center">
                 <img 
                    src={activeContent.url} 
                    alt="Fallback Content"
                    className="h-full w-full object-contain"
                 />
            </div>
        )
    }

    // Final Fallback: Nothing is configured
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <p className="text-center p-4">The stream is currently offline. No content is scheduled, the playlist is empty, and no fallback has been set.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative">
        {renderContent()}
    </div>
  );
}
