import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Learning from './components/LearningDashboard';
import EnrollmentPage from './components/EnrollmentPage';
import Progress from './components/Progress';
import HomePage from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import NotFound from './components/Notfound';
import AdminDashboard from './components/Admin/AdminDashboard';
import VerifyEmail from './components/VerifyEmail';
import PrivateRoute from './middleware/Private';
import AdminRoute from './middleware/Admin';

const HomeRedirect = () => {
  const isAuthenticated = localStorage.getItem("userRole") && localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");
  
  if (isAuthenticated) {
    if (userRole === "admin" && localStorage.getItem("viewMode") !== "student") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/learning" replace />;
  }
  
  return <HomePage />;
};

function App() {
  const userNavbarLinks = [
    { label: "Enroll", path: "/enroll" },
    { label: "My Courses", path: "/learning" },
    { label: "Progress", path: "/progress" },
  ];

  const adminNavbarLinks = [
    { label: "Manage Courses", path: "/admin/dashboard" },
  ];

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const currentViewMode = localStorage.getItem("viewMode");
    
    if (userRole === "admin" && !currentViewMode) {
      localStorage.setItem("viewMode", "admin");
    }
  }, []);

  const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAdmin = location.pathname.startsWith('/admin');
    const validUserRoutes = ["/learning", "/enroll", "/progress"];
    const validAdminRoutes = ["/admin/dashboard"];
    const userRole = localStorage.getItem("userRole");
    const viewMode = localStorage.getItem("viewMode");
    
    const showNavbar = validUserRoutes.includes(location.pathname) || 
                      validAdminRoutes.includes(location.pathname);

    useEffect(() => {
      if (viewMode === 'student' && location.pathname.startsWith('/admin')) {
        navigate('/learning');
      }
    }, [location.pathname, viewMode, navigate]);

    if (!showNavbar) {
      return children;
    }

    return (
      <>
        <Navbar 
          title={isAdmin ? "Instructor Dashboard" : "Learning Dashboard"}
          links={isAdmin ? adminNavbarLinks : userNavbarLinks}
          adminView={userRole === "admin"}
        />
        {children}
      </>
    );
  };

  const AdminWrapper = ({ children }) => {
    const viewMode = localStorage.getItem("viewMode");
    const navigate = useNavigate();

    useEffect(() => {
      if (viewMode === 'student') {
        navigate('/learning');
      }
    }, [viewMode, navigate]);

    return children;
  };

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* User routes */}
          <Route
            path="/learning"
            element={
              <PrivateRoute>
                <Learning />
              </PrivateRoute>
            }
          />
          <Route
            path="/enroll"
            element={
              <PrivateRoute>
                <EnrollmentPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <PrivateRoute>
                <Progress />
              </PrivateRoute>
            }
          />

          {/* Admin routes - wrapped with additional protection */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminWrapper>
                  <AdminDashboard />
                </AdminWrapper>
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;