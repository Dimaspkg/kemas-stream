
'use client';

import { useState, useEffect, useRef } from 'react';
import { getActiveContent, onContentChange, type ActiveContent } from '@/services/video-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

export default function Home() {
  const [activeContent, setActiveContent] = useState<ActiveContent | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleContentUpdate = (content: ActiveContent | null) => {
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

  const handleInteraction = async () => {
    setIsOverlayVisible(false);
    if (videoRef.current) {
      try {
        videoRef.current.muted = false;
        await videoRef.current.play();
      } catch (error) {
        console.error("Autoplay with sound failed:", error);
        // If it fails, we at least ensure it's unmuted for manual play.
        videoRef.current.muted = false;
      }
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

    const shouldAutoplayWithSound = !isOverlayVisible;

    if (activeContent?.type === 'scheduled-video') {
       return (
          <video
            ref={videoRef}
            key={activeContent.id}
            src={activeContent.url}
            autoPlay={shouldAutoplayWithSound}
            muted={isOverlayVisible}
            controls
            playsInline
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
          autoPlay={shouldAutoplayWithSound}
          muted={isOverlayVisible}
          controls
          playsInline
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
                    autoPlay={shouldAutoplayWithSound}
                    muted={isOverlayVisible}
                    controls
                    loop
                    playsInline
                    className="h-full w-full object-contain bg-black"
                >
                    Your browser does not support the video tag.
                </video>
            );
        }
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <p className="text-center p-4">The stream is currently offline. No content is scheduled, the playlist is empty, and no fallback has been set.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative">
      {renderContent()}
      {isOverlayVisible && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center text-white space-y-4 p-4">
              <h1 className="text-4xl font-bold tracking-tight">Welcome to the Stream</h1>
              <p className="text-lg text-muted-foreground">Click the button below to start the stream with sound.</p>
              <Button size="lg" onClick={handleInteraction}>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Stream
              </Button>
          </div>
        </div>
      )}
    </div>
  );
}
