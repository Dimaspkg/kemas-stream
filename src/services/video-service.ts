'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const videoConfigDoc = doc(db, 'settings', 'video');

export async function setVideoUrl(url: string): Promise<void> {
  await setDoc(videoConfigDoc, { url });
}

export async function getVideoUrl(): Promise<string | null> {
  try {
    const docSnap = await getDoc(videoConfigDoc);
    if (docSnap.exists()) {
      return docSnap.data().url;
    }
    return null;
  } catch (error) {
    console.error("Error fetching video URL:", error);
    // Return a default or null value if offline or other error
    return null;
  }
}
