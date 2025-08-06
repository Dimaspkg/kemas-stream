import type { ChatMessage } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export function ChatArea({ messages, onSendMessage }: ChatAreaProps) {
  return (
    <Card className="flex h-full max-h-[calc(100vh-10rem)] flex-col">
      <CardHeader>
        <CardTitle>Live Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-0 px-4">
        <ChatMessages messages={messages} />
        <div className="pb-4">
          <ChatInput onSendMessage={onSendMessage} />
        </div>
      </CardContent>
    </Card>
  );
}
