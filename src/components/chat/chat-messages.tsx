'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/app/page';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  
  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="space-y-4 pr-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-start gap-3',
              message.user.uid === user?.uid ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.user.avatar} />
              <AvatarFallback>{getInitials(message.user.name)}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                'rounded-lg px-3 py-2',
                message.user.uid === user?.uid
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p className="text-sm font-medium">{message.user.name}</p>
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
