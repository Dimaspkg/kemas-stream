'use client';

import { useState } from 'react';
import { VideoPlayer } from '@/components/video-player';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 container mx-auto p-4 md:py-8">
        <div className="grid grid-cols-1">
          <div className="col-span-1">
             <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <video key={videoUrl} controls autoPlay muted className="h-full w-full">
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
