'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const protectedRoutes = ['/admin'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      if (!user && isProtectedRoute) {
        router.push('/login');
      }
      if (user && pathname === '/login') {
        router.push('/admin');
      }
    }
  }, [user, loading, pathname, router]);


  if (loading) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
         <div className="space-y-4">
           <Skeleton className="h-12 w-12 rounded-full" />
           <Skeleton className="h-4 w-[250px]" />
           <Skeleton className="h-4 w-[200px]" />
         </div>
       </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
