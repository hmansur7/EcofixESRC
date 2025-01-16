import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Divider,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowBack,
  ArrowForward,
  Check,
} from "@mui/icons-material";
import {
  getLessonsForCourse,
  addAdminLesson,
  removeAdminLesson,
  addLessonResource,
} from "../../services/api";
import LessonStepContent from "./LessonStepContent";
import LessonTable from "./LessonTable";
import DeleteConfirmationDialog from "../DeleteConfirmationDialog";
import SearchAndSort from "./SearchAndSort";

const LessonManagement = ({ open, onClose, course }) => {
  const styles = {
    dialog: {
      "& .MuiDialog-paper": {
        minHeight: "80vh",
        maxHeight: "90vh",
        width: "100%",
        maxWidth: "900px",
        overflow: "hidden",
      },
    },
    dialogTitle: {
      bgcolor: "#14213d",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      p: 2,
    },
    card: {
      bgcolor: "#f5f5f5",
      borderRadius: 2,
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      height: "100%",
    },
    searchField: {
      bgcolor: "white",
      borderRadius: 1,
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
      bgcolor: "#14213d",
      color: "white",
      "&:hover": {
        bgcolor: "#fca311",
      },
    },
    tableHeader: {
      bgcolor: "#14213d",
      color: "white",
      fontWeight: "bold",
    },
    tableWrapper: {
      maxHeight: "40vh",
      overflow: "auto",
      scrollbarWidth: "thin",
      "&::-webkit-scrollbar": {
        width: "6px",
        height: "6px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#f1f1f1",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#888",
        borderRadius: "3px",
      },
    },
    tableContainer: {
      position: "relative",
      maxHeight: "none",
    },
  };

  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeStep, setActiveStep] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [error, setError] = useState({ open: false, message: "" });

  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    order: "",
    resources: [],
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    order: "",
    resources: [],
    submit: "",
  });

  const steps = ["Lesson Details", "Resources", "Review"];

  const handleCloseError = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setError({ ...error, open: false });
  };


  const fetchLessons = async (courseId) => {
    try {
      const lessonsData = await getLessonsForCourse(courseId);
      setLessons(lessonsData);
      setFilteredLessons(lessonsData);
    } catch (error) {
      setError({
        open: true,
        message: "Failed to fetch lessons",
      });
      setLessons([]);
      setFilteredLessons([]);
    }
  };

  useEffect(() => {
    if (course && open) {
      fetchLessons(course.course_id);
    }
  }, [course, open]);

  const filterLessons = useCallback(() => {
    if (!lessons) return;
  
    let filtered = [...lessons];
  
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  
    filtered.sort((a, b) => {
      const orderA = Number(a.order);
      const orderB = Number(b.order);
      
      return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
    });
  
    setFilteredLessons(filtered);
  }, [lessons, searchTerm, sortOrder]);

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
    setErrors((prev) => ({
      ...prev,
      resources: [...prev.resources, ""],
    }));
  };

  const handleRemoveResource = (index) => {
    const updatedResources = newLesson.resources.filter((_, i) => i !== index);
    setNewLesson({ ...newLesson, resources: updatedResources });

    const newResourceErrors = [...errors.resources];
    newResourceErrors.splice(index, 1);
    setErrors({ ...errors, resources: newResourceErrors });
  };

  const handleResourceChange = (index, field, value) => {
    const updatedResources = newLesson.resources.map((resource, i) => {
      if (i === index) {
        return { ...resource, [field]: value };
      }
      return resource;
    });
    setNewLesson({ ...newLesson, resources: updatedResources });

    if (errors.resources[index]) {
      const newResourceErrors = [...errors.resources];
      newResourceErrors[index] = "";
      setErrors({ ...errors, resources: newResourceErrors });
    }
  };

  const resetForm = () => {
    setNewLesson({
      title: "",
      description: "",
      order: "",
      resources: [],
    });
    setErrors({
      title: "",
      description: "",
      order: "",
      resources: [],
      submit: "",
    });
    setActiveStep(0);
  };

  const validateCurrentStep = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (activeStep === 0) {
      if (newLesson.title.length > 35) {
        newErrors.title = "Title must not exceed 35 characters";
        isValid = false;
      } else if (!newLesson.title.trim()) {
        newErrors.title = "Title is required";
        isValid = false;
      }

      if (newLesson.description.length > 250) {
        newErrors.description = "Description must not exceed 250 characters";
        isValid = false;
      } else if (!newLesson.description.trim()) {
        newErrors.description = "Description is required";
        isValid = false;
      }

      const orderNum = parseInt(newLesson.order);
      if (!newLesson.order || isNaN(orderNum)) {
        newErrors.order = "Valid order number is required";
        isValid = false;
      } else if (orderNum < 1) {
        newErrors.order = "Order must be positive";
        isValid = false;
      }
    } else if (activeStep === 1) {
      const resourceErrors = newLesson.resources.map((resource) => {
        if (!resource.title && !resource.file) return "";
        if (!resource.title && resource.file)
          return "Title is required when file is uploaded";
        if (resource.title && !resource.file)
          return "File is required when title is provided";
        return "";
      });

      if (resourceErrors.some((error) => error !== "")) {
        newErrors.resources = resourceErrors;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const getValidResources = () => {
    return newLesson.resources.filter(
      (resource) => resource.title?.trim() && resource.file
    );
  };

  const cleanupResources = () => {
    const cleanedResources = newLesson.resources.filter(
      (resource) => resource.title || resource.file
    );
    setNewLesson((prev) => ({ ...prev, resources: cleanedResources }));
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (activeStep === 1) {
        cleanupResources();
      }
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBackStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleAddLesson = async () => {
    try {
      const validResources = getValidResources();

      const lessonData = {
        title: newLesson.title.trim(),
        description: newLesson.description.trim(),
        order: parseInt(newLesson.order),
        course: course.course_id,
      };

      const lessonResponse = await addAdminLesson(lessonData);

      if (validResources.length > 0) {
        const formData = new FormData();
        formData.append("lesson", lessonResponse.lesson_id);

        validResources.forEach((resource) => {
          formData.append("titles", resource.title.trim());
          formData.append("resources", resource.file);
        });

        await addLessonResource(formData);
      }

      resetForm();
      fetchLessons(course.course_id);
    } catch (error) {
      setError({
        open: true,
        message: "Failed to add lesson. Please try again.",
      });
    }
  };

  const handleDeleteConfirmation = (lessonId) => {
    setDeleteConfirmation(lessonId);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation) {
      try {
        await removeAdminLesson(deleteConfirmation);
        setDeleteConfirmation(null);
        fetchLessons(course.course_id);
      } catch (error) {
        setError({
          open: true,
          message: "Failed to delete lesson. Please try again.",
        });
      }
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  const handleDescriptionChange = (e) => {
    let value = e.target.value;

    if (value.length > 250) {
      value = value.slice(0, 250);
    }

    value = value
      .split("\n")
      .map((line) => {
        if (line.length > 80) {
          const words = line.split(" ");
          let newLine = "";
          let currentLength = 0;

          words.forEach((word) => {
            if (currentLength + word.length > 80) {
              newLine += "\n" + word + " ";
              currentLength = word.length + 1;
            } else {
              newLine += word + " ";
              currentLength += word.length + 1;
            }
          });

          return newLine.trim();
        }
        return line;
      })
      .join("\n");

    setNewLesson({ ...newLesson, description: value });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={styles.dialog}
    >
      <DialogTitle sx={styles.dialogTitle}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Manage Lessons
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <SearchAndSort
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortOrder={sortOrder}
            toggleSortOrder={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            styles={styles}
          />

          <Box sx={styles.tableWrapper}>
            <LessonTable
              filteredLessons={filteredLessons}
              page={page}
              rowsPerPage={rowsPerPage}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              handleDeleteConfirmation={handleDeleteConfirmation}
              expandedDescriptions={expandedDescriptions}
              setExpandedDescriptions={setExpandedDescriptions}
              styles={styles}
              truncateText={truncateText}
              lessons={lessons}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h6"
            sx={{ mb: 3, color: "#14213d", fontWeight: "bold" }}
          >
            Add New Lesson
          </Typography>

          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 4,
              "& .MuiStepLabel-root .Mui-completed": {
                color: "#14213d",
              },
              "& .MuiStepLabel-root .Mui-active": {
                color: "#fca311",
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Card sx={{ ...styles.card, mb: 3 }}>
            <CardContent>
              <LessonStepContent
                activeStep={activeStep}
                newLesson={newLesson}
                errors={errors}
                setErrors={setErrors}
                handleDescriptionChange={handleDescriptionChange}
                setNewLesson={setNewLesson}
                handleResourceChange={handleResourceChange}
                handleRemoveResource={handleRemoveResource}
                handleAddResource={handleAddResource}
                getValidResources={getValidResources}
              />
            </CardContent>
          </Card>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              onClick={handleBackStep}
              disabled={activeStep === 0}
              startIcon={<ArrowBack />}
              sx={{
                color: "#14213d",
                "&:hover": {
                  bgcolor: "rgba(20, 33, 61, 0.04)",
                },
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={
                activeStep === steps.length - 1
                  ? handleAddLesson
                  : handleNextStep
              }
              endIcon={
                activeStep === steps.length - 1 ? <Check /> : <ArrowForward />
              }
              sx={styles.button}
            >
              {activeStep === steps.length - 1 ? "Create Lesson" : "Next"}
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DeleteConfirmationDialog
        open={Boolean(deleteConfirmation)}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleConfirmDelete}
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
    </Dialog>
  );
};

export default LessonManagement;
