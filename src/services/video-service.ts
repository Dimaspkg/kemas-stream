'use server';

import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const videoConfigDoc = doc(db, 'settings', 'video');
const scheduleCollection = collection(db, 'schedule');

export interface Schedule {
  id: string;
  title: string;
  url: string;
  startTime: Date;
  endTime: Date;
}

export interface ScheduleData {
  title: string;
  url: string;
  startTime: Timestamp;
  endTime: Timestamp;
}


// --- Single Video URL Functions (Legacy, might be phased out) ---

export async function setVideoUrl(url: string): Promise<void> {
  await setDoc(videoConfigDoc, { url });
}

export async function getSingleVideoUrl(): Promise<string | null> {
  try {
    const docSnap = await getDoc(videoConfigDoc);
    if (docSnap.exists()) {
      return docSnap.data().url;
    }
    return null;
  } catch (error) {
    console.error("Error fetching single video URL:", error);
    return null;
  }
}

// --- Video Scheduling Functions ---

export async function addScheduledVideo(video: Omit<Schedule, 'id'>): Promise<string> {
    const docRef = await addDoc(scheduleCollection, {
        ...video,
        startTime: Timestamp.fromDate(video.startTime),
        endTime: Timestamp.fromDate(video.endTime),
    });
    return docRef.id;
}

export async function getScheduledVideos(): Promise<Schedule[]> {
  try {
    const snapshot = await getDocs(scheduleCollection);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        url: data.url,
        startTime: (data.startTime as Timestamp).toDate(),
        endTime: (data.endTime as Timestamp).toDate(),
      };
    }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  } catch (error) {
    console.error("Error fetching scheduled videos:", error);
    return [];
  }
}

export async function updateScheduledVideo(id: string, video: Partial<Omit<Schedule, 'id'>>): Promise<void> {
    const docRef = doc(db, 'schedule', id);
    const dataToUpdate: Partial<ScheduleData> = {};
    if (video.title) dataToUpdate.title = video.title;
    if (video.url) dataToUpdate.url = video.url;
    if (video.startTime) dataToUpdate.startTime = Timestamp.fromDate(video.startTime);
    if (video.endTime) dataToUpdate.endTime = Timestamp.fromDate(video.endTime);
    
    await updateDoc(docRef, dataToUpdate);
}

export async function deleteScheduledVideo(id: string): Promise<void> {
    const docRef = doc(db, 'schedule', id);
    await deleteDoc(docRef);
}


export async function getActiveVideoUrl(): Promise<string | null> {
    try {
        const now = Timestamp.now();
        const q = query(
            scheduleCollection,
            where('startTime', '<=', now),
            where('endTime', '>=', now)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            // There should ideally be only one active video.
            // If there are overlaps, just take the first one.
            const activeDoc = snapshot.docs[0];
            return activeDoc.data().url;
        }
        
        // Fallback to the single video URL if no scheduled video is active
        return await getSingleVideoUrl();
    } catch (error) {
        console.error("Error fetching active video URL:", error);
        // Fallback to single video URL on error
        return await getSingleVideoUrl();
    }
}
