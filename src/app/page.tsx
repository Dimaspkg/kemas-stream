'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { VideoPlayer } from '@/components/video-player';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:py-8">
        <div className="grid grid-cols-1">
          <div className="col-span-1">
            <VideoPlayer videoUrl={videoUrl} setVideoUrl={setVideoUrl} />
          </div>
        </div>
      </main>
    </div>
  );
}
