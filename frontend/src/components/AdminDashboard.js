import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  IconButton,
  Divider,
} from "@mui/material";
import { Delete, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getAdminUsers,
  getAdminCourses,
  addAdminCourse,
  removeAdminCourse,
  getAdminEvents,
  addAdminEvent,
  removeAdminEvent,
  logoutUser,
} from "../services/api";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
  });

  const navigate = useNavigate();

  // Fetch admin data
  const fetchData = async () => {
    try {
      const usersData = await getAdminUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }

    try {
      const coursesData = await getAdminCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }

    try {
      const eventsData = await getAdminEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add a new course
  const handleAddCourse = async () => {
    try {
      await addAdminCourse(newCourse);
      setNewCourse({ title: "", description: "" });
      fetchData();
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  // Remove a course
  const handleRemoveCourse = async (courseId) => {
    try {
      await removeAdminCourse(courseId);
      fetchData();
    } catch (error) {
      console.error("Error removing course:", error);
    }
  };

  // Add a new event
  const handleAddEvent = async () => {
    try {
      await addAdminEvent(newEvent);
      setNewEvent({ title: "", description: "", start_time: "", end_time: "" });
      fetchData();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  // Remove an event
  const handleRemoveEvent = async (eventId) => {
    try {
      await removeAdminEvent(eventId);
      fetchData();
    } catch (error) {
      console.error("Error removing event:", error);
    }
  };

  const styles = {
    header: {
      color: "green",
      fontWeight: "bold",
    },
    card: {
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      padding: "1rem",
    },
    tableHeader: {
      backgroundColor: "green",
      color: "white",
      fontWeight: "bold",
    },
    button: {
      backgroundColor: "green",
      color: "white",
      "&:hover": { backgroundColor: "darkgreen" },
    },
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={styles.header}>
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            logoutUser();
            navigate("/login");
          }}
          sx={{
            backgroundColor: "darkred",
            color: "white",
            "&:hover": { backgroundColor: "red" },
            textTransform: "none",
            fontWeight: "bold",
          }}
          startIcon={<Logout />}
        >
          Logout
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* User Management */}
      <Card sx={{ mb: 3, ...styles.card }}>
        <CardContent>
          <Typography variant="h5" sx={styles.header}>
            Registered Users
          </Typography>
          {users.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={styles.tableHeader}>ID</TableCell>
                    <TableCell sx={styles.tableHeader}>Name</TableCell>
                    <TableCell sx={styles.tableHeader}>Email</TableCell>
                    <TableCell sx={styles.tableHeader}>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>{user.user_id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" sx={{ mt: 2 }}>
              No registered users found.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Course Management */}
      <Card sx={{ mb: 3, ...styles.card }}>
        <CardContent>
          <Typography variant="h5" sx={styles.header}>
            Manage Courses
          </Typography>
          <TextField
            label="Course Title"
            fullWidth
            value={newCourse.title}
            onChange={(e) =>
              setNewCourse({ ...newCourse, title: e.target.value })
            }
            sx={{ mt: 2 }}
          />
          <TextField
            label="Course Description"
            fullWidth
            value={newCourse.description}
            onChange={(e) =>
              setNewCourse({ ...newCourse, description: e.target.value })
            }
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleAddCourse}
            sx={{ mt: 2, ...styles.button }}
          >
            Add Course
          </Button>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={styles.tableHeader}>Title</TableCell>
                  <TableCell sx={styles.tableHeader}>Description</TableCell>
                  <TableCell sx={styles.tableHeader}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.course_id}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.description}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleRemoveCourse(course.course_id)}
                        sx={{ color: "red" }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Event Management */}
      <Card sx={styles.card}>
        <CardContent>
          <Typography variant="h5" sx={styles.header}>
            Manage Events
          </Typography>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              label="Event Title"
              fullWidth
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              sx={{ mt: 2 }}
            />
            <TextField
              label="Event Description"
              fullWidth
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              sx={{ mt: 2 }}
            />
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                mt: 2,
              }}
            >
              <TextField
                label="Start Time"
                type="datetime-local"
                value={newEvent.start_time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start_time: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="End Time"
                type="datetime-local"
                value={newEvent.end_time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, end_time: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flex: 1 }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleAddEvent}
              sx={{ mt: 3, ...styles.button }}
            >
              Add Event
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={styles.tableHeader}>Title</TableCell>
                  <TableCell sx={styles.tableHeader}>Description</TableCell>
                  <TableCell sx={styles.tableHeader}>Start Time</TableCell>
                  <TableCell sx={styles.tableHeader}>End Time</TableCell>
                  <TableCell sx={styles.tableHeader}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.event_id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.description}</TableCell>
                    <TableCell>
                      {new Date(event.start_time).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(event.end_time).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleRemoveEvent(event.event_id)}
                        sx={{ color: "red" }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;