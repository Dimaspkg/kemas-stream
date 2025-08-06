
'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Schedule } from '@/services/video-service';
import { Eye } from 'lucide-react';

function convertGoogleDriveLinkToDirect(url: string): string {
    if (!url) return '';
    const fileIdMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|uc\?id=))([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return url;
}

export function PreviewDialog({ schedule }: { schedule: Schedule }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const previewUrl = schedule.type === 'video' ? convertGoogleDriveLinkToDirect(schedule.url) : schedule.url;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          Lihat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pratinjau: {schedule.title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center">
            {schedule.type === 'video' ? (
                <video 
                key={previewUrl}
                src={previewUrl} 
                controls 
                autoPlay
                loop
                muted
                playsInline 
                className="h-full w-full object-cover"
                >
                Your browser does not support the video tag.
                </video>
            ) : (
                <img 
                src={previewUrl} 
                alt={schedule.title}
                className="h-full w-full object-cover"
                />
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
