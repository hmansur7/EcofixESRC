import React, { useEffect, useRef } from "react";
import {
  TextField,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  Alert,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import { Description, CloudUpload, Delete, Add } from "@mui/icons-material";

const ALLOWED_FILE_TYPES = ["pdf", "docx", "pptx", "jpg", "jpeg", "png"];
const MAX_SINGLE_FILE_SIZE = 5 * 1024 * 1024;
const MAX_TITLE_LENGTH = 35;
const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024;

const LessonStepContent = ({
  activeStep,
  newLesson,
  errors,
  handleDescriptionChange,
  setNewLesson,
  handleResourceChange,
  handleRemoveResource,
  handleAddResource,
  getValidResources,
  setErrors,
}) => {
  const textFieldRef = useRef(null);

  useEffect(() => {
    let timeoutId;
    const observerCallback = (entries) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
      }, 0);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      try {
        observerCallback(entries);
      } catch (error) {
        if (error.message?.includes?.("ResizeObserver loop")) {
          return;
        }
        throw error;
      }
    });

    if (textFieldRef.current) {
      try {
        resizeObserver.observe(textFieldRef.current);
      } catch (error) {
        console.warn("Failed to observe element:", error);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      try {
        resizeObserver.disconnect();
      } catch (error) {
        console.warn("Failed to disconnect observer:", error);
      }
    };
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Title is required";
        if (value.length > 35) return "Title must not exceed 35 characters";
        return "";
      case "order":
        if (!value) return "Valid order number is required";
        const orderNum = parseInt(value);
        if (isNaN(orderNum)) return "Order must be a number";
        if (orderNum < 1) return "Order must be positive";
        return "";
      case "description":
        if (!value.trim()) return "Description is required";
        if (value.length > 250)
          return "Description must not exceed 250 characters";
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (field, value) => {
    setNewLesson((prev) => ({ ...prev, [field]: value }));

    const error = validateField(field, value);
    if (!error) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const calculateTotalFileSize = (resources, currentIndex, newFile) => {
    return resources.reduce((total, resource, index) => {
      if (index === currentIndex) {
        return total + (newFile ? newFile.size : 0);
      }
      return total + (resource.file ? resource.file.size : 0);
    }, 0);
  };

  const validateFile = (file, resourceIndex) => {
    if (!file) return "";

    if (file.size > MAX_SINGLE_FILE_SIZE) {
      return `File size exceeds ${MAX_SINGLE_FILE_SIZE / 1024 / 1024}MB limit`;
    }

    const totalSize = calculateTotalFileSize(
      newLesson.resources,
      resourceIndex,
      file
    );
    if (totalSize > MAX_TOTAL_FILE_SIZE) {
      return `Total file size exceeds ${
        MAX_TOTAL_FILE_SIZE / 1024 / 1024
      }MB limit`;
    }

    const extension = file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(extension)) {
      return `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(
        ", "
      )}`;
    }

    return "";
  };

  const validateResourceTitle = (title) => {
    if (!title.trim()) {
      return "Title is required";
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return `Title must not exceed ${MAX_TITLE_LENGTH} characters`;
    }
    return "";
  };

  const handleFileChange = (index, file) => {
    const fileError = validateFile(file);
    const newResourceErrors = [...errors.resources];
    newResourceErrors[index] = fileError;
    setErrors((prev) => ({
      ...prev,
      resources: newResourceErrors,
    }));

    if (!fileError) {
      handleResourceChange(index, "file", file);
    }
  };

  const handleResourceTitleChange = (index, title) => {
    const titleError = validateResourceTitle(title);
    handleResourceChange(index, "title", title);
    const newResourceErrors = [...errors.resources];
    if (titleError) {
      newResourceErrors[index] = titleError; 
    } else {
      newResourceErrors[index] = ""; 
    }
    setErrors((prev) => ({
      ...prev,
      resources: newResourceErrors,
    }));
  };

  const renderBasicDetails = () => (
    <Card elevation={0} sx={{ p: 2, bgcolor: "background.default" }}>
      <CardContent>
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: "column" }}>
          <TextField
            label="Lesson Title"
            value={newLesson.title}
            onChange={(e) =>
              handleFieldChange("title", e.target.value, setErrors)
            }
            error={Boolean(errors.title)}
            helperText={
              errors.title || `${newLesson.title.length}/35 characters`
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Description />
                </InputAdornment>
              ),
            }}
            sx={{ width: "100%" }}
            inputProps={{ maxLength: 35 }}
          />

          <TextField
            label="Order"
            type="number"
            value={newLesson.order}
            onChange={(e) =>
              handleFieldChange("order", e.target.value, setErrors)
            }
            error={Boolean(errors.order)}
            helperText={errors.order || "Must be positive"}
            sx={{ width: "150px" }}
          />

          <TextField
            label="Description"
            value={newLesson.description}
            onChange={(e) => {
              handleDescriptionChange(e);
              if (!e.target.value.trim() || e.target.value.length <= 250) {
                setErrors((prev) => ({ ...prev, description: "" }));
              }
            }}
            error={Boolean(errors.description)}
            helperText={
              errors.description ||
              `${newLesson.description.length}/250 characters`
            }
            multiline
            rows={4}
            fullWidth
            inputProps={{
              maxLength: 250,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderRadius: "4px",
                },
                "&.Mui-focused fieldset": {
                  borderWidth: "2px",
                },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  const renderResources = () => (
    <Card
      elevation={0}
      sx={{
        p: 2,
        bgcolor: "background.default",
        overflow: "auto",
      }}
    >
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Alert 
            severity="info" 
            variant="outlined"
            sx={{ 
              mb: 2,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <Typography component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <span>• Supported file types: {ALLOWED_FILE_TYPES.join(", ")}</span>
              <span>• Maximum file size per file: {MAX_SINGLE_FILE_SIZE / 1024 / 1024}MB</span>
              <span>• Maximum total file size: {MAX_TOTAL_FILE_SIZE / 1024 / 1024}MB</span>
              <span>• Maximum title length: {MAX_TITLE_LENGTH} characters</span>
            </Typography>
          </Alert>
  
          {newLesson.resources.length > 0 && (
            <Alert 
              severity="info"
              variant="outlined" 
              sx={{ mb: 2 }}
            >
              Total size: {(calculateTotalFileSize(newLesson.resources, -1, null) / 1024 / 1024).toFixed(2)}MB 
              / {MAX_TOTAL_FILE_SIZE / 1024 / 1024}MB
            </Alert>
          )}
  
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {newLesson.resources.map((resource, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: "grey.50",
                    border: '1px solid',
                    borderColor: errors.resources[index] ? 'error.main' : 'grey.200',
                    borderRadius: 1,
                  }}
                >
                  <Stack spacing={2}>
                    <TextField
                      label="Resource Title"
                      value={resource.title}
                      onChange={(e) => handleResourceTitleChange(index, e.target.value)}
                      error={Boolean(errors.resources[index])}
                      helperText={errors.resources[index] || `Max ${MAX_TITLE_LENGTH} characters`}
                      fullWidth
                      size="small"
                      inputProps={{ maxLength: MAX_TITLE_LENGTH }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          '&.Mui-focused fieldset': {
                            borderColor: '#14213d',
                          },
                        },
                      }}
                    />
  
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 1,
                      flexWrap: "wrap" 
                    }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                        size="small"
                        sx={{
                          borderColor: '#14213d',
                          color: '#14213d',
                          backgroundColor: 'white',
                          '&:hover': {
                            borderColor: '#fca311',
                            backgroundColor: 'white',
                          },
                        }}
                      >
                        Upload
                        <input
                          type="file"
                          hidden
                          accept={ALLOWED_FILE_TYPES.map((ext) => `.${ext}`).join(",")}
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleFileChange(index, e.target.files[0]);
                            }
                          }}
                        />
                      </Button>
  
                      {resource.file && (
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Chip
                            label={`${resource.file.name} (${(
                              resource.file.size / 1024 / 1024
                            ).toFixed(2)}MB)`}
                            onDelete={() => handleResourceChange(index, "file", null)}
                            sx={{
                              maxWidth: '100%',
                              '.MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }
                            }}
                          />
                        </Box>
                      )}
  
                      <Tooltip title="Remove Resource" arrow>
                        <IconButton
                          onClick={() => handleRemoveResource(index)}
                          color="error"
                          size="small"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'error.light',
                              color: 'white',
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
  
          <Button
            startIcon={<Add />}
            onClick={handleAddResource}
            variant="outlined"
            sx={{
              borderColor: '#14213d',
              color: '#14213d',
              '&:hover': {
                borderColor: '#fca311',
                backgroundColor: 'rgba(252, 163, 17, 0.04)',
              },
            }}
          >
            Add Resource
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
  

  const renderReview = () => {
    const validResources = getValidResources();
    return (
      <Card elevation={0} sx={{ p: 2, bgcolor: "background.default" }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Lesson Details
            </Typography>
            <Box sx={{ display: "grid", gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Title
                </Typography>
                <Typography>{newLesson.title}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Order
                </Typography>
                <Typography>{newLesson.order}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography
                  sx={{
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                    hyphens: "auto",
                    maxWidth: "100%",
                    "& span": {
                      display: "inline-block",
                      maxWidth: "500px",
                    },
                  }}
                >
                  <span>{newLesson.description}</span>
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Resources ({validResources.length})
                </Typography>
                {validResources.length > 0 ? (
                  validResources.map((resource, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <Description fontSize="small" />
                      <Typography>{resource.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({resource.file.name} -{" "}
                        {(resource.file.size / 1024 / 1024).toFixed(2)}MB)
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No resources added
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  switch (activeStep) {
    case 0:
      return renderBasicDetails();
    case 1:
      return renderResources();
    case 2:
      return renderReview();
    default:
      return null;
  }
};

export default LessonStepContent;
