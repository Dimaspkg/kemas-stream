
'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Trash2, Calendar, Link as LinkIcon, Copy, Check, Pencil, Tag, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteVideoFromPlaylist, type PlaylistItem } from '@/services/playlist-service';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { PlaylistPreviewDialog } from './playlist-preview-dialog';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { PlaylistEditDialog } from './playlist-edit-dialog';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface PlaylistItemCardProps {
    item: PlaylistItem;
}

export function PlaylistItemCard({ item }: PlaylistItemCardProps) {
    const { toast } = useToast();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);

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
    
    const handleCopy = () => {
        navigator.clipboard.writeText(item.url);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
    }

    return (
        <>
            <Card className="flex flex-col">
                <CardContent className="p-4 flex-grow">
                    <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
                         <PlayCircle className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold leading-none tracking-tight truncate" title={item.title}>
                           {item.title || 'No Title'}
                        </h3>
                         {item.category && (
                            <div className="text-sm flex items-center gap-2 text-muted-foreground">
                                <Tag className="h-4 w-4" />
                                <Badge variant="secondary" className="capitalize">{item.category}</Badge>
                            </div>
                        )}
                        <div className="text-sm flex items-center gap-2 text-muted-foreground">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                            <LinkIcon className="h-4 w-4" />
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Open in new tab</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="truncate flex-1" title={item.url}>
                                {item.url}
                            </span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                                            {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Copy URL</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        {item.createdAt && (
                            <div className="text-sm flex items-center gap-2 text-muted-foreground">
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">More actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardFooter>
            </Card>

            <PlaylistPreviewDialog
                isOpen={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                url={item.url}
                title={item.title}
            />

             <PlaylistEditDialog
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                item={item}
            />
            
             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
        </>
    );
}
