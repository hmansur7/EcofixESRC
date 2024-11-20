import Navbar from "./components/Navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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

  return (
    <Router>      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Navbar title="User Dashboard" links={navbarLinks} />
      <Routes>
        <Route path="/learning" element={<Learning />} />
        <Route path="/events" element={<Events />} />
        <Route path="/progress" element={<Progress />} />
      </Routes>
    </Router>
  );
}

export default App;
