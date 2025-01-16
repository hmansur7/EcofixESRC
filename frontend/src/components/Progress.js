import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  TextField,
  InputAdornment,
  MenuItem,
  useTheme,
  useMediaQuery,
  Container,
  Pagination,
  Grid,
  Card as MobileCard,
  Tooltip,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { getCourseProgress, getEnrolledCourses } from "../services/api";

const ProgressDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [progressFilter, setProgressFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const coursesList = await getEnrolledCourses();
      setCourses(coursesList);
      setFilteredCourses(coursesList);
      setPage(1); // Reset page when data loads

      const progressMap = {};
      const progressPromises = coursesList.map(async (course) => {
        try {
          const progress = await getCourseProgress(course.course_id);
          progressMap[course.course_id] = progress.progress_percentage;
        } catch (error) {
          console.error(`Error fetching progress for course ${course.course_id}:`, error);
          progressMap[course.course_id] = 0;
        }
      });

      await Promise.all(progressPromises);
      setProgressData(progressMap);
    } catch (error) {
      console.error("Error fetching progress data:", error);
      setError("Failed to load course progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const filterCourses = useCallback(() => {
    let filtered = [...courses];
    
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (progressFilter !== "all") {
      filtered = filtered.filter(course => {
        const progress = progressData[course.course_id] || 0;
        switch (progressFilter) {
          case "notStarted":
            return progress === 0;
          case "inProgress":
            return progress > 0 && progress < 100;
          case "completed":
            return progress === 100;
          default:
            return true;
        }
      });
    }
    
    setFilteredCourses(filtered);
    setPage(1); // Reset page when filters change
  }, [courses, searchTerm, progressFilter, progressData]);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  useEffect(() => {
    setPage(1);
  }, []);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    const mainCard = document.querySelector('[class*="card"]');
    if (mainCard) {
      const headerOffset = 16;
      const cardPosition = mainCard.getBoundingClientRect().top;
      const offsetPosition = cardPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const styles = {
    header: {
      color: "#14213d",
      fontWeight: "bold",
      fontSize: isMobile ? "1.5rem" : "2rem",
    },
    card: {
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      padding: isMobile ? "0.5rem" : "1rem",
    },
    filterContainer: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 2,
      mb: 3,
      mt: 2,
    },
    searchField: {
      backgroundColor: "white",
      borderRadius: "4px",
      flex: isMobile ? 1 : "unset",
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
    progressFilter: {
      backgroundColor: "white",
      borderRadius: "4px",
      minWidth: isMobile ? "100%" : 200,
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
    tableHeader: {
      backgroundColor: "#14213d",
      color: "white",
      fontWeight: "bold",
    },
    mobileCard: {
      height: "100%",
      backgroundColor: "white",
      borderRadius: "8px",
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
      },
    },
    mobileCardContent: {
      padding: "1rem",
    },
    progressBar: {
      height: 10,
      borderRadius: 5,
      backgroundColor: "#e0e0e0",
    },
    pagination: {
      display: "flex",
      justifyContent: "center",
      padding: "2rem 0 1rem 0",
      "& .MuiPaginationItem-root": {
        color: "#14213d",
        "&.Mui-selected": {
          backgroundColor: "#fca311",
          color: "white",
        },
      },
    },
  };

  
  const NoCoursesFound = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        backgroundColor: '#f8f9fa',
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
        No courses found
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
        {courses.length === 0 
          ? "You haven't enrolled in any courses yet."
          : "Try adjusting your search or filter criteria."}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ padding: isMobile ? 2 : 3 }}>
          <Card sx={styles.card}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <Typography variant="h6" sx={{ color: "text.secondary" }}>
                  Loading progress...
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ padding: isMobile ? 2 : 3 }}>
        <Card sx={styles.card}>
          <CardContent>
            <Typography variant="h5" sx={styles.header}>
              Track Your Progress
            </Typography>

            <Box sx={styles.filterContainer}>
            <Tooltip title="Search your courses by title" placement="top" arrow>
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
                        <Search color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Tooltip>
              <Tooltip title="Filter courses by completion status" placement="top" arrow>
                <TextField
                  select
                  size="small"
                  label="Progress Filter"
                  value={progressFilter}
                  onChange={(e) => setProgressFilter(e.target.value)}
                  sx={styles.progressFilter}
                >
                  <MenuItem value="all">All Progress</MenuItem>
                  <MenuItem value="notStarted">Not Started (0%)</MenuItem>
                  <MenuItem value="inProgress">In Progress (1-99%)</MenuItem>
                  <MenuItem value="completed">Completed (100%)</MenuItem>
                </TextField>
              </Tooltip>
            </Box>

            <Grid container spacing={3}>
              {filteredCourses
                .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                .map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.course_id}>
                    <MobileCard sx={styles.mobileCard}>
                      <CardContent sx={styles.mobileCardContent}>
                        <Typography variant="h6" sx={{ 
                          color: "#14213d", 
                          fontWeight: "bold", 
                          mb: 2,
                          height: "3rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}>
                          {course.title}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progressData[course.course_id] || 0}
                            sx={styles.progressBar}
                          />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mt: 1, 
                              textAlign: "center", 
                              fontWeight: "bold",
                              color: "text.secondary"
                            }}
                          >
                            {(progressData[course.course_id] || 0).toFixed(1)}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </MobileCard>
                  </Grid>
                ))}
              {filteredCourses.length === 0 && (
                <Grid item xs={12}>
                  <NoCoursesFound />
                </Grid>
              )}
            </Grid>

            {filteredCourses.length > 0 && (
              <Box sx={styles.pagination}>
                <Pagination
                  count={Math.ceil(filteredCourses.length / rowsPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ProgressDashboard;