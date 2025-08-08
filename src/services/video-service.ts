
import {
  onSnapshot,
  collection
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPlaylistForPlayback, type PlaylistItem } from './playlist-service';
import { findActiveSchedule, type ScheduleItem } from './schedule-service';
import { getFallbackContent, type FallbackContent } from './fallback-service';


export type ActiveContent =
  | ({ type: 'scheduled-video' } & ScheduleItem)
  | ({ type: 'playlist'; items: PlaylistItem[] })
  | ({ type: 'fallback'; fallbackType: 'video' | 'image' } & Omit<FallbackContent, 'type'>);


// This function now determines the active content with a clear priority:
// 1. Scheduled Item
// 2. Playlist
// 3. Final Fallback Content
export async function getActiveContent(): Promise<ActiveContent | null> {
    // 1. Check for a live scheduled item
    const activeSchedule = await findActiveSchedule();
    if (activeSchedule) {
        return {
          type: 'scheduled-video',
          ...activeSchedule
        };
    }

    // 2. If no schedule, check for a playlist with items
    const playlist = await getPlaylistForPlayback();
    if (playlist.length > 0) {
        return { type: 'playlist', items: playlist };
    }

    // 3. If no schedule and empty playlist, check for fallback content
    const fallback = await getFallbackContent();
    if (fallback) {
        const { type, ...rest } = fallback;
        return { 
          type: 'fallback', 
          fallbackType: type,
          ...rest 
        };
    }

    // Nothing is configured
    return null;
}


// This function now listens to changes in THREE collections: schedule, playlist, and fallback
export function onContentChange(callback: (content: ActiveContent | null) => void): () => void {

    const performCheck = async () => {
        const content = await getActiveContent();
        callback(content);
    };

    // Listen to all relevant collections
    const unsubSchedule = onSnapshot(collection(db, 'schedule'), performCheck);
    const unsubPlaylist = onSnapshot(collection(db, 'playlist'), performCheck);
    const unsubFallback = onSnapshot(collection(db, 'fallback'), performCheck);

    // We also immediately trigger a check when first subscribing
    performCheck();

    // Return a function that unsubscribes from all listeners
    return () => {
        unsubSchedule();
        unsubPlaylist();
        unsubFallback();
    };
}
