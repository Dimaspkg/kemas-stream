import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Kemas Indah Maju Live',
  description: 'Live streaming application for PT Kemas Indah Maju',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-sans antialiased', inter.variable)}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
