
'use client';

import { useState, useEffect } from 'react';
import { getPlaylistForPlayback, type PlaylistItem } from '@/services/playlist-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaylist() {
      try {
        const items = await getPlaylistForPlayback();
        setPlaylist(items);
      } catch (error) {
        console.error("Failed to fetch playlist:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlaylist();
  }, []);

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };
  
  const renderContent = () => {
    if (isLoading) {
       return (
        <div className="flex h-full w-full items-center justify-center bg-black">
          <Skeleton className="h-full w-full" />
        </div>
      );
    }
    
    if (playlist.length === 0) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-black text-white">
          <p>The playlist is empty. Add videos in the admin panel.</p>
        </div>
      );
    }

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

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative">
        {renderContent()}
    </div>
  );
}
