'use client';

import { useState } from 'react';
import type { User } from 'firebase/auth';
import { Header } from '@/components/header';
import { VideoPlayer } from '@/components/video-player';
import { ChatArea } from '@/components/chat/chat-area';
import { moderateChatMessage } from '@/ai/flows/moderate-chat-messages';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

export interface ChatMessage {
  id: string;
  user: {
    uid: string;
    name: string;
    avatar?: string;
  };
  text: string;
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSendMessage = async (message: string, author: User | null) => {
    if (!author) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to send a message.',
      });
      return;
    }

    try {
      const moderationResult = await moderateChatMessage({ message, userId: author.uid });

      if (moderationResult.isSafe) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          user: {
            uid: author.uid,
            name: author.displayName || author.email || 'Anonymous',
            avatar: author.photoURL || undefined,
          },
          text: message,
        };
        setChatMessages((prevMessages) => [...prevMessages, newMessage]);
      } else {
        toast({
          variant: 'destructive',
          title: 'Message Blocked',
          description: `Your message was flagged for: ${moderationResult.reason}`,
        });
      }
    } catch (error) {
      console.error('Error moderating message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not send message. Please try again later.',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-8">
          <div className="md:col-span-2 mb-8 md:mb-0">
            <VideoPlayer videoUrl={videoUrl} setVideoUrl={setVideoUrl} />
          </div>
          <div className="md:col-span-1">
            <ChatArea messages={chatMessages} onSendMessage={(message) => handleSendMessage(message, user)} />
          </div>
        </div>
      </main>
    </div>
  );
}
