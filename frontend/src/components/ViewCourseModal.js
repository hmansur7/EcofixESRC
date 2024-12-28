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
  Button,
  Checkbox,
  Collapse,
  IconButton,
  Box,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Download,
} from "@mui/icons-material";
import {
  getLessonsForCourse,
  updateLessonProgress,
  getLessonResources,
} from "../services/api";

const LessonRow = ({ lesson, onCompletionChange }) => {
  const [open, setOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResources = async () => {
    if (!open) {
      setLoading(true);
      try {
        const data = await getLessonResources(lesson.lesson_id);
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    }
    setOpen(!open);
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={fetchResources}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{lesson.title}</TableCell>
        <TableCell>{lesson.description}</TableCell>
        <TableCell>
          <Checkbox
            checked={lesson.completed}
            onChange={(e) =>
              onCompletionChange(lesson.lesson_id, e.target.checked)
            }
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Resources
              </Typography>
              {loading ? (
                <Typography>Loading resources...</Typography>
              ) : resources.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Uploaded</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>{resource.title}</TableCell>
                        <TableCell>
                          {new Date(resource.uploaded_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            startIcon={<Download />}
                            sx={{ backgroundColor: "#14213d", "&:hover": { backgroundColor: "#fca311" }}}
                            href={resource.file}
                            download
                            size="small"
                            variant="contained"
                            color="primary"
                          >
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography>No resources available</Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const ViewCourseModal = ({ open, onClose, courseId, courseTitle }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      const fetchLessons = async () => {
        try {
          const lessonsData = await getLessonsForCourse(courseId);
          const normalizedLessons = lessonsData.map((lesson) => ({
            ...lesson,
            completed: Boolean(lesson.completed),
          }));
          setLessons(normalizedLessons);
        } catch (error) {
          setLessons([]);
        } finally {
          setLoading(false);
        }
      };

      fetchLessons();
    }
  }, [courseId]);

  const handleLessonCompletion = async (lessonId, completed) => {
    try {
      await updateLessonProgress(lessonId, completed);
      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson.lesson_id === lessonId ? { ...lesson, completed } : lesson
        )
      );
    } catch (error) {
      console.error("Error updating lesson progress:", error);
    }
  };

  const styles = {
    header: {
      color: "#14213d",
      fontWeight: "bold",
    },
    tableHeader: {
      backgroundColor: "#14213d",
      color: "white",
      fontWeight: "bold",
    },
    loadingText: {
      textAlign: "center",
      fontWeight: "bold",
      marginTop: "1rem",
    },
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography variant="h5" sx={styles.header}>
          {courseTitle} - Lessons
        </Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography sx={styles.loadingText}>Loading lessons...</Typography>
        ) : lessons.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={styles.tableHeader} width="50px" />
                  <TableCell sx={styles.tableHeader}>Lesson Title</TableCell>
                  <TableCell sx={styles.tableHeader}>Description</TableCell>
                  <TableCell sx={styles.tableHeader}>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lessons.map((lesson) => (
                  <LessonRow
                    key={lesson.lesson_id}
                    lesson={lesson}
                    onCompletionChange={handleLessonCompletion}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography sx={styles.loadingText}>
            No lessons available for this course.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          variant="contained" 
          onClick={onClose}
          sx={{
            backgroundColor: "darkred",
            color: "white",
            "&:hover": { backgroundColor: "red" },
          }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCourseModal;
