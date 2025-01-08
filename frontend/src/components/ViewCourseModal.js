import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  PlayCircle,
  Download,
  Close as CloseIcon,
  OndemandVideo,
  Visibility,
} from "@mui/icons-material";
import {
  getLessonsForCourse,
  updateLessonProgress,
  getLessonResources,
  getResourcePreview,
  downloadResource,
} from "../services/api";
import API from "../services/api";

const PreviewContent = ({ resource }) => {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const fileExtension = resource.file.toLowerCase().split(".").pop();

        if (fileExtension === "mp4") {
          const token = localStorage.getItem("authToken");
          console.log("Token being used:", token); // Debug log
          const streamUrl = `${API.defaults.baseURL}resources/${resource.id}/stream/`;
          const urlWithAuth = `${streamUrl}?auth=${token}`;
          console.log("Full URL:", urlWithAuth); // Debug log

          setContent(
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "#000",
              }}
            >
              <video
                ref={videoRef}
                controls
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                }}
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              >
                <source src={urlWithAuth} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
          );
          return;
        }

        const blob = await getResourcePreview(resource.id);
        const blobUrl = URL.createObjectURL(blob);
        const mimeType = blob.type;

        if (fileExtension === "pdf" || mimeType === "application/pdf") {
          setContent(
            <iframe
              src={blobUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
              title={resource.title}
            />
          );
        } else if (
          fileExtension.match(/^(jpg|jpeg|png|gif)$/) ||
          mimeType.startsWith("image/")
        ) {
          setContent(
            <img
              src={blobUrl}
              alt={resource.title}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          );
        } else if (
          fileExtension.match(/^(txt|md)$/) ||
          mimeType === "text/plain"
        ) {
          const text = await new Response(blob).text();
          setContent(
            <pre
              style={{
                padding: "1rem",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                maxWidth: "100%",
                overflow: "auto",
              }}
            >
              {text}
            </pre>
          );
        } else {
          setError(
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom color="error">
                Preview not available
              </Typography>
              <Typography>
                File type: {fileExtension.toUpperCase()}
                {mimeType && ` (${mimeType})`}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                You can download this file to view it.
              </Typography>
            </Box>
          );
        }
      } catch (err) {
        console.error("Preview error:", err);
        setError(
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" gutterBottom color="error">
              Failed to load preview
            </Typography>
            <Typography>
              {err.response?.status === 403
                ? "You don't have access to this resource"
                : err.response?.data?.detail || err.message}
            </Typography>
          </Box>
        );
      }
    };

    if (resource) {
      loadPreview();
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      }
    };
  }, [resource]);

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: 3,
        }}
      >
        {error}
      </Box>
    );
  }

  return (
    content || (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <LinearProgress sx={{ width: "50%" }} />
      </Box>
    )
  );
};

