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
  LinearProgress,
} from "@mui/material";
import { getCourses, getCourseProgress } from "../services/api";

const ProgressDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProgressData = async () => {
    try {
      const coursesList = await getCourses();
      setCourses(coursesList);

      const progressMap = {};
      const progressPromises = coursesList.map(async (course) => {
        try {
          const progress = await getCourseProgress(course.course_id);
          progressMap[course.course_id] = progress.progress_percentage;
        } catch (error) {
          console.error(`Error fetching progress for course ${course.course_id}:`, error);
          progressMap[course.course_id] = 0; // Default to 0 if error occurs
        }
      });

      await Promise.all(progressPromises);
      setProgressData(progressMap);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching progress data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

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
    progressBar: {
      height: 10,
      borderRadius: 5,
      backgroundColor: "#e0e0e0",
    },
    progressLabel: {
      marginTop: 5,
      fontWeight: "bold",
      textAlign: "center",
    },
    loadingText: {
      textAlign: "center",
      marginTop: "2rem",
      fontWeight: "bold",
      fontSize: "1.2rem",
      color: "#888",
    },
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={styles.header} gutterBottom>
        Progress Dashboard
      </Typography>
      {loading ? (
        <Typography sx={styles.loadingText}>Loading progress...</Typography>
      ) : (
        <Card sx={styles.card}>
          <CardContent>
            <Typography variant="h5" sx={styles.header}>
              Your Courses Progress
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={styles.tableHeader}>Course</TableCell>
                    <TableCell sx={styles.tableHeader}>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.course_id}>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progressData[course.course_id] || 0}
                            sx={styles.progressBar}
                          />
                          <Typography sx={styles.progressLabel}>
                            {progressData[course.course_id]?.toFixed(2) || "0"}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProgressDashboard;
