import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  Divider,
  Box,
  TablePagination,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Delete, Add, Search } from "@mui/icons-material";
import {
  getLessonsForCourse,
  addAdminLesson,
  removeAdminLesson,
  addLessonResource,
} from "../services/api";

const LessonManagement = ({ open, onClose, course }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    order: "",
    resources: [],
  });

  useEffect(() => {
    if (course && open) {
      fetchLessons(course.course_id);
    }
  }, [course, open]);

  const fetchLessons = async (courseId) => {
    try {
      const lessonsData = await getLessonsForCourse(courseId);
      setLessons(lessonsData);
      setFilteredLessons(lessonsData);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setLessons([]);
      setFilteredLessons([]);
    }
  };

  const filterLessons = useCallback(() => {
    let filtered = [...lessons];
    
    if (searchTerm) {
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLessons(filtered);
    setPage(0);
  }, [lessons, searchTerm]);

  useEffect(() => {
    filterLessons();
  }, [filterLessons]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddResource = () => {
    setNewLesson({
      ...newLesson,
      resources: [...newLesson.resources, { title: "", file: null }],
    });
  };

  const handleRemoveResource = (index) => {
    const updatedResources = newLesson.resources.filter((_, i) => i !== index);
    setNewLesson({ ...newLesson, resources: updatedResources });
  };

  const handleResourceChange = (index, field, value) => {
    const updatedResources = newLesson.resources.map((resource, i) => {
      if (i === index) {
        return { ...resource, [field]: value };
      }
      return resource;
    });
    setNewLesson({ ...newLesson, resources: updatedResources });
  };

  const handleAddLesson = async () => {
    if (!newLesson.title || !newLesson.description || !newLesson.order) {
      alert("Please fill in all required lesson fields.");
      return;
    }

    try {
      const lessonData = {
        title: newLesson.title,
        description: newLesson.description,
        order: newLesson.order,
        course: course.course_id,
      };

      const lessonResponse = await addAdminLesson(lessonData);

      if (newLesson.resources.length > 0) {
        const formData = new FormData();
        formData.append("lesson", lessonResponse.lesson_id);

        newLesson.resources.forEach((resource) => {
          if (resource.file && resource.title) {
            formData.append("titles", resource.title);
            formData.append("resources", resource.file);
          }
        });

        await addLessonResource(formData);
      }

      alert("Lesson and resources added successfully!");

      setNewLesson({
        title: "",
        description: "",
        content: "",
        order: "",
        resources: [],
      });
      fetchLessons(course.course_id);
    } catch (error) {
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert("Failed to add lesson or upload resources. Check console for details.");
    }
  };

  const handleRemoveLesson = async (lessonId) => {
    try {
      await removeAdminLesson(lessonId);
      fetchLessons(course.course_id);
    } catch (error) {
      console.error("Error removing lesson:", error);
    }
  };

  const styles = {
    searchField: {
      backgroundColor: "white",
      borderRadius: "4px",
      width: isMobile ? "100%" : 300,
      mb: 2,
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
    table: {
      "& .MuiTableCell-head": {
        backgroundColor: "#14213d",
        color: "white",
        fontWeight: "bold",
      },
    },
    addButton: {
      backgroundColor: "#14213d",
      color: "white",
      "&:hover": {
        backgroundColor: "#fca311",
      },
    },
    closeButton: {
      color: "#14213d",
    },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ color: "#14213d", fontWeight: "bold" }}>
        Manage Lessons
      </DialogTitle>
      <DialogContent>
        {course && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lessons for {course.title}
            </Typography>

            <TextField
              placeholder="Search lessons..."
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

            <TableContainer component={Paper}>
              <Table sx={styles.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLessons
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((lesson) => (
                      <TableRow key={lesson.lesson_id}>
                        <TableCell>{lesson.title}</TableCell>
                        <TableCell>{lesson.description}</TableCell>
                        <TableCell>{lesson.order}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleRemoveLesson(lesson.lesson_id)}
                            sx={{ color: "red" }}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredLessons.length > 0 ? (
              <TablePagination
                component="div"
                count={filteredLessons.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                sx={styles.pagination}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 4,
                  px: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 1,
                  mt: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1 }}>
                  No lessons found
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                  {lessons.length === 0 
                    ? "Add your first lesson using the form below."
                    : "Try adjusting your search criteria."}
                </Typography>
              </Box>
            )}

            <Divider sx={{ mt: 3, mb: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Add New Lesson</Typography>

            <TextField
              label="Lesson Title"
              fullWidth
              value={newLesson.title}
              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Lesson Description"
              fullWidth
              value={newLesson.description}
              onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Order"
              fullWidth
              type="number"
              value={newLesson.order}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value < 1) return;
                setNewLesson({ ...newLesson, order: value });
              }}
              inputProps={{ min: "1" }}
              helperText="Order must be a positive number"
              sx={{ mb: 2 }}
            />

            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Lesson Resources</Typography>
              {newLesson.resources.map((resource, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <TextField
                    label="Resource Title"
                    value={resource.title}
                    onChange={(e) => handleResourceChange(index, "title", e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <input
                    type="file"
                    onChange={(e) => handleResourceChange(index, "file", e.target.files[0])}
                    style={{ flex: 1 }}
                  />
                  <IconButton
                    onClick={() => handleRemoveResource(index)}
                    sx={{ color: "red" }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={handleAddResource}
                variant="outlined"
                sx={{ ...styles.addButton, mt: 1 }}
              >
                Add Resource
              </Button>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleAddLesson}
                sx={styles.addButton}
              >
                Add Lesson
              </Button>
              <Button
                onClick={onClose}
                sx={styles.closeButton}
              >
                Close
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LessonManagement;