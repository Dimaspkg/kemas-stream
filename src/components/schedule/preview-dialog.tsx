
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  url: string;
}

export function PreviewDialog({
  isOpen,
  onOpenChange,
  url,
}: PreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Video Preview</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center">
            <video
                key={url}
                src={url}
                controls
                autoPlay
                loop
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
