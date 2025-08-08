
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FallbackContent {
  id: string;
  type: 'video' | 'image';
  url: string;
}

const fallbackDocRef = doc(db, 'fallback', 'default');
const fallbackCollectionRef = collection(db, 'fallback');

export async function setFallbackContent(content: Omit<FallbackContent, 'id'>): Promise<void> {
  if (!content.url || !content.type) {
    throw new Error("URL and type are required for fallback content.");
  }
  await setDoc(fallbackDocRef, content);
}

export async function getFallbackContent(): Promise<FallbackContent | null> {
  const docSnap = await getDoc(fallbackDocRef);
  if (docSnap.exists()) {
    return { id: 'default', ...docSnap.data() } as FallbackContent;
  }
  return null;
}

export function onFallbackChange(callback: (content: FallbackContent | null) => void): () => void {
    const unsubscribe = onSnapshot(fallbackCollectionRef, async () => {
        const content = await getFallbackContent();
        callback(content);
    });
    return unsubscribe;
}
