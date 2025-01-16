import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  CardActions,
  Container,
  MenuItem,
  Grid,
  Pagination,
  Tooltip,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { getEnrolledCourses } from "../services/api";
import ViewCourseModal from "./ViewCourseModal";

const truncateTitle = (text) => {
  if (text.length <= 35) return text;
  return text.slice(0, 32) + "...";
};

const LearningDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getEnrolledCourses();
        setCourses(coursesData);
        setFilteredCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
        setFilteredCourses([]);
      }
    };

    fetchCourses();
  }, []);

  const filterCourses = useCallback(() => {
    let filtered = [...courses];
    
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (levelFilter !== "All") {
      filtered = filtered.filter(course => 
        course.level.toLowerCase() === levelFilter.toLowerCase()
      );
    }
    
    setFilteredCourses(filtered);
    setPage(1);
  }, [courses, searchTerm, levelFilter]);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCourse(null);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    const mainCard = document.querySelector('[class*="mainCard"]');
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
    mainCard: {
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
    levelFilter: {
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
    courseCard: {
      backgroundColor: "white",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      borderRadius: "8px",
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
      },
    },
    cardContent: {
      flexGrow: 1,
      padding: "1.5rem",
    },
    cardActions: {
      padding: "0.5rem 1.5rem 1.5rem",
      justifyContent: "flex-end",
    },
    title: {
      color: "#14213d",
      fontWeight: "bold",
      mb: 2,
      minHeight: "3rem",
      maxHeight: "3rem",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      lineHeight: 1.2,
    },
    levelChip: {
      mb: 2,
      display: "inline-block",
      backgroundColor: "#f8f9fa",
      color: "#14213d",
      fontWeight: "medium",
      fontSize: "0.875rem",
      padding: "4px 12px",
      borderRadius: "16px",
    },
    viewButton: {
      backgroundColor: "#14213d",
      color: "white",
      "&:hover": { 
        backgroundColor: "#fca311" 
      },
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

  const CourseCard = ({ course }) => (
    <Card sx={styles.courseCard}>
      <CardContent sx={styles.cardContent}>
        <Typography sx={styles.levelChip}>
          {course.level}
        </Typography>
        <Typography variant="h6" sx={styles.title}>
          {truncateTitle(course.title)}
        </Typography>
      </CardContent>
      <CardActions sx={styles.cardActions}>
        <Button
          variant="contained"
          onClick={() => handleViewCourse(course)}
          sx={styles.viewButton}
        >
          View Lessons
        </Button>
      </CardActions>
    </Card>
  );

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
        width: '100%',
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

  const paginatedCourses = filteredCourses.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ padding: isMobile ? 2 : 3 }}>
        <Card sx={styles.mainCard}>
          <CardContent>
            <Typography variant="h5" sx={styles.header}>
              Your Courses
            </Typography>

            <Box sx={styles.filterContainer}>
              <Tooltip title="Search by course title" arrow placement="top">
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
              <Tooltip title="Filter by difficulty level" arrow placement="top">
                <TextField
                  select
                  size="small"
                  label="Difficulty Level"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  sx={styles.levelFilter}
                >
                  <MenuItem value="All">All Levels</MenuItem>
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </TextField>
              </Tooltip>
            </Box>

            {filteredCourses.length > 0 ? (
              <>
                <Grid container spacing={3}>
                  {paginatedCourses.map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course.course_id}>
                      <CourseCard course={course} />
                    </Grid>
                  ))}
                </Grid>
                <Box sx={styles.pagination}>
                  <Pagination
                    count={Math.ceil(filteredCourses.length / rowsPerPage)}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </>
            ) : (
              <NoCoursesFound />
            )}
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
    </Container>
  );
};

export default LearningDashboard;