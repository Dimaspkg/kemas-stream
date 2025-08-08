import {
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPlaylistForPlayback, type PlaylistItem } from './playlist-service';


// The concept of a single fallback content is deprecated.
// The playlist now serves as the dynamic fallback.
// These interfaces and functions are kept for potential future use or can be removed.

export interface FallbackContent {
    type: 'video' | 'image' | 'playlist';
    url?: string; // For single video/image
    playlistId?: string; // For a playlist
}

// This function now primarily serves to get the playlist for playback
// as the active content when no other stream is scheduled.
export async function getActiveContent(): Promise<PlaylistItem[]> {
    return await getPlaylistForPlayback();
}
