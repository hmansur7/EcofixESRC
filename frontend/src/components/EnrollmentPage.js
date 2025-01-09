import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Search, AccessTime, Assignment } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAvailableCourses, enrollCourse } from "../services/api";

const EnrollmentPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      const data = await getAvailableCourses();
      setAvailableCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load available courses");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredCourses = availableCourses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    header: {
      color: "#14213d",
      fontWeight: "bold",
      fontSize: isMobile ? "1.5rem" : "2rem",
      marginBottom: isMobile ? "1rem" : 0,
    },
    wrapper: {
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      padding: isMobile ? "1rem" : "2rem",
    },
    searchField: {
    marginBottom: isMobile ? "1rem" : 0,
      backgroundColor: "white",
      borderRadius: "4px",
      width: isMobile ? "100%" : "300px",
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
    levelChip: (level) => {
      const colors = getLevelColor(level);
      return {
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: "medium",
        fontSize: "0.875rem",
      };
    },
  };

  const CourseCard = ({ course }) => (
    <Card sx={styles.courseCard}>
      <CardContent sx={styles.cardContent}>        
        <Chip
          label={course.level}
          sx={styles.levelChip(course.level)}
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
          onClick={() => handleEnrollClick(course)}
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
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.course_id}>
                    <CourseCard course={course} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography align="center" sx={{ mt: 2 }}>
                    No courses found matching your search.
                  </Typography>
                </Grid>
              )}
            </Grid>
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