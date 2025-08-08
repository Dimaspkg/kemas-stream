
'use client';

import { useState, useEffect } from 'react';
import { PlaylistForm } from '@/components/playlist/playlist-form';
import { PlaylistItemCard } from '@/components/playlist/playlist-item';
import { getPlaylist, onPlaylistUpdate, type PlaylistItem } from '@/services/playlist-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function PlaylistPage() {
    const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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


    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Manage Playlist</h2>
                <p className="text-muted-foreground">
                    Add, remove, and preview videos in your playlist.
                </p>
            </div>
            <Separator />
            <PlaylistForm />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)
                ) : (
                    playlist.map(item => (
                        <PlaylistItemCard key={item.id} item={item} />
                    ))
                )}
                 {!isLoading && playlist.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-10">
                        Your playlist is empty. Add a video to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