const LessonListItem = ({
  lesson,
  onLessonSelect,
  selectedLesson,
  onCompletionChange,
  onPreviewResource,
}) => {
  const [open, setOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (resource, event) => {
    event.stopPropagation();
    if (downloading === resource.id) return;

    setDownloading(resource.id);
    try {
      await downloadResource(resource.id, resource.title);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setDownloading(null);
    }
  };

  const fetchResources = async (e) => {
    e.stopPropagation();
    if (!open) {
      setLoading(true);
      try {
        const data = await getLessonResources(lesson.lesson_id);
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    }
    setOpen(!open);
  };

  return (
    <>
      <ListItemButton
        selected={selectedLesson?.lesson_id === lesson.lesson_id}
        onClick={() => onLessonSelect(lesson)}
      >
        <ListItemText primary={lesson.title} secondary={lesson.description} />
        <Checkbox
          checked={lesson.completed}
          onChange={(e) => {
            e.stopPropagation();
            onCompletionChange(lesson.lesson_id, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <IconButton size="small" onClick={fetchResources}>
          {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ pt: 1, fontWeight: "medium" }}
          >
            Resources
          </Typography>
          {loading ? (
            <Typography variant="body2">Loading resources...</Typography>
          ) : resources.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>{resource.title}</TableCell>
                      <TableCell>
                        {new Date(resource.uploaded_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            startIcon={<Visibility />}
                            onClick={() => onPreviewResource(resource)}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: "#14213d",
                              color: "#14213d",
                              "&:hover": {
                                borderColor: "#fca311",
                                backgroundColor: "rgba(252, 163, 17, 0.04)",
                              },
                            }}
                          >
                            Preview
                          </Button>
                          <Button
                            startIcon={<Download />}
                            onClick={(e) => handleDownload(resource, e)}
                            disabled={downloading === resource.id}
                            size="small"
                            variant="contained"
                            sx={{
                              backgroundColor: "#14213d",
                              "&:hover": { backgroundColor: "#fca311" },
                            }}
                          >
                            {downloading === resource.id
                              ? "Downloading..."
                              : "Download"}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2">No resources available</Typography>
          )}
        </Box>
      </Collapse>
    </>
  );
};

const CourseViewDialog = ({ courseId, courseTitle, open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [previewResource, setPreviewResource] = useState(null);

  useEffect(() => {
    if (courseId && open) {
      const fetchLessons = async () => {
        setLoading(true);
        try {
          console.log("Fetching lessons for course:", courseId);
          const lessonsData = await getLessonsForCourse(courseId);
          console.log("Received lessons data:", lessonsData);

          const normalizedLessons = lessonsData.map((lesson) => ({
            ...lesson,
            completed: Boolean(lesson.completed),
          }));
          console.log("Normalized lessons:", normalizedLessons);

          setLessons(normalizedLessons);
        } catch (error) {
          console.error(
            "Error fetching lessons:",
            error.response?.data || error
          );
          setLessons([]);
        } finally {
          setLoading(false);
        }
      };

      fetchLessons();
    }
  }, [courseId, open]);

  const handleLessonCompletion = async (lessonId, completed) => {
    try {
      await updateLessonProgress(lessonId, completed);
      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson.lesson_id === lessonId ? { ...lesson, completed } : lesson
        )
      );
    } catch (error) {
      console.error("Error updating lesson progress:", error);
    }
  };

  const handlePreviewResource = async (resource) => {
    try {
      // For now, just set the resource directly since we're not handling videos yet
      setPreviewResource(resource);
      setSelectedLesson(null);
    } catch (error) {
      console.error("Error loading preview:", error);
    }
  };

  const styles = {
    dialog: {
      "& .MuiDialog-paper": {
        maxWidth: "95vw",
        maxHeight: "90vh",
        width: isMobile ? "100%" : "1200px",
        margin: "16px",
      },
    },
    content: {
      display: "flex",
      padding: 0,
      height: isMobile ? "70vh" : "80vh",
    },
    sidebar: {
      width: isMobile ? "100%" : "400px",
      borderRight: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.grey[50],
      overflow: "auto",
    },
    main: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    contentArea: {
      flex: 1,
      bgcolor: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "auto",
    },
    contentTitle: {
      padding: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      color: "#14213d",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
  };

  const renderContent = () => {
    if (previewResource) {
      return <PreviewContent resource={previewResource} />;
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 3,
          color: "text.secondary",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Select a resource to preview
        </Typography>
        <Typography variant="body2">
          Click the preview button next to any resource to view its contents
        </Typography>
      </Box>
    );
  };

  const contentTitle = previewResource ? (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6">{previewResource.title}</Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          onClick={() => {
            setPreviewResource(null);
            if (selectedLesson) {
              setSelectedLesson(selectedLesson);
            }
          }}
          size="small"
          sx={{
            color: "#14213d",
            "&:hover": {
              backgroundColor: "rgba(20, 33, 61, 0.04)",
            },
          }}
        >
          Back to Lesson
        </Button>
      </Box>
    </Box>
  ) : selectedLesson ? (
    <Typography variant="h6">{selectedLesson.title}</Typography>
  ) : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      sx={styles.dialog}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" sx={{ color: "#14213d", fontWeight: "bold" }}>
          {courseTitle}
        </Typography>
        <IconButton edge="end" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={styles.content}>
        <Box sx={styles.sidebar}>
          {loading ? (
            <LinearProgress />
          ) : (
            <List disablePadding>
              {lessons.map((lesson) => (
                <LessonListItem
                  key={lesson.lesson_id}
                  lesson={lesson}
                  onLessonSelect={setSelectedLesson}
                  selectedLesson={selectedLesson}
                  onCompletionChange={handleLessonCompletion}
                  onPreviewResource={handlePreviewResource}
                />
              ))}
            </List>
          )}
        </Box>
        <Box sx={styles.main}>
          {contentTitle && <Box sx={styles.contentTitle}>{contentTitle}</Box>}
          <Box sx={styles.contentArea}>{renderContent()}</Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#14213d" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseViewDialog;
