'use client';
import { useState, useEffect } from 'react';
import { VideoUrlForm } from '@/components/video-player';
import { getSingleVideoUrl } from '@/services/video-service';

function convertGoogleDriveLinkToDirect(url: string): string {
    if (!url) return '';
    const fileIdMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|uc\?id=))([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return url;
}

export default function AdminPage() {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoUrlFromDb, setVideoUrlFromDb] = useState('');

    useEffect(() => {
      async function fetchVideoUrl() {
        const url = await getSingleVideoUrl();
        const initialUrl = url || 'https://drive.google.com/uc?export=download&id=1IpWBVYgzV5s4oydxy0ZiCn4zMsM8kYZc';
        const directUrl = convertGoogleDriveLinkToDirect(initialUrl);
        setVideoUrl(directUrl);
        setVideoUrlFromDb(initialUrl); // Keep the original from DB for reference
      }
      fetchVideoUrl();
    }, [videoUrlFromDb]);

  return (
    <div className="flex-1 p-8 pt-6">
       <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Fallback Video Stream</h2>
        <p className="text-muted-foreground">
          This video will play when no other stream is scheduled.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <VideoUrlForm setVideoUrl={setVideoUrlFromDb} />
        </div>
        <div>
          {videoUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <video 
                key={videoUrl}
                src={videoUrl} 
                controls 
                autoPlay 
                muted
                playsInline 
                className="h-full w-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
