'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void> | void;
}

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(500),
});

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setIsSending(true);
    await onSendMessage(values.message);
    form.reset();
    setIsSending(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder={user ? "Type a message..." : "Log in to chat"}
                  autoComplete="off"
                  disabled={!user || isSending}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={!user || isSending} size="icon" aria-label="Send message">
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
        </Button>
      </form>
    </Form>
  );
}
