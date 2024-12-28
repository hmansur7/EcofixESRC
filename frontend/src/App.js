import Navbar from "./components/Navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Learning from "./components/LearningDashboard";
import Events from "./components/Events";
import Progress from "./components/Progress";
import HomePage from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import NotFound from "./components/Notfound";
import PrivateRoute from "./middleware/Private";
import AdminRoute from "./middleware/Admin"; // Import the AdminRoute middleware
import AdminDashboard from "./components/AdminDashboard"; // Import the AdminDashboard

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
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Private Routes */}
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

          {/* Admin Private Route */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Catch-all route for invalid paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
