
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FallbackForm } from '@/components/fallback/fallback-form';
import { getFallbackContent, type FallbackContent, onFallbackChange } from '@/services/fallback-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
    const [fallbackContent, setFallbackContent] = useState<FallbackContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const handleFallbackUpdate = (content: FallbackContent | null) => {
            setFallbackContent(content);
            if (isLoading) {
                setIsLoading(false);
            }
        }
        getFallbackContent().then(handleFallbackUpdate);
        
        const unsubscribe = onFallbackChange(handleFallbackUpdate);

        return () => unsubscribe();
    }, [isLoading])

    return (
        <div className="space-y-6">
             <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your application settings here.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Final Fallback Content</CardTitle>
                    <CardDescription>
                        This content plays only when nothing is scheduled AND the playlist is empty.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-1/3" />
                        </div>
                    ) : (
                       <FallbackForm initialFallbackContent={fallbackContent} />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
