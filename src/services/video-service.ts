import {
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const videoConfigDoc = doc(db, 'settings', 'fallbackContent');

export interface FallbackContent {
    type: 'video' | 'image';
    url: string;
}

export function onContentChange(callback: (content: FallbackContent | null) => void): () => void {
    const unsubscribe = onSnapshot(videoConfigDoc, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data() as FallbackContent);
        } else {
            callback({ type: 'video', url: '' });
        }
    });
    return unsubscribe;
}

export async function setFallbackContent(content: FallbackContent): Promise<void> {
  await setDoc(videoConfigDoc, content);
}

export async function getFallbackContent(): Promise<FallbackContent | null> {
  try {
    const docSnap = await getDoc(videoConfigDoc);
    if (docSnap.exists()) {
      return docSnap.data() as FallbackContent;
    }
    // Default fallback if nothing is set
    return { 
        type: 'video', 
        url: '' 
    };
  } catch (error) {
    console.error("Error fetching fallback content:", error);
    return null;
  }
}

export async function getActiveContent(): Promise<FallbackContent | null> {
    return await getFallbackContent();
}
