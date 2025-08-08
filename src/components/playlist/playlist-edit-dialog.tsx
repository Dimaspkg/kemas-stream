
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updatePlaylistItem, type PlaylistItem } from '@/services/playlist-service';
import { Loader2, Pencil } from 'lucide-react';

interface PlaylistEditDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: PlaylistItem;
}

const formSchema = z.object({
  title: z.string().min(1, { message: 'Please enter a title.' }),
  category: z.string().min(1, { message: 'Please enter a category.' }),
  url: z.string().url({ message: 'Please enter a valid video URL.' }),
});

export function PlaylistEditDialog({ isOpen, onOpenChange, item }: PlaylistEditDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item.title,
      category: item.category,
      url: item.url,
    },
  });

  useEffect(() => {
    // Reset form when item changes
    if (item) {
      form.reset({
        title: item.title,
        category: item.category || '',
        url: item.url,
      });
    }
  }, [item, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await updatePlaylistItem(item.id, values);
      toast({
        title: 'Video Updated',
        description: 'The video has been successfully updated.',
      });
      onOpenChange(false); // Close dialog on success
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update video.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
          <DialogDescription>
            Make changes to your video here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tutorial" {...field} disabled={isSubmitting} />
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
             <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Pencil className="mr-2 h-4 w-4" />
                )}
                Save Changes
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
