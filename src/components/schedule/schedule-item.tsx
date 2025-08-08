
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Trash2, Calendar, Clock, Hourglass, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteScheduleItem, type ScheduleItem } from '@/services/schedule-service';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { PreviewDialog } from './preview-dialog';


interface ScheduleItemCardProps {
    item: ScheduleItem;
}

// Helper function to format the time
const formatTime = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function ScheduleItemCard({ item }: ScheduleItemCardProps) {
    const { toast } = useToast();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [remainingTime, setRemainingTime] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (item.status === 'finished') return;

        const targetDate = item.status === 'upcoming' ? item.startTime.toDate() : item.endTime.toDate();

        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();
            const totalSeconds = Math.max(0, Math.floor(difference / 1000));
            
            setRemainingTime(formatTime(totalSeconds));

            if (totalSeconds === 0) {
                clearInterval(interval);
                 // Optionally, you can trigger a refresh here if needed
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [item.status, item.startTime, item.endTime]);


    const handleDelete = async () => {
        try {
            await deleteScheduleItem(item.id);
            toast({
                title: 'Schedule Deleted',
                description: 'The video has been removed from the schedule.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete scheduled item.',
            });
        }
    };

    const getStatusBadgeVariant = (status: ScheduleItem['status']) => {
        switch (status) {
            case 'live':
                return 'destructive';
            case 'upcoming':
                return 'secondary';
            case 'finished':
                return 'outline';
            default:
                return 'default';
        }
    };
    
    const duration = (item.endTime.toMillis() - item.startTime.toMillis()) / 60000;

    const renderCountdown = () => {
        if (!isClient || !remainingTime) return null;

        if (item.status === 'upcoming') {
            return (
                <div className="flex items-center gap-2 text-primary font-mono">
                    <Hourglass className="h-4 w-4" />
                    <span>Starts in: {remainingTime}</span>
                </div>
            )
        }
        if (item.status === 'live') {
            return (
                 <div className="flex items-center gap-2 text-destructive animate-pulse font-mono">
                    <AlertCircle className="h-4 w-4" />
                    <span>Ends in: {remainingTime}</span>
                </div>
            )
        }
        return null;
    }


    return (
        <>
            <Card className={cn("flex flex-col md:flex-row", item.status === 'live' && 'border-primary ring-2 ring-primary')}>
                <CardContent className="p-4 flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2 space-y-2 text-sm">
                       <div className="flex items-center gap-2 font-semibold">
                            <Badge variant={getStatusBadgeVariant(item.status)} className="capitalize">{item.status}</Badge>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                                {item.url}
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{format(item.startTime.toDate(), "eeee, MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{format(item.startTime.toDate(), "p")} - {format(item.endTime.toDate(), "p")}</span>
                             <span className="text-xs">({Math.round(duration)} min)</span>
                        </div>
                        {renderCountdown()}
                    </div>
                    <div className="flex md:flex-col lg:flex-row w-full gap-2 justify-self-end">
                        <Button variant="outline" className="w-full" onClick={() => setIsPreviewOpen(true)}>
                            <PlayCircle className="mr-2 h-4 w-4" /> Preview
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" className="w-full">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this scheduled item.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
            <PreviewDialog
                isOpen={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                url={item.url}
            />
        </>
    );
}
