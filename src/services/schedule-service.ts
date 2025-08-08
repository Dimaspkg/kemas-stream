
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
  where,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const scheduleCollection = collection(db, 'schedule');

export interface ScheduleItem {
  id: string;
  url: string;
  title: string;
  startTime: Timestamp;
  endTime: Timestamp;
  status: 'upcoming' | 'live' | 'finished';
  createdAt: Timestamp;
}

export async function addScheduleItem(url: string, title: string, startTime: Date, durationMinutes: number): Promise<void> {
  if (!url || !title || !startTime || !durationMinutes) {
    throw new Error("All fields are required.");
  }
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  await addDoc(scheduleCollection, {
    url,
    title,
    startTime: Timestamp.fromDate(startTime),
    endTime: Timestamp.fromDate(endTime),
    createdAt: serverTimestamp(),
  });
}

export async function getSchedules(): Promise<ScheduleItem[]> {
  const now = Timestamp.now();
  // Get schedules that haven't finished yet, ordered by start time
  const q = query(scheduleCollection, where('endTime', '>=', now), orderBy('endTime', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
     const data = doc.data();
     const item: Omit<ScheduleItem, 'status'> = { 
        id: doc.id,
        url: data.url,
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        createdAt: data.createdAt
     };

     // Determine status dynamically
     let status: ScheduleItem['status'] = 'upcoming';
     if (now >= item.startTime && now <= item.endTime) {
         status = 'live';
     } else if (now > item.endTime) {
         status = 'finished';
     }

     return { ...item, status };
  });
}

export function onScheduleChange(callback: () => void): () => void {
    const q = query(scheduleCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, () => {
        callback();
    });
    return unsubscribe;
}


export async function findActiveSchedule(): Promise<ScheduleItem | null> {
    const now = Timestamp.now();
    const q = query(
        scheduleCollection,
        where('startTime', '<=', now),
        where('endTime', '>=', now),
        orderBy('startTime', 'desc'),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data(), status: 'live' } as ScheduleItem;
}


export async function deleteScheduleItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'schedule', id));
}
