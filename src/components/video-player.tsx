'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PlayCircle, Image as ImageIcon } from 'lucide-react';
import { setFallbackContent, FallbackContent } from '@/services/video-service';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FallbackFormProps {
  setFallbackContentOnPage: (content: FallbackContent) => void;
}

const formSchema = z.object({
  type: z.enum(['video', 'image']),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

function convertGoogleDriveLinkToDirect(url: string): string {
    if (!url) return '';
    const fileIdMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|uc\?id=))([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return url;
}


export function FallbackForm({ setFallbackContentOnPage }: FallbackFormProps) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: 'video',
            url: '',
        },
    });
    
    const selectedType = form.watch('type');

    async function onSubmit(values: z.infer<typeof formSchema>) {
        let finalUrl = values.url;
        if (values.type === 'video') {
            finalUrl = convertGoogleDriveLinkToDirect(values.url);
        }
        
        const content: FallbackContent = {
            type: values.type,
            url: finalUrl
        };

        try {
          await setFallbackContent(content);
          setFallbackContentOnPage(content);
          form.reset({ url: '', type: values.type });
          toast({
            title: 'Fallback Updated',
            description: `The fallback ${values.type} has been changed.`,
          });
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to update fallback content.',
          });
        }
    }

    return (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Update Fallback Content</CardTitle>
            <CardDescription>
                Set the default video or image that plays when nothing is scheduled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Content Type</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                            >
                            <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                <RadioGroupItem value="video" id="video" />
                                </FormControl>
                                <FormLabel htmlFor="video" className="font-normal">Video</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                <RadioGroupItem value="image" id="image" />
                                </FormControl>
                                <FormLabel htmlFor="image" className="font-normal">Image</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{selectedType === 'video' ? 'Video URL' : 'Image URL'}</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder={selectedType === 'video' ? "https://example.com/video.mp4" : "https://example.com/image.png"} {...field} />
                        </FormControl>
                        <Button type="submit" variant="secondary">
                           {selectedType === 'video' ? <PlayCircle className="mr-2 h-4 w-4" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                           Set Fallback
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
    )
}
