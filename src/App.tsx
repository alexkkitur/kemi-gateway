import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { RouteGuard } from "@/components/RouteGuard";
import { Loader2 } from "lucide-react";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import CoursesPage from "./pages/student/CoursesPage";
import ApplicationsPage from "./pages/student/ApplicationsPage";
import DocumentsPage from "./pages/student/DocumentsPage";
import NotificationsPage from "./pages/student/NotificationsPage";
import ProfilePage from "./pages/student/ProfilePage";
import StudentCertificatesPage from "./pages/student/StudentCertificatesPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApproverDashboard from "./pages/admin/ApproverDashboard";
import AuthorizerDashboard from "./pages/admin/AuthorizerDashboard";
import GraduationPage from "./pages/admin/GraduationPage";
import CertificatesPage from "./pages/admin/CertificatesPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import AdminOverridesPage from "./pages/admin/AdminOverridesPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading KEMI Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <Navigate to={
          user?.role === 'student' ? '/student/dashboard' :
          user?.role === 'admission_officer' || user?.role === 'super_admin' ? '/admin/dashboard' :
          user?.role === 'dd_aec' ? '/approver/dashboard' :
          '/authorizer/dashboard'
        } replace />
      } />

      {/* Student routes */}
      <Route path="/student/dashboard" element={<RouteGuard allowedRoles={['student']}><StudentDashboard /></RouteGuard>} />
      <Route path="/student/courses" element={<RouteGuard allowedRoles={['student']}><CoursesPage /></RouteGuard>} />
      <Route path="/student/applications" element={<RouteGuard allowedRoles={['student']}><ApplicationsPage /></RouteGuard>} />
      <Route path="/student/documents" element={<RouteGuard allowedRoles={['student']}><DocumentsPage /></RouteGuard>} />
      <Route path="/student/certificates" element={<RouteGuard allowedRoles={['student']}><StudentCertificatesPage /></RouteGuard>} />
      <Route path="/student/notifications" element={<RouteGuard allowedRoles={['student']}><NotificationsPage /></RouteGuard>} />
      <Route path="/student/profile" element={<RouteGuard allowedRoles={['student']}><ProfilePage /></RouteGuard>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<RouteGuard allowedRoles={['admission_officer', 'super_admin']}><AdminDashboard /></RouteGuard>} />
      <Route path="/admin/applicants" element={<RouteGuard allowedRoles={['admission_officer', 'super_admin']}><AdminDashboard /></RouteGuard>} />
      <Route path="/admin/payments" element={<RouteGuard allowedRoles={['admission_officer', 'super_admin']}><AdminDashboard /></RouteGuard>} />
      <Route path="/admin/graduation" element={<RouteGuard allowedRoles={['admission_officer', 'dd_cdt', 'super_admin']}><GraduationPage /></RouteGuard>} />
      <Route path="/admin/certificates" element={<RouteGuard allowedRoles={['admission_officer', 'dd_cdt', 'super_admin']}><CertificatesPage /></RouteGuard>} />
      <Route path="/admin/audit-logs" element={<RouteGuard allowedRoles={['admission_officer', 'dd_aec', 'dd_cdt', 'super_admin']}><AuditLogsPage /></RouteGuard>} />
      <Route path="/admin/overrides" element={<RouteGuard allowedRoles={['super_admin']}><AdminOverridesPage /></RouteGuard>} />
      <Route path="/admin/settings" element={<RouteGuard allowedRoles={['admission_officer', 'super_admin']}><PlaceholderPage title="Settings" /></RouteGuard>} />

      {/* Approver routes */}
      <Route path="/approver/dashboard" element={<RouteGuard allowedRoles={['dd_aec']}><ApproverDashboard /></RouteGuard>} />
      <Route path="/approver/queue" element={<RouteGuard allowedRoles={['dd_aec']}><ApproverDashboard /></RouteGuard>} />
      <Route path="/approver/approved" element={<RouteGuard allowedRoles={['dd_aec']}><PlaceholderPage title="Approved Lists" /></RouteGuard>} />
      <Route path="/approver/settings" element={<RouteGuard allowedRoles={['dd_aec']}><PlaceholderPage title="Settings" /></RouteGuard>} />

      {/* Authorizer routes */}
      <Route path="/authorizer/dashboard" element={<RouteGuard allowedRoles={['dd_cdt']}><AuthorizerDashboard /></RouteGuard>} />
      <Route path="/authorizer/queue" element={<RouteGuard allowedRoles={['dd_cdt']}><AuthorizerDashboard /></RouteGuard>} />
      <Route path="/authorizer/graduation" element={<RouteGuard allowedRoles={['dd_cdt']}><GraduationPage /></RouteGuard>} />
      <Route path="/authorizer/batches" element={<RouteGuard allowedRoles={['dd_cdt']}><PlaceholderPage title="Training Batches" /></RouteGuard>} />
      <Route path="/authorizer/settings" element={<RouteGuard allowedRoles={['dd_cdt']}><PlaceholderPage title="Settings" /></RouteGuard>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
