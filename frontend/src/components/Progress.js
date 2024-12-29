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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { getCourses, getCourseProgress } from "../services/api";

const ProgressDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [progressFilter, setProgressFilter] = useState("all");

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
          console.error(
            `Error fetching progress for course ${course.course_id}:`,
            error
          );
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

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const progress = progressData[course.course_id] || 0;

    let matchesProgress = true;
    switch (progressFilter) {
      case "notStarted":
        matchesProgress = progress === 0;
        break;
      case "inProgress":
        matchesProgress = progress > 0 && progress < 100;
        break;
      case "completed":
        matchesProgress = progress === 100;
        break;
      default:
        matchesProgress = true;
    }

    return matchesSearch && matchesProgress;
  });

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
    filterContainer: {
      display: "flex",
      gap: 2,
      marginBottom: 2,
      alignItems: "center",
    },
    searchField: {
      flex: 1,
      backgroundColor: "white",
      borderRadius: "4px",
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#14213d",
        },
        "&:hover fieldset": {
          borderColor: "#fca311",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#14213d",
        },
      },
    },
    select: {
      minWidth: 200,
      backgroundColor: "white",
      borderRadius: "4px",
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#14213d",
        },
        "&:hover fieldset": {
          borderColor: "#fca311",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#14213d",
        },
      },
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
            <Box sx={styles.filterContainer}>
              <TextField
                placeholder="Search courses..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={styles.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={styles.select}>
                <InputLabel>Progress Filter</InputLabel>
                <Select
                  value={progressFilter}
                  label="Progress Filter"
                  onChange={(e) => setProgressFilter(e.target.value)}
                >
                  <MenuItem value="all">All Progress</MenuItem>
                  <MenuItem value="notStarted">Not Started (0%)</MenuItem>
                  <MenuItem value="inProgress">In Progress (1-99%)</MenuItem>
                  <MenuItem value="completed">Completed (100%)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={styles.tableHeader}>Course</TableCell>
                    <TableCell sx={styles.tableHeader}>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <TableRow key={course.course_id}>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={progressData[course.course_id] || 0}
                              sx={styles.progressBar}
                            />
                            <Typography sx={styles.progressLabel}>
                              {progressData[course.course_id]?.toFixed(2) ||
                                "0"}
                              %
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No courses found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
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
