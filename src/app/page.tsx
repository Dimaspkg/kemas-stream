
'use client';

import { useState, useEffect } from 'react';
import { getFallbackContent, type FallbackContent } from '@/services/video-service';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [activeContent, setActiveContent] = useState<FallbackContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fallbackDoc = doc(db, 'settings', 'fallbackContent');
    
    const unsubscribe = onSnapshot(fallbackDoc, (snapshot) => {
        if (snapshot.exists()) {
            setActiveContent(snapshot.data() as FallbackContent);
        }
        setIsLoading(false);
    });

    // Initial fetch to avoid waiting for the first snapshot
    getFallbackContent().then(content => {
        setActiveContent(content);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    if (isLoading) {
       return (
        <div className="flex h-full w-full items-center justify-center bg-black">
          <Skeleton className="h-full w-full" />
        </div>
      );
    }
    
    if (!activeContent || !activeContent.url) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-black text-white">
          <p>No content is configured to play.</p>
        </div>
      );
    }

    if (activeContent.type === 'video') {
      return (
        <video 
          key={activeContent.url} 
          src={activeContent.url}
          autoPlay 
          loop
          controls
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (activeContent.type === 'image') {
      return (
         <img 
            src={activeContent.url} 
            alt="Live Stream Content" 
            className="h-full w-full object-cover"
        />
      );
    }

    return null;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative">
        {renderContent()}
    </div>
  );
}
