'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const videoConfigDoc = doc(db, 'settings', 'video');

export async function setVideoUrl(url: string): Promise<void> {
  await setDoc(videoConfigDoc, { url });
}

export async function getVideoUrl(): Promise<string | null> {
  const docSnap = await getDoc(videoConfigDoc);
  if (docSnap.exists()) {
    return docSnap.data().url;
  }
  return null;
}
