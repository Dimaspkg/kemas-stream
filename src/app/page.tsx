'use client';

import { useState } from 'react';

export default function Home() {
  const [videoUrl] = useState('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <main className="flex-1 flex items-stretch">
        <div className="flex-1">
          <video key={videoUrl} controls autoPlay muted className="h-full w-full object-cover">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </main>
    </div>
  );
}
