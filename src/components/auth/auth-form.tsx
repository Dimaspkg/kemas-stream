'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: 'login' | 'signup';
}

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' }),
});

export function AuthForm({ className, mode, ...props }: AuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        toast({
          title: 'Account created',
          description: "You've been successfully signed up.",
        });
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({
          title: 'Logged in',
          description: "You've been successfully logged in.",
        });
      }
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const title = mode === 'login' ? 'Welcome back' : 'Create an account';
  const description =
    mode === 'login'
      ? 'Enter your email and password to sign in.'
      : 'Enter your email and password to get started.';
  const buttonText = mode === 'login' ? 'Sign In' : 'Sign Up';
  const linkText =
    mode === 'login'
      ? "Don't have an account?"
      : 'Already have an account?';
  const linkHref = mode === 'login' ? '/signup' : '/login';
  const linkActionText = mode === 'login' ? 'Sign up' : 'Sign in';

  return (
    <Card className={cn('w-full max-w-sm', className)} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isLoading} className="w-full">
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {buttonText}
            </Button>
          </form>
        </Form>
        <p className="mt-4 px-0 text-center text-sm text-muted-foreground">
          {linkText}{' '}
          <Link
            href={linkHref}
            className="underline underline-offset-4 hover:text-primary"
          >
            {linkActionText}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
