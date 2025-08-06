
'use client';

import { useState, useEffect } from 'react';
import { getActiveContent, type FallbackContent } from '@/services/video-service';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';


function onContentChange(callback: (content: FallbackContent | null) => void): () => void {
  const handleUpdate = async () => {
    const content = await getActiveContent();
    callback(content);
  };

  const scheduleUnsubscribe = onSnapshot(collection(db, 'schedule'), handleUpdate);
  const fallbackUnsubscribe = onSnapshot(doc(db, 'settings', 'fallbackContent'), handleUpdate);

  return () => {
    scheduleUnsubscribe();
    fallbackUnsubscribe();
  };
}


export default function Home() {
  const [activeContent, setActiveContent] = useState<FallbackContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleContentUpdate = (content: FallbackContent | null) => {
      setActiveContent(content);
      setIsLoading(false);
  };
  
  useEffect(() => {
    // Initial load
    getActiveContent().then(handleContentUpdate);

    // Set up real-time listener for any changes in schedule or fallback
    const unsubscribe = onContentChange(handleContentUpdate);

    // Clean up listener on component unmount
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
          <p>No content is scheduled to play at the moment.</p>
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
