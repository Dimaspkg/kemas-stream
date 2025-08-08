
'use client';

import { useState, useEffect } from 'react';
import { getActiveContent, onContentChange, type PlaylistItem } from '@/services/video-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [activeContent, setActiveContent] = useState<PlaylistItem | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const handleContentUpdate = (content: PlaylistItem | PlaylistItem[] | null) => {
      if (Array.isArray(content)) {
        // It's a playlist
        setActiveContent(null); // No single active content
        setPlaylist(content);
        setCurrentVideoIndex(0); // Reset index when playlist changes
      } else {
        // It's a single scheduled item or null
        setActiveContent(content);
        setPlaylist([]); // Not in playlist mode
      }
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
  }, [isLoading]);

  const handleVideoEnded = () => {
    if (playlist.length > 0) {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % playlist.length);
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
    
    // If there is a scheduled item, play it.
    if (activeContent) {
       return (
          <video 
            key={activeContent.id} 
            src={activeContent.url}
            autoPlay 
            controls
            muted
            playsInline
            className="h-full w-full object-cover"
          >
            Your browser does not support the video tag.
          </video>
        );
    }

    // Otherwise, play from the playlist
    if (playlist.length > 0 && playlist[currentVideoIndex]) {
      const activeVideo = playlist[currentVideoIndex];
      return (
        <video 
          key={activeVideo.id} 
          src={activeVideo.url}
          autoPlay 
          controls
          muted
          playsInline
          onEnded={handleVideoEnded}
          className="h-full w-full object-cover"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    // Fallback if no schedule and no playlist
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <p>The stream is currently offline. Nothing is scheduled and the playlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative">
        {renderContent()}
    </div>
  );
}
