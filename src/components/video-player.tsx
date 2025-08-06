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
import { setVideoUrl as saveVideoUrl } from '@/services/video-service';

interface VideoPlayerProps {
  setVideoUrl: (url: string) => void;
}

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

function convertGoogleDriveLinkToDirect(url: string): string {
  let fileId = null;
  
  // Regex for standard share links: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const standardMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (standardMatch && standardMatch[1]) {
    fileId = standardMatch[1];
  }

  // Regex for direct download links: https://drive.google.com/uc?export=download&id=FILE_ID
  const ucMatch = url.match(/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (ucMatch && ucMatch[1]) {
    fileId = ucMatch[1];
  }
  
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  // If no match, return the original URL
  return url;
}

export function VideoUrlForm({ setVideoUrl }: VideoPlayerProps) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        url: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const directUrl = convertGoogleDriveLinkToDirect(values.url);
        try {
          await saveVideoUrl(directUrl);
          setVideoUrl(directUrl); // This will now trigger the useEffect in admin page to refetch
          form.reset();
          toast({
            title: 'Stream Updated',
            description: 'The video stream has been changed.',
          });
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to update video URL.',
          });
        }
    }

    return (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Update Video URL</CardTitle>
          </CardHeader>
          <CardContent>
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
    )
}
