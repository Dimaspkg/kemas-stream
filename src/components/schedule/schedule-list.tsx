
'use client';

import { useState, useEffect } from 'react';
import { getSchedules, onScheduleChange, type ScheduleItem } from '@/services/schedule-service';
import { ScheduleItemCard } from './schedule-item';
import { Skeleton } from '@/components/ui/skeleton';

export function ScheduleList() {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAndSetSchedules = async () => {
            const items = await getSchedules();
            setSchedules(items);
            if(isLoading) setIsLoading(false);
        };
        
        fetchAndSetSchedules();

        const unsubscribe = onScheduleChange(() => {
            fetchAndSetSchedules();
        });

        return () => unsubscribe();
    }, [isLoading]);

    return (
        <div className="space-y-4">
            {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
            ) : schedules.length > 0 ? (
                schedules.map(item => (
                    <ScheduleItemCard key={item.id} item={item} />
                ))
            ) : (
                <div className="col-span-full text-center text-muted-foreground py-10 border rounded-lg">
                    No upcoming videos scheduled.
                </div>
            )}
        </div>
    );
}
