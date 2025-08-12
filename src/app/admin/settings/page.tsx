
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FallbackForm } from '@/components/fallback/fallback-form';
import { getFallbackContent, type FallbackContent, onFallbackChange } from '@/services/fallback-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
    const [fallbackContent, setFallbackContent] = useState<FallbackContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [streamUrl, setStreamUrl] = useState('');
    const [hasCopied, setHasCopied] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        // This ensures the code only runs on the client where `window` is available.
        setStreamUrl(window.location.origin);

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

    const handleCopy = () => {
        navigator.clipboard.writeText(streamUrl);
        setHasCopied(true);
        toast({
            title: 'Tautan Disalin',
            description: 'Tautan streaming telah disalin ke clipboard Anda.',
        });
        setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
    };

    return (
        <div className="space-y-6">
             <div>
                <h2 className="text-2xl font-bold tracking-tight">Pengaturan</h2>
                <p className="text-muted-foreground">
                    Kelola pengaturan aplikasi Anda di sini.
                </p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Bagikan Tautan Streaming</CardTitle>
                    <CardDescription>
                       Gunakan tautan ini untuk membagikan siaran langsung Anda kepada audiens.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="flex w-full max-w-md items-center space-x-2">
                        <Input 
                            value={streamUrl} 
                            readOnly 
                            aria-label="Tautan Streaming"
                        />
                        <Button type="button" size="icon" onClick={handleCopy} aria-label="Salin Tautan">
                            {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Konten Fallback Terakhir</CardTitle>
                    <CardDescription>
                        Konten ini hanya diputar ketika tidak ada yang dijadwalkan DAN playlist kosong.
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
