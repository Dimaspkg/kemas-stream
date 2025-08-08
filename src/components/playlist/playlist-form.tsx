
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
  title: z.string().min(1, { message: 'Please enter a title.'}),
  url: z.string().url({ message: 'Please enter a valid video URL.' }),
});

export function PlaylistForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      url: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await addVideoToPlaylist(values.url, values.title);
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
               <FormControl>
                  <Input placeholder="e.g., Company Profile Video" {...field} disabled={isSubmitting} />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
               <FormControl>
                  <Input placeholder="https://example.com/video.mp4" {...field} disabled={isSubmitting} />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          <ListPlus className="mr-2 h-4 w-4" />
          Add to Playlist
        </Button>
      </form>
    </Form>
  );
}
