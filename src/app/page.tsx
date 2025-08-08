
'use client';

import { useState, useEffect, useRef } from 'react';
import { getActiveContent, onContentChange, type ActiveContent } from '@/services/video-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [activeContent, setActiveContent] = useState<ActiveContent | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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

    const unsubscribe = onContentChange(handleContentUpdate);

    getActiveContent().then(content => {
      handleContentUpdate(content);
    });

    return () => unsubscribe();
  }, [isLoading, activeContent?.type]);
  
  const activeVideo = activeContent?.type === 'playlist' ? activeContent.items[currentVideoIndex] : null;
  
  const handleVideoEnded = () => {
    if (activeContent?.type === 'playlist' && activeContent.items.length > 0) {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % activeContent.items.length);
    }
  };

  const handleVideoPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    // Start muted and with volume 0
    video.muted = false;
    video.volume = 0;

    let currentVolume = 0;
    const fadeAudio = setInterval(() => {
      currentVolume += 0.05;
      if (currentVolume >= 1) {
        video.volume = 1;
        clearInterval(fadeAudio);
      } else {
        video.volume = currentVolume;
      }
    }, 100); // increase volume every 100ms for a 2s fade-in
  };

  const renderContent = () => {
    if (isLoading) {
       return (
        <div className="flex h-full w-full items-center justify-center bg-black">
          <Skeleton className="h-full w-full" />
        </div>
      );
    }

    if (activeContent?.type === 'scheduled-video') {
       return (
          <video
            ref={videoRef}
            key={activeContent.id}
            src={activeContent.url}
            autoPlay
            controls
            playsInline
            onPlay={handleVideoPlay}
            className="h-full w-full object-contain bg-black"
          >
            Your browser does not support the video tag.
          </video>
        );
    }

    if (activeContent?.type === 'playlist' && activeContent.items.length > 0) {
       if (!activeVideo) {
         setCurrentVideoIndex(0);
         return null;
       }
      return (
        <video
          ref={videoRef}
          key={activeVideo.id}
          src={activeVideo.url}
          autoPlay
          controls
          playsInline
          onPlay={handleVideoPlay}
          onEnded={handleVideoEnded}
          className="h-full w-full object-contain bg-black"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (activeContent?.type === 'fallback') {
        if (activeContent.fallbackType === 'image') {
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
        if (activeContent.fallbackType === 'video') {
             return (
                <video
                    ref={videoRef}
                    key={activeContent.id}
                    src={activeContent.url}
                    autoPlay
                    controls
                    loop
                    playsInline
                    onPlay={handleVideoPlay}
                    className="h-full w-full object-contain bg-black"
                >
                    Your browser does not support the video tag.
                </video>
            );
        }
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
