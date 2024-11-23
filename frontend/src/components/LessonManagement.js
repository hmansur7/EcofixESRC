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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete, Edit, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getAdminCourses,
  addAdminCourse,
  removeAdminCourse,
  getLessonsForCourse,
  addAdminLesson,
  removeAdminLesson,
  logoutUser,
} from "../services/api";

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    content: "",
    order: "",
  });
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch admin data
  const fetchCourses = async () => {
    try {
      const coursesData = await getAdminCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  const fetchLessons = async (courseId) => {
    try {
      const lessonsData = await getLessonsForCourse(courseId);
      setLessons(lessonsData);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setLessons([]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Add a new course
  const handleAddCourse = async () => {
    try {
      await addAdminCourse(newCourse);
      setNewCourse({ title: "", description: "" });
      fetchCourses();
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  // Remove a course
  const handleRemoveCourse = async (courseId) => {
    try {
      await removeAdminCourse(courseId);
      fetchCourses();
    } catch (error) {
      console.error("Error removing course:", error);
    }
  };

  // Open lesson dialog
  const openLessonDialog = (course) => {
    setSelectedCourse(course);
    fetchLessons(course.course_id);
    setIsLessonDialogOpen(true);
  };

  // Close lesson dialog
  const closeLessonDialog = () => {
    setSelectedCourse(null);
    setLessons([]);
    setIsLessonDialogOpen(false);
  };

  // Add a new lesson
  const handleAddLesson = async () => {
    try {
      const lessonData = { ...newLesson, course_id: selectedCourse.course_id };
      await addAdminLesson(lessonData);
      setNewLesson({ title: "", description: "", content: "", order: "" });
      fetchLessons(selectedCourse.course_id);
    } catch (error) {
      console.error("Error adding lesson:", error);
    }
  };

  // Remove a lesson
  const handleRemoveLesson = async (lessonId) => {
    try {
      await removeAdminLesson(lessonId);
      fetchLessons(selectedCourse.course_id);
    } catch (error) {
      console.error("Error removing lesson:", error);
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
                      <Button
                        variant="outlined"
                        onClick={() => openLessonDialog(course)}
                        sx={{
                          textTransform: "none",
                          marginRight: 1,
                          backgroundColor: "lightblue",
                        }}
                      >
                        Manage Lessons
                      </Button>
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

      {/* Lesson Management Dialog */}
      <Dialog
        open={isLessonDialogOpen}
        onClose={closeLessonDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Manage Lessons</DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <>
              <Typography variant="h6">
                Lessons for {selectedCourse.title}
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={styles.tableHeader}>Title</TableCell>
                      <TableCell sx={styles.tableHeader}>Description</TableCell>
                      <TableCell sx={styles.tableHeader}>Order</TableCell>
                      <TableCell sx={styles.tableHeader}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lessons.map((lesson) => (
                      <TableRow key={lesson.lesson_id}>
                        <TableCell>{lesson.title}</TableCell>
                        <TableCell>{lesson.description}</TableCell>
                        <TableCell>{lesson.order}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleRemoveLesson(lesson.lesson_id)}
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
              <Divider sx={{ mt: 3, mb: 3 }} />
              <Typography variant="h6">Add New Lesson</Typography>
              <TextField
                label="Lesson Title"
                fullWidth
                value={newLesson.title}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, title: e.target.value })
                }
                sx={{ mt: 2 }}
              />
              <TextField
                label="Lesson Description"
                fullWidth
                value={newLesson.description}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, description: e.target.value })
                }
                sx={{ mt: 2 }}
              />
              <TextField
                label="Lesson Content"
                fullWidth
                value={newLesson.content}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, content: e.target.value })
                }
                sx={{ mt: 2 }}
              />
              <TextField
                label="Order"
                fullWidth
                type="number"
                value={newLesson.order}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, order: e.target.value })
                }
                sx={{ mt: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleAddLesson}
                sx={{ mt: 3, ...styles.button }}
              >
                Add Lesson
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeLessonDialog}
            variant="contained"
            sx={{
              backgroundColor: "darkred",
              color: "white",
              "&:hover": { backgroundColor: "red" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
