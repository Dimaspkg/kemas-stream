
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

const videoConfigDoc = doc(db, 'settings', 'fallbackContent');
const scheduleCollection = collection(db, 'schedule');

export interface Schedule {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'image';
  startTime: Date;
  endTime: Date;
}

export interface ScheduleData {
  title: string;
  url: string;
  type: 'video' | 'image';
  startTime: Timestamp;
  endTime: Timestamp;
}

export interface FallbackContent {
    type: 'video' | 'image';
    url: string;
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
        url: 'https://drive.google.com/uc?export=download&id=1IpWBVYgzV5s4oydxy0ZiCn4zMsM8kYZc' 
    };
  } catch (error) {
    console.error("Error fetching fallback content:", error);
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
    const snapshot = await getDocs(query(scheduleCollection));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        url: data.url,
        type: data.type || 'video', // Default to video if type is not set
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
    if (video.type) dataToUpdate.type = video.type;
    if (video.startTime) dataToUpdate.startTime = Timestamp.fromDate(video.startTime);
    if (video.endTime) dataToUpdate.endTime = Timestamp.fromDate(video.endTime);
    
    await updateDoc(docRef, dataToUpdate);
}

export async function deleteScheduledVideo(id: string): Promise<void> {
    const docRef = doc(db, 'schedule', id);
    await deleteDoc(docRef);
}


export async function getActiveContent(): Promise<FallbackContent | null> {
    try {
        const now = new Date(); // Use server's current time
        const q = query(
            collection(db, 'schedule'),
            where('startTime', '<=', now),
            where('endTime', '>=', now)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            // Sort by start time to get the most recent one if there's an overlap
            const activeDoc = snapshot.docs.sort((a, b) => 
                (b.data().startTime as Timestamp).toMillis() - (a.data().startTime as Timestamp).toMillis()
            )[0];
            const data = activeDoc.data();
            return {
                type: data.type || 'video',
                url: data.url
            };
        }
        
        return await getFallbackContent();
    } catch (error) {
        console.error("Error fetching active content:", error);
        return await getFallbackContent();
    }
}

export async function isScheduleConflict(
    startTime: Date,
    endTime: Date,
    excludeId?: string
): Promise<boolean> {
    const allSchedules = await getScheduledVideos();
    return allSchedules.some(schedule => {
        if (schedule.id === excludeId) {
            return false; // Don't check against itself
        }
        // Check for overlap: (StartA < EndB) and (StartB < EndA)
        return startTime < schedule.endTime && endTime > schedule.startTime;
    });
}
