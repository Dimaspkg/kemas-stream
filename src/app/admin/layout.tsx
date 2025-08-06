import { UserNav } from '@/components/auth/user-nav';
import { MainNav } from '@/components/main-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold tracking-tight mr-6">Admin Panel</h1>
            <MainNav className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}
