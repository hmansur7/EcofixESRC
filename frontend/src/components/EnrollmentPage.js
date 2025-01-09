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
  Container,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  TablePagination,
} from "@mui/material";
import { Search, AccessTime, Assignment } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAvailableCourses, enrollCourse } from "../services/api";

const CourseCard = ({ course, onEnrollClick }) => {
  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return { bg: '#d4edda', text: '#155724' };
      case 'intermediate':
        return { bg: '#fff3cd', text: '#856404' };
      case 'advanced':
        return { bg: '#f8d7da', text: '#721c24' };
      default:
        return { bg: '#f8f9fa', text: '#383d41' };
    }
  };

  const styles = {
    card: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "white",
      position: "relative",
      borderRadius: "8px",
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
      },
    },
    cardContent: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: "1.5rem",
    },
    levelChip: {
      backgroundColor: getLevelColor(course.level).bg,
      color: getLevelColor(course.level).text,
      fontWeight: "medium",
      fontSize: "0.875rem",
    },
  };

  return (
    <Card sx={styles.card}>
      <CardContent sx={styles.cardContent}>        
        <Chip
          label={course.level}
          sx={styles.levelChip}
        />

        <Typography 
          variant="h6" 
          sx={{ 
            color: "#14213d", 
            fontWeight: "bold",
            mt: 2,
            mb: 2,
            minHeight: "3rem"
          }}
        >
          {course.title}
        </Typography>

        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2, minHeight: "3rem" }}
        >
          {course.description}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <AccessTime fontSize="small" sx={{ color: "#666", mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Duration: {course.duration}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Assignment fontSize="small" sx={{ color: "#666", mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Prerequisites: {course.prerequisites}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={() => onEnrollClick(course)}
          sx={{
            mt: "auto",
            backgroundColor: "#14213d",
            color: "white",
            "&:hover": { backgroundColor: "#fca311" },
          }}
        >
          ENROLL NOW
        </Button>
      </CardContent>
    </Card>
  );
};

const EnrollmentPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [availableCourses, setAvailableCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  
  // Pagination and filter states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [levelFilter, setLevelFilter] = useState("All");

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      const data = await getAvailableCourses();
      setAvailableCourses(data);
      setFilteredCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load available courses");
      setAvailableCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = useCallback(() => {
    let filtered = [...availableCourses];
    
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
    setPage(0);
  }, [availableCourses, searchTerm, levelFilter]);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setEnrollDialogOpen(true);
  };

  const handleEnrollConfirm = async () => {
    try {
      setEnrolling(true);
      await enrollCourse(selectedCourse.course_id);
      setEnrollDialogOpen(false);
      navigate('/learning');
    } catch (error) {
      console.error("Error enrolling:", error);
      setError(error.response?.data?.error || "Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleLevelChange = (event) => {
    setLevelFilter(event.target.value);
  };

  const styles = {
    wrapper: {
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      padding: isMobile ? "1rem" : "2rem",
    },
    header: {
      color: "#14213d",
      fontWeight: "bold",
      fontSize: isMobile ? "1.5rem" : "2rem",
      marginBottom: isMobile ? "1rem" : 0,
    },
    filterContainer: {
      display: "flex",
      gap: 2,
      mb: 3,
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "stretch" : "center",
    },
    searchField: {
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
    levelSelect: {
      minWidth: 200,
      backgroundColor: "white",
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
    pagination: {
      backgroundColor: "#fca311",
      ".MuiTablePagination-select": {
        backgroundColor: "white",
        borderRadius: "4px",
      },
      ".MuiTablePagination-selectIcon": {
        color: "#14213d",
      },
      "& .MuiButtonBase-root": {
        color: "#14213d",
        "&.Mui-disabled": {
          color: "rgba(0, 0, 0, 0.26)",
        },
      },
    },
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ padding: isMobile ? 2 : 3 }}>
        <Card sx={styles.wrapper}>
          <Box sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            mb: 4,
          }}>
            <Typography variant="h1" sx={styles.header}>
              Available Courses
            </Typography>
          </Box>

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
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              label="Difficulty Level"
              value={levelFilter}
              onChange={handleLevelChange}
              sx={styles.levelSelect}
            >
              <MenuItem value="All">All Levels</MenuItem>
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </TextField>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : (
            <>
              <Grid container spacing={3}>
                {filteredCourses
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course.course_id}>
                      <CourseCard 
                        course={course} 
                        onEnrollClick={handleEnrollClick}
                      />
                    </Grid>
                  ))
                }
                {filteredCourses.length === 0 && (
                  <Grid item xs={12}>
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
                        Try adjusting your search or filter criteria.
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {filteredCourses.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <TablePagination
                    component="div"
                    count={filteredCourses.length}
                    page={page}
                    onPageChange={handlePageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[6, 12, 24]}
                    sx={styles.pagination}
                  />
                </Box>
              )}
            </>
          )}
        </Card>

        <Dialog
          open={enrollDialogOpen}
          onClose={() => !enrolling && setEnrollDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: "#14213d" }}>
            Confirm Enrollment
          </DialogTitle>
          <DialogContent>
            {selectedCourse && (
              <>
                <Typography variant="h6" gutterBottom>
                  {selectedCourse.title}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Duration: {selectedCourse.duration}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  By enrolling, you'll get immediate access to the course materials and it will appear in your learning dashboard.
                </Typography>
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ padding: 2 }}>
            <Button 
              onClick={() => setEnrollDialogOpen(false)}
              sx={{ color: "#14213d" }}
              disabled={enrolling}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleEnrollConfirm}
              disabled={enrolling}
              sx={{
                backgroundColor: "#14213d",
                color: "white",
                "&:hover": { backgroundColor: "#fca311" },
              }}
            >
              {enrolling ? <CircularProgress size={24} /> : "Confirm Enrollment"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default EnrollmentPage;