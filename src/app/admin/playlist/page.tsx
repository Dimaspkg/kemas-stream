
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlaylistItemCard } from '@/components/playlist/playlist-item';
import { getPlaylist, onPlaylistUpdate, type PlaylistItem, addVideoToPlaylist } from '@/services/playlist-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ListPlus, Loader2 } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Please enter a title.'}),
  url: z.string().url({ message: 'Please enter a valid video URL.' }),
});

export default function PlaylistPage() {
    const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            url: '',
        },
    });

    useEffect(() => {
        // Initial fetch
        getPlaylist().then(initialPlaylist => {
            setPlaylist(initialPlaylist);
            setIsLoading(false);
        });

        // Listen for real-time updates
        const unsubscribe = onPlaylistUpdate(updatedPlaylist => {
            setPlaylist(updatedPlaylist);
            if (isLoading) setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isLoading]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
          await addVideoToPlaylist(values.url, values.title);
          toast({
            title: 'Video Added',
            description: 'The video has been successfully added to your playlist.',
          });
          form.reset();
          setIsAddDialogOpen(false); // Close dialog on success
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Manage Playlist</h2>
                    <p className="text-muted-foreground">
                        Add, remove, and preview videos in your playlist.
                    </p>
                </div>
                 <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                           <ListPlus className="mr-2 h-4 w-4" />
                           Add Video
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                         <DialogHeader>
                            <DialogTitle>Add a New Video</DialogTitle>
                            <DialogDescription>
                                Enter the title and URL of the video you want to add to the playlist.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
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
                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <ListPlus className="mr-2 h-4 w-4" />
                                    )}
                                    Add to Playlist
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)
                ) : (
                    playlist.map(item => (
                        <PlaylistItemCard key={item.id} item={item} />
                    ))
                )}
                 {!isLoading && playlist.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-10 border rounded-lg">
                        Your playlist is empty. Add a video to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
