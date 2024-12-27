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
} from "@mui/material";
import { getLessonsForCourse, updateLessonProgress } from "../services/api"; // API to fetch lessons and update progress

const ViewCourseModal = ({ open, onClose, courseId, courseTitle }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      const fetchLessons = async () => {
        try {
          const lessonsData = await getLessonsForCourse(courseId);
          console.log('API Response for Lessons:', lessonsData);
          const normalizedLessons = lessonsData.map((lesson) => ({
            ...lesson,
            completed: lesson.completed === 1,
          }));
          setLessons(normalizedLessons);
        } catch (error) {
          console.error("Error fetching lessons:", error);
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
      await updateLessonProgress(lessonId, completed);  // Make sure this updates the backend correctly
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
      color: "green",
      fontWeight: "bold",
    },
    tableHeader: {
      backgroundColor: "green",
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
                  <TableCell sx={styles.tableHeader}>Lesson Title</TableCell>
                  <TableCell sx={styles.tableHeader}>Description</TableCell>
                  <TableCell sx={styles.tableHeader}>Attachment</TableCell>
                  <TableCell sx={styles.tableHeader}>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson.lesson_id}>
                    <TableCell>{lesson.title}</TableCell>
                    <TableCell>{lesson.description}</TableCell>
                    <TableCell>
                      {lesson.attachment ? (
                        <a
                          href={lesson.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Attachment
                        </a>
                      ) : (
                        "No Attachment"
                      )}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={lesson.completed} // Ensure the checkbox reflects the 'completed' status
                        onChange={(e) =>
                          handleLessonCompletion(
                            lesson.lesson_id,
                            e.target.checked
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
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
        <Button onClick={onClose} sx={{ color: "red", fontWeight: "bold" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCourseModal;
