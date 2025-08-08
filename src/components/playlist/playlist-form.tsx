
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addVideoToPlaylist } from '@/services/playlist-service';
import { ListPlus } from 'lucide-react';
import React from 'react';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid video URL.' }),
});

export function PlaylistForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await addVideoToPlaylist(values.url);
      toast({
        title: 'Video Added',
        description: 'The video has been successfully added to your playlist.',
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add video to playlist.',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Video URL</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="https://example.com/video.mp4" {...field} disabled={isSubmitting} />
                </FormControl>
                <Button type="submit" disabled={isSubmitting}>
                  <ListPlus className="mr-2 h-4 w-4" />
                  Add to Playlist
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
