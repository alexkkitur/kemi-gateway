import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
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
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Redirect root based on role */}
      <Route path="/" element={
        <Navigate to={
          user?.role === 'student' ? '/student/dashboard' :
          user?.role === 'admission_officer' ? '/admin/dashboard' :
          user?.role === 'dd_aec' ? '/approver/dashboard' :
          '/authorizer/dashboard'
        } replace />
      } />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/courses" element={<CoursesPage />} />
      <Route path="/student/applications" element={<ApplicationsPage />} />
      <Route path="/student/documents" element={<DocumentsPage />} />
      <Route path="/student/notifications" element={<NotificationsPage />} />
      <Route path="/student/profile" element={<ProfilePage />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/applicants" element={<AdminDashboard />} />
      <Route path="/admin/payments" element={<PlaceholderPage title="Payment Verification" />} />
      <Route path="/admin/enrollment" element={<PlaceholderPage title="Enrollment List" />} />
      <Route path="/admin/settings" element={<PlaceholderPage title="Settings" />} />

      {/* Approver Routes */}
      <Route path="/approver/dashboard" element={<ApproverDashboard />} />
      <Route path="/approver/queue" element={<ApproverDashboard />} />
      <Route path="/approver/approved" element={<PlaceholderPage title="Approved Lists" />} />
      <Route path="/approver/settings" element={<PlaceholderPage title="Settings" />} />

      {/* Authorizer Routes */}
      <Route path="/authorizer/dashboard" element={<AuthorizerDashboard />} />
      <Route path="/authorizer/queue" element={<AuthorizerDashboard />} />
      <Route path="/authorizer/batches" element={<PlaceholderPage title="Training Batches" />} />
      <Route path="/authorizer/settings" element={<PlaceholderPage title="Settings" />} />

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
