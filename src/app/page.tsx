
'use client';

import { useState, useEffect } from 'react';
import { getActiveContent, type FallbackContent } from '@/services/video-service';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';


function convertGoogleDriveLinkToDirect(url: string): string {
    if (!url) return '';
    const fileIdMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|uc\?id=))([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return url;
}

function onActiveContentChange(callback: (content: FallbackContent | null) => void): () => void {
  const scheduleUnsubscribe = onSnapshot(collection(db, 'schedule'), async () => {
    const content = await getActiveContent();
    callback(content);
  });

  const fallbackUnsubscribe = onSnapshot(doc(db, 'settings', 'fallbackContent'), async () => {
    const content = await getActiveContent();
    callback(content);
  });

  return () => {
    scheduleUnsubscribe();
    fallbackUnsubscribe();
  };
}


export default function Home() {
  const [activeContent, setActiveContent] = useState<FallbackContent | null>(null);
  const { user, loading } = useAuth();

  const handleContentUpdate = (content: FallbackContent | null) => {
      if (content && content.type === 'video' && content.url.includes('drive.google')) {
          content.url = convertGoogleDriveLinkToDirect(content.url);
      }
      setActiveContent(content);
  };

  const checkForScheduledContent = async () => {
    const content = await getActiveContent();
    handleContentUpdate(content);
  };

  useEffect(() => {
    // Initial load
    checkForScheduledContent();

    // Set up real-time listener for any changes in schedule or fallback
    const unsubscribe = onActiveContentChange(handleContentUpdate);
    
    // Also poll every 5 seconds to catch time-based changes
    const interval = setInterval(checkForScheduledContent, 5000);


    // Clean up listener and timer on component unmount
    return () => {
        unsubscribe();
        clearInterval(interval);
    };
  }, []);

  const renderContent = () => {
    if (!activeContent || !activeContent.url) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-black text-white">
          <p>No scheduled stream is active at the moment.</p>
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
        {user && !loading && (
             <div className="absolute top-4 right-4 z-10">
                <Button asChild variant="secondary">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Admin
                    </Link>
                </Button>
            </div>
        )}
        {renderContent()}
    </div>
  );
}
