import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { getLessonsForCourse, addAdminLesson, removeAdminLesson } from "../services/api";

const LessonManagement = ({ open, onClose, course }) => {
  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    content: "",
    order: "",
  });

  // Fetch lessons when the dialog opens or the course changes
  useEffect(() => {
    if (course && open) {
      fetchLessons(course.course_id);
    }
  }, [course, open]);

  const fetchLessons = async (courseId) => {
    try {
      const lessonsData = await getLessonsForCourse(courseId);
      setLessons(lessonsData);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setLessons([]);
    }
  };

  const handleAddLesson = async () => {
    if (
      !newLesson.title ||
      !newLesson.description ||
      !newLesson.content ||
      !newLesson.order
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const lessonData = {
        ...newLesson,
        course_id: course.course_id,
      };
      await addAdminLesson(lessonData);
      alert("Lesson added successfully!");
      setNewLesson({ title: "", description: "", content: "", order: "" }); // Reset form
      fetchLessons(course.course_id); // Refresh lessons
    } catch (error) {
      console.error("Error adding lesson:", error.response?.data || error.message);
      alert("Failed to add lesson. Check the console for more details.");
    }
  };

  const handleRemoveLesson = async (lessonId) => {
    try {
      await removeAdminLesson(lessonId);
      fetchLessons(course.course_id); // Refresh lessons after removal
    } catch (error) {
      console.error("Error removing lesson:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Lessons</DialogTitle>
      <DialogContent>
        {course && (
          <>
            <Typography variant="h6">Lessons for {course.title}</Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Actions</TableCell>
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
              sx={{ mt: 3 }}
            >
              Add Lesson
            </Button>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ backgroundColor: "darkred", color: "white" }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LessonManagement;
