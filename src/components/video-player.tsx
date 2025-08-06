'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PlayCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  setVideoUrl: (url: string) => void;
}

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

function convertGoogleDriveLinkToDirect(url: string): string {
  const regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  // If it's not a standard sharable link, assume it's a direct link or other format and return it as is.
  return url;
}

export function VideoPlayer({ videoUrl, setVideoUrl }: VideoPlayerProps) {
  const { toast } = useToast();
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const directUrl = convertGoogleDriveLinkToDirect(values.url);
    setVideoUrl(directUrl);
    form.reset();
    toast({
      title: 'Stream Updated',
      description: 'The video stream has been changed.',
    });
  }
  
  React.useEffect(() => {
    if (videoRef.current) {
        videoRef.current.load();
    }
  }, [videoUrl]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Live Stream</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <video ref={videoRef} key={videoUrl} controls autoPlay muted className="h-full w-full">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Drive Video URL</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="https://drive.google.com/file/d/..." {...field} />
                        </FormControl>
                        <Button type="submit" variant="secondary">
                           <PlayCircle className="mr-2 h-4 w-4" /> Set Stream
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
