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
} from "@mui/material";
import { getCourses } from "../services/api";
import ViewCourseModal from "./ViewCourseModal"; // Import the modal component

const LearningDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCourse(null);
  };

  const styles = {
    header: {
      color: "#14213d",
      fontWeight: "bold",
    },
    card: {
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      padding: "1rem",
    },
    tableHeader: {
      backgroundColor: "#14213d",
      color: "white",
      fontWeight: "bold",
    },
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={styles.header} gutterBottom>
        Learning Dashboard
      </Typography>
      <Card sx={styles.card}>
        <CardContent>
          <Typography variant="h5" sx={styles.header}>
            Available Courses
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={styles.tableHeader}>Course Title</TableCell>
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
                        variant="contained"
                        onClick={() => handleViewCourse(course)}
                        sx={{
                          backgroundColor: "#14213d",
                          color: "white",
                          "&:hover": { backgroundColor: "#fca311" },
                        }}
                      >
                        View Course
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {selectedCourse && (
        <ViewCourseModal
          open={modalOpen}
          onClose={closeModal}
          courseId={selectedCourse.course_id}
          courseTitle={selectedCourse.title}
        />
      )}

      
    </Box>
  );
};

export default LearningDashboard;
