
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";

// Layout components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import BookingRequest from "./pages/BookingRequest";
import StudentDashboard from "./pages/StudentDashboard";
import ReceptionDashboard from "./pages/ReceptionDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DocumentUpload from "./pages/DocumentUpload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: JSX.Element, 
  allowedRoles?: Array<'student' | 'reception' | 'admin'> 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role as any)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'student') return <Navigate to="/student" />;
    if (user.role === 'reception') return <Navigate to="/reception" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
    return <Navigate to="/" />;
  }
  
  return children;
};

// Layout component
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BookingProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/login" element={<Layout><Login /></Layout>} />
              
              {/* Protected Routes */}
              <Route 
                path="/booking-request" 
                element={
                  <Layout>
                    <ProtectedRoute allowedRoles={['student']}>
                      <BookingRequest />
                    </ProtectedRoute>
                  </Layout>
                } 
              />
              
              <Route 
                path="/student" 
                element={
                  <Layout>
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  </Layout>
                } 
              />
              
              <Route 
                path="/reception" 
                element={
                  <Layout>
                    <ProtectedRoute allowedRoles={['reception']}>
                      <ReceptionDashboard />
                    </ProtectedRoute>
                  </Layout>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <Layout>
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  </Layout>
                } 
              />
              
              <Route 
                path="/document-upload/:requestId" 
                element={
                  <Layout>
                    <ProtectedRoute allowedRoles={['student']}>
                      <DocumentUpload />
                    </ProtectedRoute>
                  </Layout>
                } 
              />
              
              {/* Catch-all */}
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </BookingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
