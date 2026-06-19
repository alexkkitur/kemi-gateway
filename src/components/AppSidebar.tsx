import {
  LayoutDashboard, BookOpen, FileText, Upload, Bell, User, Users,
  CheckSquare, ClipboardList, Shield, LogOut, Settings, BadgeCheck, Stamp,
  GraduationCap, Award, ScrollText, Wrench
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/lib/auth-context';
import kemiLogo from '@/assets/kemi-logo.png';
import type { Database } from '@/lib/types';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, string> = {
  student: 'Student',
  admission_officer: 'Admission Officer',
  dd_aec: 'DD/AEC Approver',
  dd_cdt: 'DD/CD&T Authorizer',
  super_admin: 'Super Admin',
};

const studentNav = [
  { title: 'Dashboard', url: '/student/dashboard', icon: LayoutDashboard },
  { title: 'Available Courses', url: '/student/courses', icon: BookOpen },
  { title: 'My Applications', url: '/student/applications', icon: FileText },
  { title: 'Documents', url: '/student/documents', icon: Upload },
  { title: 'Certificates', url: '/student/certificates', icon: Award },
  { title: 'Notifications', url: '/student/notifications', icon: Bell },
  { title: 'Profile', url: '/student/profile', icon: User },
];

const admissionNav = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'All Applicants', url: '/admin/applicants', icon: Users },
  { title: 'Payment Verification', url: '/admin/payments', icon: CheckSquare },
  { title: 'Graduation', url: '/admin/graduation', icon: GraduationCap },
  { title: 'Certificates', url: '/admin/certificates', icon: Award },
  { title: 'Audit Logs', url: '/admin/audit-logs', icon: ScrollText },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

const ddAecNav = [
  { title: 'Dashboard', url: '/approver/dashboard', icon: LayoutDashboard },
  { title: 'Approval Queue', url: '/approver/queue', icon: BadgeCheck },
  { title: 'Approved Lists', url: '/approver/approved', icon: ClipboardList },
  { title: 'Settings', url: '/approver/settings', icon: Settings },
];

const ddCdtNav = [
  { title: 'Dashboard', url: '/authorizer/dashboard', icon: LayoutDashboard },
  { title: 'Authorization Queue', url: '/authorizer/queue', icon: Stamp },
  { title: 'Graduation', url: '/authorizer/graduation', icon: GraduationCap },
  { title: 'Training Batches', url: '/authorizer/batches', icon: ClipboardList },
  { title: 'Settings', url: '/authorizer/settings', icon: Settings },
];

const superAdminNav = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'All Applicants', url: '/admin/applicants', icon: Users },
  { title: 'Payment Verification', url: '/admin/payments', icon: CheckSquare },
  { title: 'Graduation', url: '/admin/graduation', icon: GraduationCap },
  { title: 'Certificates', url: '/admin/certificates', icon: Award },
  { title: 'Admin Overrides', url: '/admin/overrides', icon: Wrench },
  { title: 'Audit Logs', url: '/admin/audit-logs', icon: ScrollText },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  if (!user) return null;

  const navMap: Record<AppRole, typeof studentNav> = {
    student: studentNav,
    admission_officer: admissionNav,
    dd_aec: ddAecNav,
    dd_cdt: ddCdtNav,
    super_admin: superAdminNav,
  };
  const navItems = navMap[user.role];

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <img src={kemiLogo} alt="KEMI Logo" className="h-10 object-contain" />
          </div>
        ) : (
          <div className="flex justify-center">
            <Shield className="h-6 w-6 text-sidebar-primary" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-widest font-semibold px-3">
            {!collapsed && roleLabels[user.role]}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink
                      to={item.url}
                      end={item.url.endsWith('dashboard')}
                      className="flex items-center gap-3 px-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 mb-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-muted truncate">{user.email}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="h-9 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-sm">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
