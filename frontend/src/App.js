import Navbar from "./components/Navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Learning from "./components/LearningDashboard";
import Events from "./components/Events";
import Progress from "./components/Progress";
import HomePage from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import NotFound from "./components/Notfound";
import PrivateRoute from "./middleware/Private";
import AdminRoute from "./middleware/Admin"; 
import AdminDashboard from "./components/AdminDashboard";
import VerifyEmail from "./components/VerifyEmail";  // Import the new component

const HomeRedirect = () => {
  const isAuthenticated = localStorage.getItem("userRole") && localStorage.getItem("userName");
  
  if (isAuthenticated) {
    return <Navigate to="/learning" replace />;
  }
  
  return <HomePage />;
};

function App() {
  const navbarLinks = [
    { label: "Learning", path: "/learning" },
    { label: "Events", path: "/events" },
    { label: "Progress", path: "/progress" },
  ];

  const Layout = ({ children }) => {
    const location = useLocation();
    const validNavbarRoutes = ["/learning", "/events", "/progress"];
    const showNavbar = validNavbarRoutes.includes(location.pathname);

    return (
      <>
        {showNavbar && <Navbar title="User Dashboard" links={navbarLinks} />}
        {children}
      </>
    );
  };

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Change the home route to use HomeRedirect */}
          <Route path="/" element={<HomeRedirect />} />
          
          {/* Rest of your routes remain the same */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          <Route
            path="/learning"
            element={
              <PrivateRoute>
                <Learning />
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute>
                <Events />
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

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
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