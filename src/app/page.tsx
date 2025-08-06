'use client';

import { useState, useEffect } from 'react';
import { getActiveVideoUrl } from '@/services/video-service';

function convertGoogleDriveLinkToDirect(url: string): string {
    if (!url) return '';
    const fileIdMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    
    const ucIdMatch = url.match(/uc\?.*id=([a-zA-Z0-9_-]+)/);
    if (ucIdMatch && ucIdMatch[1]) {
        return url;
    }
    
    return url;
}


export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    async function fetchVideoUrl() {
      const url = await getActiveVideoUrl();
      const directUrl = convertGoogleDriveLinkToDirect(url || 'https://drive.google.com/uc?export=download&id=1IpWBVYgzV5s4oydxy0ZiCn4zMsM8kYZc');
      setVideoUrl(directUrl);
    }
    fetchVideoUrl();
    
    const interval = setInterval(fetchVideoUrl, 60000); // Check for new active video every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <main className="flex-1 flex items-stretch">
        <div className="flex-1">
          {videoUrl ? (
            <video 
              key={videoUrl} 
              src={videoUrl}
              autoPlay 
              loop 
              muted
              playsInline
              className="h-full w-full object-cover"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
             <div className="flex h-full w-full items-center justify-center bg-black text-white">
              <p>No scheduled stream is active at the moment.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
