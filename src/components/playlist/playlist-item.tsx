
'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Trash2, Calendar, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteVideoFromPlaylist, type PlaylistItem } from '@/services/playlist-service';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { PlaylistPreviewDialog } from './playlist-preview-dialog';
import { format } from 'date-fns';

interface PlaylistItemCardProps {
    item: PlaylistItem;
}

export function PlaylistItemCard({ item }: PlaylistItemCardProps) {
    const { toast } = useToast();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteVideoFromPlaylist(item.id);
            toast({
                title: 'Video Deleted',
                description: 'The video has been removed from your playlist.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete video.',
            });
        }
    };

    return (
        <>
            <Card className="flex flex-col">
                <CardContent className="p-4 flex-grow">
                    <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center">
                         <PlayCircle className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <LinkIcon className="h-4 w-4" />
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                                {item.url}
                            </a>
                        </div>
                        {item.createdAt && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Added on {format(item.createdAt.toDate(), "MMM d, yyyy")}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="p-2 border-t">
                    <div className="flex w-full gap-2">
                        <Button variant="ghost" className="w-full" onClick={() => setIsPreviewOpen(true)}>
                            <PlayCircle className="mr-2 h-4 w-4" /> Preview
                        </Button>

                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the video from your playlist.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardFooter>
            </Card>
            <PlaylistPreviewDialog
                isOpen={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                url={item.url}
            />
        </>
    );
}
