'use client';
import { useState } from 'react';
import { VideoUrlForm } from '@/components/video-player';

export default function AdminPage() {
    const [videoUrl, setVideoUrl] = useState('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <VideoUrlForm setVideoUrl={setVideoUrl} />
        <div className="aspect-video w-full max-w-3xl mx-auto overflow-hidden rounded-lg bg-black mt-4">
            <video key={videoUrl} controls autoPlay muted className="h-full w-full">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
            </video>
        </div>
    </div>
  );
}
