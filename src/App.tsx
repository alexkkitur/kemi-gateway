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
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApproverDashboard from "./pages/admin/ApproverDashboard";
import AuthorizerDashboard from "./pages/admin/AuthorizerDashboard";
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
          user?.role === 'admission_officer' ? '/admin/dashboard' :
          user?.role === 'dd_aec' ? '/approver/dashboard' :
          '/authorizer/dashboard'
        } replace />
      } />

      <Route path="/student/dashboard" element={<RouteGuard allowedRoles={['student']}><StudentDashboard /></RouteGuard>} />
      <Route path="/student/courses" element={<RouteGuard allowedRoles={['student']}><CoursesPage /></RouteGuard>} />
      <Route path="/student/applications" element={<RouteGuard allowedRoles={['student']}><ApplicationsPage /></RouteGuard>} />
      <Route path="/student/documents" element={<RouteGuard allowedRoles={['student']}><DocumentsPage /></RouteGuard>} />
      <Route path="/student/notifications" element={<RouteGuard allowedRoles={['student']}><NotificationsPage /></RouteGuard>} />
      <Route path="/student/profile" element={<RouteGuard allowedRoles={['student']}><ProfilePage /></RouteGuard>} />

      <Route path="/admin/dashboard" element={<RouteGuard allowedRoles={['admission_officer']}><AdminDashboard /></RouteGuard>} />
      <Route path="/admin/applicants" element={<RouteGuard allowedRoles={['admission_officer']}><AdminDashboard /></RouteGuard>} />
      <Route path="/admin/payments" element={<RouteGuard allowedRoles={['admission_officer']}><PlaceholderPage title="Payment Verification" /></RouteGuard>} />
      <Route path="/admin/enrollment" element={<RouteGuard allowedRoles={['admission_officer']}><PlaceholderPage title="Enrollment List" /></RouteGuard>} />
      <Route path="/admin/settings" element={<RouteGuard allowedRoles={['admission_officer']}><PlaceholderPage title="Settings" /></RouteGuard>} />

      <Route path="/approver/dashboard" element={<RouteGuard allowedRoles={['dd_aec']}><ApproverDashboard /></RouteGuard>} />
      <Route path="/approver/queue" element={<RouteGuard allowedRoles={['dd_aec']}><ApproverDashboard /></RouteGuard>} />
      <Route path="/approver/approved" element={<RouteGuard allowedRoles={['dd_aec']}><PlaceholderPage title="Approved Lists" /></RouteGuard>} />
      <Route path="/approver/settings" element={<RouteGuard allowedRoles={['dd_aec']}><PlaceholderPage title="Settings" /></RouteGuard>} />

      <Route path="/authorizer/dashboard" element={<RouteGuard allowedRoles={['dd_cdt']}><AuthorizerDashboard /></RouteGuard>} />
      <Route path="/authorizer/queue" element={<RouteGuard allowedRoles={['dd_cdt']}><AuthorizerDashboard /></RouteGuard>} />
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
