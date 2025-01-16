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
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete, Search, Add, ExpandLess, Edit } from "@mui/icons-material";
import {
  getAdminCourses,
  addAdminCourse,
  removeAdminCourse,
  updateCourseVisibility,
  updateAdminCourse,
} from "../../services/api";
import LessonManagement from "./LessonManagement";
import CourseVisibilityManager from "./CourseVisibilityManager";
import CourseManager from "./CourseManager";
import ConfirmationDialog from "../ConfirmationDialog";

// Styles object
const styles = {
  mainContainer: {
    pt: 3,
    pb: 3,
    px: { xs: 2, sm: 3 },
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
      "& fieldset": { borderColor: "#14213d" },
      "&:hover fieldset": { borderColor: "#fca311" },
      "&.Mui-focused fieldset": { borderColor: "#14213d" },
    },
  },
  button: {
    backgroundColor: "#14213d",
    color: "white",
    "&:hover": { backgroundColor: "#fca311" },
  },
  tableHeader: {
    backgroundColor: "#14213d",
    color: "white",
    fontWeight: "bold",
  },
  tableRow: {
    "& .MuiTableCell-root": {
      backgroundColor: "#ffffff",
    },
    "&:hover .MuiTableCell-root": {
      backgroundColor: "#f5f5f5",
    },
  },
  textField: {
    "& .MuiInputBase-input": {
      overflow: "hidden",
      textOverflow: "ellipsis",
      overflowWrap: "break-word",
    },
  },
};

// Form validation component
const CourseForm = ({ onSubmit, onCancel }) => {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    duration: "",
    level: "Beginner",
    prerequisites: "",
  });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    const validations = {
      title: (value) =>
        !value.trim() || value.length > 35
          ? "Title must be between 1-35 characters"
          : "",
      description: (value) =>
        !value.trim() || value.length > 250
          ? "Description must be between 1-250 characters"
          : "",
      duration: (value) => {
        const pattern = /^\d+\s+(week|weeks|month|months)$/i;
        return !pattern.test(value)
          ? "Must be in format: '4 weeks' or '2 months'"
          : "";
      },
      prerequisites: (value) =>
        value.length > 50 ? "Must be less than 50 characters" : "",
    };
    return validations[name] ? validations[name](value) : "";
  };

  const handleChange = (field, value) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const formatDuration = (input) => {
    let formatted = input.trim().replace(/\s+/g, " ");
    const pattern = /^(\d{1,2})\s*(week|weeks|month|months)?$/i;
    const match = formatted.match(pattern);

    if (match) {
      const number = match[1];
      let unit = match[2]?.toLowerCase() || "";

      if (unit.startsWith("week")) {
        unit = number === "1" ? "week" : "weeks";
      } else if (unit.startsWith("month")) {
        unit = number === "1" ? "month" : "months";
      }

      if (unit) {
        formatted = `${number} ${unit}`;
      }
    }
    return formatted;
  };

  const handleSubmit = () => {
    const newErrors = {};
    Object.keys(course).forEach((key) => {
      const error = validateField(key, course[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length === 0) {
      // Format the course data before submission
      const formattedCourse = {
        ...course,
        prerequisites: course.prerequisites.trim() || "None",
        duration: formatDuration(course.duration),
      };
      onSubmit(formattedCourse);
      setCourse({
        title: "",
        description: "",
        duration: "",
        level: "Beginner",
        prerequisites: "",
      });
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
      <Typography variant="h6" sx={{ mb: 2, color: "#14213d" }}>
        Add New Course
      </Typography>
      <TextField
        label="Course Title"
        fullWidth
        value={course.title}
        onChange={(e) => handleChange("title", e.target.value)}
        error={!!errors.title}
        helperText={errors.title || `${course.title.length}/35 characters`}
        inputProps={{ maxLength: 35 }}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Description"
        fullWidth
        multiline
        rows={4}
        value={course.description}
        onChange={(e) => handleChange("description", e.target.value)}
        error={!!errors.description}
        helperText={
          errors.description || `${course.description.length}/250 characters`
        }
        inputProps={{ maxLength: 250 }}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Duration"
          fullWidth
          value={course.duration}
          onChange={(e) => {
            const value = formatDuration(e.target.value);
            handleChange("duration", value);
          }}
          error={!!errors.duration}
          helperText={errors.duration || "Format: 1-52 weeks or 1-12 months"}
          inputProps={{ maxLength: 20 }}
          sx={styles.textField}
        />
        <TextField
          select
          label="Level"
          fullWidth
          value={course.level}
          onChange={(e) => handleChange("level", e.target.value)}
        >
          {["Beginner", "Intermediate", "Advanced"].map((level) => (
            <MenuItem key={level} value={level}>
              {level}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <TextField
        label="Prerequisites"
        fullWidth
        value={course.prerequisites}
        onChange={(e) => handleChange("prerequisites", e.target.value)}
        error={!!errors.prerequisites}
        helperText={
          errors.prerequisites ||
          `${course.prerequisites.length}/50 characters (leave empty for None)`
        }
        inputProps={{ maxLength: 50 }}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleSubmit} sx={styles.button}>
        Add Course
      </Button>
    </Paper>
  );
};

// Course table component
const CourseTable = ({
  courses,
  onManageLessons,
  onDelete,
  onEdit,
  onVisibilityChange,
  isMobile,
}) => (
  <Table size={isMobile ? "small" : "medium"}>
    <TableHead>
      <TableRow>
        <TableCell sx={styles.tableHeader}>Title</TableCell>
        <TableCell sx={styles.tableHeader}>Visibility</TableCell>
        <TableCell sx={styles.tableHeader}>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {courses.map((course) => (
        <TableRow key={course.course_id} sx={styles.tableRow}>
          <TableCell>{course.title}</TableCell>
          <TableCell>
            <CourseVisibilityManager
              isVisible={course.is_visible}
              visibilityStartDate={course.visibility_start_date}
              visibilityEndDate={course.visibility_end_date}
              onVisibilityChange={(data) =>
                onVisibilityChange(course.course_id, data)
              }
            />
          </TableCell>
          <TableCell>
            <Tooltip title="Manage Lessons" arrow>
              <Button
                variant="contained"
                onClick={() => onManageLessons(course)}
                sx={{ ...styles.button, mr: 1, mb: 1 }}
                size="small"
              >
                Lessons
              </Button>
            </Tooltip>
            <Tooltip title="Edit Course Information" arrow>
              <Button
                variant="contained"
                onClick={() => onEdit(course)}
                sx={{ ...styles.button, mr: 1, mb: 1 }}
                size="small"
                startIcon={<Edit />}
              >
                Edit
              </Button>
            </Tooltip>
            <Tooltip title="Delete Course" arrow>
              <IconButton
                onClick={() => onDelete(course.course_id)}
                sx={{ color: "red", mb: 1 }}
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
);

// Main component
const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    courseId: null,
  });
  const [error, setError] = useState({ open: false, message: "" });

  const fetchCourses = useCallback(async () => {
    try {
      const data = await getAdminCourses();
      setCourses(data);
    } catch (error) {
      setError({
        open: true,
        message: "Failed to fetch courses. Please try again later.",
      });
      setCourses([]);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "All" || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleAddCourse = async (courseData) => {
    try {
      await addAdminCourse(courseData);
      setShowAddForm(false);
      fetchCourses();
    } catch (error) {
      setError({
        open: true,
        message: "Failed to add course. Please try again later.",
      });
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await removeAdminCourse(courseId);
      fetchCourses();
    } catch (error) {
      setError({
        open: true,
        message: "Failed to delete course. Please try again later.",
      });
    }
  };

  const handleUpdateCourse = async (updatedCourseData) => {
    try {
      await updateAdminCourse(editingCourse.course_id, updatedCourseData);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      setError({
        open: true,
        message: "Failed to update course. Please try again later.",
      });
    }
  };

  const handleVisibilityChange = async (courseId, visibilityData) => {
    try {
      await updateCourseVisibility(courseId, visibilityData);
      fetchCourses();
    } catch (error) {
      setError({
        open: true,
        message: "Failed to update course visibility. Please try again later.",
      });
    }
  };

  const handleCloseError = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setError({ ...error, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={styles.mainContainer}>
        <Card sx={styles.card}>
          <CardHeader
            title={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ color: "#14213d", fontWeight: "bold" }}
                >
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
              <CourseForm
                onSubmit={handleAddCourse}
                onCancel={() => setShowAddForm(false)}
              />
            </Collapse>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <Tooltip title="Search courses by title" arrow>
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
              </Tooltip>

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
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TableContainer>
              {filteredCourses.length > 0 ? (
                <CourseTable
                  courses={filteredCourses.slice(
                    page * rowsPerPage,
                    (page + 1) * rowsPerPage
                  )}
                  onManageLessons={(course) => setSelectedCourse(course)}
                  onEdit={(course) => setEditingCourse(course)}
                  onDelete={(courseId) =>
                    setConfirmDialog({ open: true, courseId })
                  }
                  onVisibilityChange={handleVisibilityChange}
                  isMobile={isMobile}
                />
              ) : (
                <Box sx={{ py: 8, px: 2, textAlign: "center" }}>
                  <Typography variant="h6" sx={{ color: "text.secondary" }}>
                    {courses.length === 0
                      ? "No courses available"
                      : "No matching courses found"}
                  </Typography>
                </Box>
              )}
            </TableContainer>

            {filteredCourses.length > 0 && (
              <TablePagination
                component="div"
                count={filteredCourses.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  position: "sticky",
                  bottom: 0,
                  backgroundColor: "#fca311",
                  borderTop: "1px solid rgba(224, 224, 224, 1)",
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
          </CardContent>
        </Card>

        {selectedCourse && (
          <LessonManagement
            open={!!selectedCourse}
            onClose={() => setSelectedCourse(null)}
            course={selectedCourse}
          />
        )}

        {editingCourse && (
          <CourseManager
            open={!!editingCourse}
            onClose={() => setEditingCourse(null)}
            course={editingCourse}
            onSave={handleUpdateCourse}
          />
        )}

        <ConfirmationDialog
          open={confirmDialog.open}
          title="Delete Course"
          message="Are you sure you want to delete this course? This action cannot be undone."
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          onConfirm={() => {
            handleDeleteCourse(confirmDialog.courseId);
            setConfirmDialog({ open: false, courseId: null });
          }}
          confirmText="Delete"
          isDestructive={true}
        />

        <Snackbar
          open={error.open}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseError}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {error.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
