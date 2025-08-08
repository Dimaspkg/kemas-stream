import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const playlistCollection = collection(db, 'playlist');

export interface PlaylistItem {
  id: string;
  url: string;
  createdAt: Timestamp;
}

export async function addVideoToPlaylist(url: string): Promise<void> {
    if (!url) {
        throw new Error("URL cannot be empty.");
    }
  await addDoc(playlistCollection, {
    url,
    createdAt: serverTimestamp(),
  });
}

export async function getPlaylist(): Promise<PlaylistItem[]> {
  const q = query(playlistCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlaylistItem));
}


export async function getPlaylistForPlayback(): Promise<PlaylistItem[]> {
  // For playback, we might want them in the order they were added (oldest first)
  const q = query(playlistCollection, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlaylistItem));
}


export function onPlaylistUpdate(callback: (playlist: PlaylistItem[]) => void): () => void {
    const q = query(playlistCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const playlist = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlaylistItem));
        callback(playlist);
    });
    return unsubscribe;
}

export async function deleteVideoFromPlaylist(id: string): Promise<void> {
  await deleteDoc(doc(db, 'playlist', id));
}
