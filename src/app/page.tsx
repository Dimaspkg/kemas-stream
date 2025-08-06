'use client';

import { useState, useEffect } from 'react';
import { getVideoUrl } from '@/services/video-service';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    async function fetchVideoUrl() {
      const url = await getVideoUrl();
      setVideoUrl(url || 'https://drive.google.com/uc?export=download&id=1IpWBVYgzV5s4oydxy0ZiCn4zMsM8kYZc');
    }
    fetchVideoUrl();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <main className="flex-1 flex items-stretch">
        <div className="flex-1">
          {videoUrl && (
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
          )}
        </div>
      </main>
    </div>
  );
}
