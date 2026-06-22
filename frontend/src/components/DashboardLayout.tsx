import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/lib/auth-context';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 sm:h-14 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-3 sm:px-4 sticky top-0 z-30">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />
              <div className="h-5 w-px bg-border hidden sm:block" />
              <span className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:inline">
                Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center">3</span>
              </Button>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-6 overflow-auto">
            {children}
          </main>
          <footer className="border-t border-border bg-card/80 px-3 sm:px-6 py-3 text-[11px] text-muted-foreground flex items-center justify-between shrink-0">
            <span>&copy; {new Date().getFullYear()} KEMI. All rights reserved.</span>
            <span className="hidden sm:inline">Kenya Education Management Institute</span>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
