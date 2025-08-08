
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PlaylistPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  url: string;
  title?: string;
}

export function PlaylistPreviewDialog({
  isOpen,
  onOpenChange,
  url,
  title
}: PlaylistPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title || 'Video Preview'}</DialogTitle>
           <DialogDescription className="truncate">
            {url}
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center">
            <video
                key={url}
                src={url}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
            >
                Your browser does not support the video tag.
            </video>
        </div>
      </DialogContent>
    </Dialog>
  );
}
