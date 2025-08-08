
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { setFallbackContent, type FallbackContent } from '@/services/fallback-service';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FallbackFormProps {
  initialFallbackContent: FallbackContent | null;
}

const formSchema = z.object({
  type: z.enum(['video', 'image'], { required_error: 'Please select a content type.'}),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});


export function FallbackForm({ initialFallbackContent }: FallbackFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: initialFallbackContent?.type || 'video',
            url: initialFallbackContent?.url || '',
        },
    });

    React.useEffect(() => {
        form.reset({
             type: initialFallbackContent?.type || 'video',
             url: initialFallbackContent?.url || '',
        })
    }, [initialFallbackContent, form])
    
    const selectedType = form.watch('type');

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        const content: Omit<FallbackContent, 'id'> = {
            type: values.type,
            url: values.url
        };

        try {
          await setFallbackContent(content);
          toast({
            title: 'Fallback Updated',
            description: `The fallback ${values.type} has been changed.`,
          });
        } catch (error: any) {
           toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to update fallback content.',
          });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
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
                        disabled={isSubmitting}
                        >
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                            <RadioGroupItem value="video" id="video" />
                            </FormControl>
                            <FormLabel htmlFor="video" className="font-normal cursor-pointer">Video</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                            <RadioGroupItem value="image" id="image" />
                            </FormControl>
                            <FormLabel htmlFor="image" className="font-normal cursor-pointer">Image</FormLabel>
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
                    <FormControl>
                        <Input placeholder={selectedType === 'video' ? "https://example.com/video.mp4" : "https://example.com/image.png"} {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin"/> : <Save />}
                Save Fallback
            </Button>
            </form>
        </Form>
    )
}
