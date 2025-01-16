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
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Pagination,
} from "@mui/material";
import { Search, AccessTime, Assignment, School } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAvailableCourses, enrollCourse } from "../services/api";
import ScrollToTop from "./ScrollToTop";

const CourseCard = ({ course, onEnrollClick }) => {
  const truncateTitle = (text) => {
    if (text.length <= 35) return text;
    return text.slice(0, 32) + "...";
  };

  const truncateDescription = (text) => {
    if (text.length <= 75) return text;
    return text.slice(0, 72) + "...";
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return { bg: "#d4edda", text: "#155724" };
      case "intermediate":
        return { bg: "#fff3cd", text: "#856404" };
      case "advanced":
        return { bg: "#f8d7da", text: "#721c24" };
      default:
        return { bg: "#f8f9fa", text: "#383d41" };
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
    title: {
      color: "#14213d",
      fontWeight: "bold",
      mt: 2,
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
    description: {
      mb: 2,
      minHeight: "3rem",
      maxHeight: "3rem",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      lineHeight: 1.3,
    },
  };

  return (
    <Card sx={styles.card}>
      <CardContent sx={styles.cardContent}>
        <Chip label={course.level} sx={styles.levelChip} />

        <Typography variant="h6" sx={styles.title}>
          {truncateTitle(course.title)}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={styles.description}
        >
          {truncateDescription(course.description)}
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
          VIEW COURSE
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

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [levelFilter, setLevelFilter] = useState("All");

  const [dialogError, setDialogError] = useState(null);
  const [dialogEnrolling, setDialogEnrolling] = useState(false);

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
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== "All") {
      filtered = filtered.filter(
        (course) => course.level.toLowerCase() === levelFilter.toLowerCase()
      );
    }

    setFilteredCourses(filtered);
    setPage(1);
  }, [availableCourses, searchTerm, levelFilter]);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  useEffect(() => {
    setPage(1);
  }, []);

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setEnrollDialogOpen(true);
  };

  const handleEnrollConfirm = async () => {
    try {
      setDialogEnrolling(true);
      setDialogError(null);

      await enrollCourse(selectedCourse.course_id);
      setEnrollDialogOpen(false);
      navigate("/learning", {
        state: {
          enrollSuccess: true,
          courseName: selectedCourse.title,
        },
      });
    } catch (error) {
      setDialogError(
        error.response?.data?.error || "Failed to enroll in course"
      );
    } finally {
      setDialogEnrolling(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    const mainCard = document.querySelector('[class*="wrapper"]');
    if (mainCard) {
      const headerOffset = 16;
      const cardPosition = mainCard.getBoundingClientRect().top;
      const offsetPosition = cardPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
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

  const paginatedCourses = filteredCourses.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ padding: isMobile ? 2 : 3 }}>
        <Card sx={styles.wrapper}>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "stretch" : "center",
              mb: 4,
            }}
          >
            <Typography variant="h1" sx={styles.header}>
              Available Courses
            </Typography>
          </Box>

          <Box sx={styles.filterContainer}>
            <Tooltip title="Search courses by title" placement="top" arrow>
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
            <Tooltip
              title="Filter courses by difficulty level"
              placement="top"
              arrow
            >
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
            </Tooltip>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              <Grid container spacing={3}>
                {paginatedCourses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.course_id}>
                    <CourseCard
                      course={course}
                      onEnrollClick={handleEnrollClick}
                    />
                  </Grid>
                ))}
                {filteredCourses.length === 0 && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 8,
                        px: 2,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "text.secondary", mb: 1 }}
                      >
                        No courses found
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", textAlign: "center" }}
                      >
                        Try adjusting your search or filter criteria.
                      </Typography>
                    </Box>
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
            </>
          )}
        </Card>

        <Dialog
          open={enrollDialogOpen}
          onClose={() => {
            if (!dialogEnrolling) {
              setEnrollDialogOpen(false);
              setDialogError(null);
            }
          }}
          maxWidth="md"
          fullWidth
        >
          {selectedCourse && (
            <>
              <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Course Title and Level */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          color: "#14213d",
                          fontWeight: "bold",
                          mb: 1,
                          wordBreak: "break-word", 
                          overflowWrap: "break-word", 
                          hyphens: "auto", 
                          "& > span": {
                            display: "inline-block", 
                            maxWidth: "100%", 
                          },
                        }}
                      >
                        <span>{selectedCourse.title}</span>
                      </Typography>
                      <Chip
                        label={selectedCourse.level}
                        sx={{
                          backgroundColor: "#fca311",
                          color: "white",
                          alignSelf: "flex-start", 
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Course Details */}
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ color: "#14213d", mb: 1 }}>
                      Course Description
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "pre-line", 
                        maxWidth: "100%",
                      }}
                    >
                      {selectedCourse.description}
                    </Typography>

                    <Typography variant="h6" sx={{ color: "#14213d", mb: 1 }}>
                      Prerequisites
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {selectedCourse.prerequisites}
                    </Typography>
                  </Grid>

                  {/* Course Meta Information */}
                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        backgroundColor: "#f8f9fa",
                        "& .MuiListItemText-secondary": {
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        },
                      }}
                    >
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <AccessTime />
                          </ListItemIcon>
                          <ListItemText
                            primary="Duration"
                            secondary={selectedCourse.duration}
                            primaryTypographyProps={{
                              style: { wordBreak: "break-word" },
                            }}
                            secondaryTypographyProps={{
                              style: { wordBreak: "break-word" },
                            }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <School />
                          </ListItemIcon>
                          <ListItemText
                            primary="Level"
                            secondary={selectedCourse.level}
                            primaryTypographyProps={{
                              style: { wordBreak: "break-word" },
                            }}
                            secondaryTypographyProps={{
                              style: { wordBreak: "break-word" },
                            }}
                          />
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>

                  {/* Error Alert */}
                  {dialogError && (
                    <Grid item xs={12}>
                      <Alert
                        severity="error"
                        sx={{
                          "& .MuiAlert-message": {
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          },
                        }}
                        action={
                          dialogError.includes("already enrolled") && (
                            <Button
                              color="inherit"
                              size="small"
                              onClick={() => {
                                setEnrollDialogOpen(false);
                                setDialogError(null);
                                navigate("/learning");
                              }}
                            >
                              Go to your courses
                            </Button>
                          )
                        }
                      >
                        {dialogError}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>

              <DialogActions
                sx={{
                  p: 3,
                  backgroundColor: "#f8f9fa",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                }}
              >
                <Button
                  onClick={() => {
                    setEnrollDialogOpen(false);
                    setDialogError(null);
                  }}
                  disabled={dialogEnrolling}
                  sx={{
                    color: "#14213d",
                    textTransform: "none",
                    fontSize: "1rem",
                    minWidth: "100px",
                    padding: "8px 16px",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleEnrollConfirm}
                  disabled={
                    dialogEnrolling || dialogError?.includes("already enrolled")
                  }
                  sx={{
                    backgroundColor: "#14213d",
                    "&:hover": { backgroundColor: "#fca311" },
                    textTransform: "none",
                    fontSize: "1rem",
                    minWidth: "120px",
                    padding: "8px 24px",
                  }}
                >
                  {dialogEnrolling ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Enroll Now"
                  )}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
      <ScrollToTop/>
    </Container>
  );
};

export default EnrollmentPage;
