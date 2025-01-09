import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  IconButton,
  MenuItem,
  InputAdornment,
  useTheme,
  useMediaQuery,
  TablePagination,
  Container,
  Collapse,
  Tooltip,
} from "@mui/material";
import { Delete, Search, Add, ExpandLess } from "@mui/icons-material";
import {
  getAdminCourses,
  addAdminCourse,
  removeAdminCourse,
} from "../services/api";
import LessonManagement from "./LessonManagement";

const TruncatedText = ({ text, maxLength = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (text.length <= maxLength) {
    return <Typography variant="body2">{text}</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Typography
        variant="body2"
        sx={{
          display: "inline",
          wordBreak: "break-word",
        }}
      >
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      </Typography>
      <Button
        size="small"
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          ml: 0.5,
          minWidth: "auto",
          p: "2px 4px",
          fontSize: "0.75rem",
          textTransform: "none",
          color: "primary.main",
          "&:hover": {
            backgroundColor: "transparent",
            textDecoration: "underline",
          },
        }}
      >
        {isExpanded ? "(less)" : "(more)"}
      </Button>
    </Box>
  );
};


const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [errors, setErrors] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    duration: "",
    level: "Beginner",
    prerequisites: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const coursesData = await getAdminCourses();
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
      setFilteredCourses([]);
    }
  };

  const filterCourses = useCallback(() => {
    let filtered = [...courses];

    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (levelFilter !== "All") {
      filtered = filtered.filter((course) => course.level === levelFilter);
    }

    setFilteredCourses(filtered);
    setPage(0);
  }, [courses, searchQuery, levelFilter]);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const validateDuration = (duration) => {
    const pattern = /^\d+\s+(week|weeks|month|months)$/i;
    return pattern.test(duration);
  };

  const handleAddCourse = async () => {
    const newErrors = {};
    
    if (!newCourse.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!newCourse.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!newCourse.duration.trim()) {
      newErrors.duration = "Duration is required";
    } else if (!validateDuration(newCourse.duration)) {
      newErrors.duration = "Duration must be in format: X week(s) or X month(s)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const courseToAdd = {
        ...newCourse,
        prerequisites: newCourse.prerequisites.trim() || "None"
      };

      await addAdminCourse(courseToAdd);
      setNewCourse({
        title: "",
        description: "",
        duration: "",
        level: "Beginner",
        prerequisites: "",
      });
      setErrors({});
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        console.error("Error adding course:", error);
      }
    }
  };

  const handleRemoveCourse = async (courseId) => {
    try {
      await removeAdminCourse(courseId);
      fetchData();
    } catch (error) {
      console.error("Error removing course:", error);
    }
  };

  const openLessonDialog = (course) => {
    setSelectedCourse(course);
    setIsLessonDialogOpen(true);
  };

  const closeLessonDialog = () => {
    setSelectedCourse(null);
    setIsLessonDialogOpen(false);
  };

  const styles = {
    mainContainer: {
      pt: 3,  // Add padding top to account for navbar
      pb: 3,
      px: { xs: 2, sm: 3 }
    },
    card: {
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
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
    button: {
      backgroundColor: "#14213d",
      color: "white",
      "&:hover": {
        backgroundColor: "#fca311",
      },
    },
    tableHeader: {
      backgroundColor: "#14213d",
      color: "white",
      fontWeight: "bold",
    },
  };

  return (
    <Container maxWidth="lg">
      <Box sx={styles.mainContainer}>
        <Card sx={styles.card}>
          <CardHeader
            title={
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" sx={{ color: "#14213d", fontWeight: "bold" }}>
                  Course Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={showAddForm ? <ExpandLess /> : <Add />}
                  onClick={() => setShowAddForm(!showAddForm)}
                  sx={styles.button}
                >
                  {showAddForm ? "Hide" : "Add New Course"}
                </Button>
              </Box>
            }
          />
          <CardContent>
            <Collapse in={showAddForm}>
              <Paper sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#14213d" }}>
                  Add New Course
                </Typography>
                
                <TextField
                  label="Course Title"
                  fullWidth
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  error={!!errors.title}
                  helperText={errors.title}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  error={!!errors.description}
                  helperText={errors.description}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    label="Duration"
                    fullWidth
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    error={!!errors.duration}
                    helperText={errors.duration || "Format: X week(s) or X month(s)"}
                  />

                  <TextField
                    select
                    label="Level"
                    fullWidth
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                  >
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                  </TextField>
                </Box>

                <TextField
                  label="Prerequisites"
                  fullWidth
                  value={newCourse.prerequisites}
                  onChange={(e) => setNewCourse({ ...newCourse, prerequisites: e.target.value })}
                  helperText="Enter any prerequisites for this course (default is None)"
                  sx={{ mb: 3 }}
                />

                <Button
                  variant="contained"
                  onClick={handleAddCourse}
                  sx={styles.button}
                >
                  Add Course
                </Button>
              </Paper>
            </Collapse>

            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: 2,
                mb: 3,
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={styles.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                size="small"
                fullWidth={isMobile}
                label="Filter by Level"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                sx={{
                  ...styles.searchField,
                  minWidth: isMobile ? "100%" : 200,
                }}
              >
                <MenuItem value="All">All Levels</MenuItem>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </TextField>
            </Box>

            <TableContainer>
              {filteredCourses.length > 0 ? (
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={styles.tableHeader}>Title</TableCell>
                      <TableCell sx={styles.tableHeader}>Description</TableCell>
                      <TableCell sx={styles.tableHeader}>Level</TableCell>
                      <TableCell sx={styles.tableHeader}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCourses
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((course) => (
                        <TableRow key={course.course_id}>
                          <TableCell>{course.title}</TableCell>
                          <TableCell>
                            <TruncatedText text={course.description} />
                          </TableCell>
                          <TableCell>{course.level}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              onClick={() => openLessonDialog(course)}
                              sx={{
                                ...styles.button,
                                mr: 1,
                              }}
                              size="small"
                            >
                              Manage Lessons
                            </Button>
                            <Tooltip title="Delete Course">
                              <IconButton
                                onClick={() => handleRemoveCourse(course.course_id)}
                                sx={{ color: "red" }}
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
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
                  {courses.length === 0 ? (
                    <>
                      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                        No courses available
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                        Click the "Add New Course" button above to get started.
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                        No matching courses found
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                        Try adjusting your search or filter criteria.
                      </Typography>
                    </>
                  )}
                </Box>
              )}
              {filteredCourses.length > 0 && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredCourses.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
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
                  }}
                />
              )}
            </TableContainer>
          </CardContent>
        </Card>

        {selectedCourse && (
          <LessonManagement
            open={isLessonDialogOpen}
            onClose={closeLessonDialog}
            course={selectedCourse}
          />
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboard;