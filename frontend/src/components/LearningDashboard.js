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
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { getCourses } from "../services/api";
import ViewCourseModal from "./ViewCourseModal";

const LearningDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    searchField: {
      marginBottom: 2,
      backgroundColor: "white",
      borderRadius: "4px",
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#14213d',
        },
        '&:hover fieldset': {
          borderColor: '#fca311',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#14213d',
        },
      },
    },
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={styles.header} gutterBottom>
        Learning Dashboard
      </Typography>
      <Card sx={styles.card}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={styles.header}>
              Available Courses
            </Typography>
            <TextField
              placeholder="Search courses..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={styles.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
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
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No courses found matching your search.
                    </TableCell>
                  </TableRow>
                )}
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