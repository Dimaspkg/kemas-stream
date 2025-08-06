import { Video } from 'lucide-react';
import { UserNav } from './auth/user-nav';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-auto flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Kemas Indah Maju Live</span>
        </Link>
        <UserNav />
      </div>
    </header>
  );
}
