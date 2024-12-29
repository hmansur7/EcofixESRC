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
  Box,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
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
    order: "",
    resources: [],
  });

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

  const handleAddResource = () => {
    setNewLesson({
      ...newLesson,
      resources: [...newLesson.resources, { title: "", file: null }],
    });
  };

  const handleRemoveResource = (index) => {
    const updatedResources = newLesson.resources.filter((_, i) => i !== index);
    setNewLesson({ ...newLesson, resources: updatedResources });
  };

  const handleResourceChange = (index, field, value) => {
    const updatedResources = newLesson.resources.map((resource, i) => {
      if (i === index) {
        return { ...resource, [field]: value };
      }
      return resource;
    });
    setNewLesson({ ...newLesson, resources: updatedResources });
  };

  const handleAddLesson = async () => {
    if (!newLesson.title || !newLesson.description || !newLesson.order) {
      alert("Please fill in all required lesson fields.");
      return;
    }

    try {
      const lessonData = {
        title: newLesson.title,
        description: newLesson.description,
        order: newLesson.order,
        course: course.course_id,
      };

      const lessonResponse = await addAdminLesson(lessonData);

      if (newLesson.resources.length > 0) {
        const formData = new FormData();
        formData.append("lesson", lessonResponse.lesson_id);

        newLesson.resources.forEach((resource, index) => {
          if (resource.file && resource.title) {
            formData.append("titles", resource.title);
            formData.append("resources", resource.file);
          }
        });

        await addLessonResource(formData);
      }

      alert("Lesson and resources added successfully!");

      setNewLesson({
        title: "",
        description: "",
        content: "",
        order: "",
        resources: [],
      });
      fetchLessons(course.course_id);
    } catch (error) {
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert(
        "Failed to add lesson or upload resources. Check console for details."
      );
    }
  };

  const handleRemoveLesson = async (lessonId) => {
    try {
      await removeAdminLesson(lessonId);
      fetchLessons(course.course_id);
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
              label="Order"
              fullWidth
              type="number"
              value={newLesson.order}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value < 1) {
                  return; 
                }
                setNewLesson({ ...newLesson, order: value });
              }}
              inputProps={{ min: "1" }} 
              helperText="Order must be a positive number"
              sx={{ mt: 2 }}
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1">Lesson Resources</Typography>
              {newLesson.resources.map((resource, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <TextField
                    label="Resource Title"
                    value={resource.title}
                    onChange={(e) =>
                      handleResourceChange(index, "title", e.target.value)
                    }
                    sx={{ flex: 1 }}
                  />
                  <input
                    type="file"
                    onChange={(e) =>
                      handleResourceChange(index, "file", e.target.files[0])
                    }
                    style={{ flex: 1 }}
                  />
                  <IconButton
                    onClick={() => handleRemoveResource(index)}
                    sx={{ color: "red" }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={handleAddResource}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Add Resource
              </Button>
            </Box>

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
                  "&:hover": { backgroundColor: "red" },
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
