'use client';

import { useState, useEffect } from 'react';
import { getActiveContent, FallbackContent } from '@/services/video-service';

function convertGoogleDriveLinkToDirect(url: string): string {
    if (!url) return '';
    const fileIdMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|uc\?id=))([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return url;
}


export default function Home() {
  const [activeContent, setActiveContent] = useState<FallbackContent | null>(null);

  useEffect(() => {
    async function fetchActiveContent() {
      const content = await getActiveContent();
      if (content && content.type === 'video' && content.url.includes('drive.google')) {
          content.url = convertGoogleDriveLinkToDirect(content.url);
      }
      setActiveContent(content);
    }
    
    fetchActiveContent();
    
    const interval = setInterval(fetchActiveContent, 60000); // Check for new active content every minute

    return () => clearInterval(interval);
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
          muted
          controls
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
    <div className="h-screen w-screen overflow-hidden bg-black">
        {renderContent()}
    </div>
  );
}
