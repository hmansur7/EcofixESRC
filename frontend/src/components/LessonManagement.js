import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
import {
  getLessonsForCourse,
  addAdminLesson,
  removeAdminLesson,
  addLessonResource,
} from "../services/api";

const LessonManagement = ({ open, onClose, course }) => {
  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    content: "",
    order: "",
    file: null,
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
      !newLesson.order ||
      !newLesson.file
    ) {
      alert("Please fill in all fields and upload a file.");
      return;
    }

    try {
      // Step 1: Add the lesson details (without the file)
      const lessonData = {
        title: newLesson.title,
        description: newLesson.description,
        content: newLesson.content,
        order: newLesson.order,
        course_id: course.course_id, // Course association
      };

      const lessonResponse = await addAdminLesson(lessonData);
      alert("Lesson added successfully!");

      // Step 2: Upload the file to the newly created lesson
      const formData = new FormData();
      formData.append("title", newLesson.title);
      formData.append("file", newLesson.file);
      formData.append("lesson", lessonResponse.lesson_id); // Assume the response includes lesson_id

      await addLessonResource(formData); // Call API to upload the file
      alert("File uploaded successfully!");

      // Step 3: Reset form and refresh the list
      setNewLesson({
        title: "",
        description: "",
        content: "",
        order: "",
        file: null,
      });
      fetchLessons(course.course_id); // Refresh lessons list
    } catch (error) {
      console.error(
        "Error adding lesson or file:",
        error.response?.data || error.message
      );
      alert(
        "Failed to add lesson or upload file. Check the console for more details."
      );
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
            <input
              type="file"
              onChange={(e) =>
                setNewLesson({ ...newLesson, file: e.target.files[0] })
              }
              style={{ marginTop: "16px" }}
            />

            {/* Button Container for proper alignment */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <Button
                variant="contained"
                onClick={handleAddLesson}
                sx={{
                  alignSelf: "flex-start",
                  backgroundColor: "primary.main",
                }}
              >
                Add Lesson
              </Button>

              <Button
                onClick={onClose}
                variant="contained"
                sx={{
                  backgroundColor: "darkred",
                  color: "white",
                  alignSelf: "flex-end",
                }}
              >
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LessonManagement;
