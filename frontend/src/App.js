import Navbar from "./components/Navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Learning from "./components/LearningDashboard";
import Events from "./components/Events";
import Progress from "./components/Progress";
import HomePage from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const navbarLinks = [
    { label: "Learning", path: "/learning" },
    { label: "Events", path: "/events" },
    { label: "Progress", path: "/progress" },
  ];

  // Custom Layout Wrapper for Conditional Navbar
  const Layout = ({ children }) => {
    const location = useLocation();

    // Hide Navbar on these routes
    const noNavbarRoutes = ["/", "/login", "/register"];
    const hideNavbar = noNavbarRoutes.includes(location.pathname);

    return (
      <>
        {!hideNavbar && <Navbar title="User Dashboard" links={navbarLinks} />}
        {children}
      </>
    );
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/events" element={<Events />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
