import {
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPlaylistForPlayback, type PlaylistItem } from './playlist-service';
import { findActiveSchedule, onScheduleChange } from './schedule-service';


// This function now determines the active content by first checking
// for a scheduled item, and then falling back to the playlist.
export async function getActiveContent(): Promise<PlaylistItem | PlaylistItem[] | null> {
    const activeSchedule = await findActiveSchedule();
    if (activeSchedule) {
        return { id: activeSchedule.id, url: activeSchedule.url, createdAt: activeSchedule.startTime };
    }
    
    // If no schedule, return the whole playlist
    return await getPlaylistForPlayback();
}


export function onContentChange(callback: (content: PlaylistItem | PlaylistItem[] | null) => void): () => void {
    // This function will be called whenever the schedule collection changes.
    const unsubscribe = onScheduleChange(async () => {
        const content = await getActiveContent();
        callback(content);
    });

    // We also immediately trigger a check when first subscribing
    getActiveContent().then(callback);

    return unsubscribe;
}
