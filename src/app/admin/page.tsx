'use client';
import { useState, useEffect } from 'react';
import { VideoUrlForm } from '@/components/video-player';
import { getVideoUrl } from '@/services/video-service';

export default function AdminPage() {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoUrlFromDb, setVideoUrlFromDb] = useState('');

    useEffect(() => {
      async function fetchVideoUrl() {
        const url = await getVideoUrl();
        const initialUrl = url || 'https://drive.google.com/uc?export=download&id=1IpWBVYgzV5s4oydxy0ZiCn4zMsM8kYZc';
        setVideoUrl(initialUrl);
        setVideoUrlFromDb(initialUrl);
      }
      fetchVideoUrl();
    }, [videoUrlFromDb]);

  return (
    <div className="flex-1 p-8 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <VideoUrlForm setVideoUrl={setVideoUrlFromDb} />
        </div>
        <div>
          {videoUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <video key={videoUrl} controls autoPlay muted playsInline className="h-full w-full">
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
