
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();

    return (
        <div className="flex-1 flex flex-col items-center justify-center">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CardTitle>Welcome to the Dashboard</CardTitle>
                    <CardDescription>
                        The fallback stream is now managed entirely by the playlist. 
                        All videos in your playlist will play sequentially on the main page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/admin/playlist')}>
                        Manage Playlist
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
