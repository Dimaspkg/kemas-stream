'use client';

import { useState, useEffect } from 'react';
import { getVideoUrl } from '@/services/video-service';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    async function fetchVideoUrl() {
      const url = await getVideoUrl();
      setVideoUrl(url || 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    }
    fetchVideoUrl();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <main className="flex-1 flex items-stretch">
        <div className="flex-1">
          {videoUrl && (
            <video key={videoUrl} autoPlay loop muted controls playsInline className="h-full w-full object-cover">
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </main>
    </div>
  );
}
