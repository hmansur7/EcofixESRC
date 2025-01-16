import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  List,
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
  Divider,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Download,
  Close as CloseIcon,
  Visibility,
  MoreHoriz as MoreHorizIcon,
} from "@mui/icons-material";
import {
  getLessonsForCourse,
  updateLessonProgress,
  getLessonResources,
  getResourcePreview,
  downloadResource,
} from "../services/api";

const PreviewContent = ({ resource }) => {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const blob = await getResourcePreview(resource.id);
        const blobUrl = URL.createObjectURL(blob);
        const fileExtension = resource.file.toLowerCase().split(".").pop();
        const mimeType = blob.type;

        if (isMobile) {
          window.open(blobUrl, '_blank');
          return;
        }
        
        if (fileExtension === "pdf" || mimeType === "application/pdf") {
          setContent(
            <iframe
              src={blobUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
              title={resource.title}
            />
          );
        } else if (
          fileExtension.match(/^(jpg|jpeg|png)$/) ||
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
        } else {
          setError(
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom color="error">
                Preview not available
              </Typography>
              <Typography>
                File type: {fileExtension.toUpperCase()}
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
          </Box>
        );
      }
    };

    if (resource) {
      loadPreview();
    }
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
  const [expanded, setExpanded] = useState(false);
  const descriptionRef = useRef(null);
  const [isMultiline, setIsMultiline] = useState(false);

  useEffect(() => {
    if (descriptionRef.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(descriptionRef.current).lineHeight
      );
      const height = descriptionRef.current.offsetHeight;
      setIsMultiline(height > lineHeight * 1.5);
    }
  }, [lesson.description]);

  const handleDownload = async (resource, event) => {
    event.stopPropagation();
    if (downloading === resource.id) return;

    setDownloading(resource.id);
    try {
      await downloadResource(resource.id, resource.title);
    } catch (error) {
      console.error("Error downloading resource:", error);
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

  const toggleDescription = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.12)" }}>
      <ListItemButton
        selected={selectedLesson?.lesson_id === lesson.lesson_id}
        onClick={() => onLessonSelect(lesson)}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          py: 2,
          pr: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, pr: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {lesson.title}
          </Typography>
          <Box sx={{ position: "relative", mt: 0.5 }}>
            <Typography
              ref={descriptionRef}
              component="div"
              variant="body2"
              sx={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxHeight: expanded ? "none" : "1.5em",
                lineHeight: "1.5em",
                transition: "max-height 0.2s ease-out",
              }}
            >
              {lesson.description}
            </Typography>
            {isMultiline && (
              <Button
                size="small"
                onClick={toggleDescription}
                startIcon={<MoreHorizIcon />}
                sx={{
                  minWidth: "auto",
                  padding: "2px 8px",
                  mt: 0.5,
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                {expanded ? "Show less" : "Show more"}
              </Button>
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Tooltip
            title={lesson.completed ? "Mark as incomplete" : "Mark as completed"}
            placement="top"
            arrow
          >
            <Checkbox
              checked={lesson.completed}
              onChange={(e) => {
                e.stopPropagation();
                onCompletionChange(lesson.lesson_id, e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              sx={{ p: 1 }}
            />
          </Tooltip>
          <IconButton size="small" onClick={fetchResources} sx={{ ml: -0.5 }}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </Box>
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
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                ".MuiTable-root": {
                  tableLayout: "fixed",
                },
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="40%">Title</TableCell>
                    <TableCell width="25%">Uploaded</TableCell>
                    <TableCell width="35%">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {resource.title}
                      </TableCell>
                      <TableCell>
                        {new Date(resource.uploaded_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Preview resource" placement="top" arrow>
                            <IconButton
                              onClick={() => onPreviewResource(resource)}
                              size="small"
                              sx={{
                                color: "#14213d",
                                border: "1px solid #14213d",
                                borderRadius: "4px",
                                p: "4px",
                                "&:hover": {
                                  borderColor: "#fca311",
                                  backgroundColor: "rgba(252, 163, 17, 0.04)",
                                },
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download resource" placement="top" arrow>
                            <span>
                              <IconButton
                                onClick={(e) => handleDownload(resource, e)}
                                disabled={downloading === resource.id}
                                size="small"
                                sx={{
                                  backgroundColor: "#14213d",
                                  color: "white",
                                  borderRadius: "4px",
                                  p: "4px",
                                  "&:hover": {
                                    backgroundColor: "#fca311",
                                  },
                                  "&.Mui-disabled": {
                                    backgroundColor: "rgba(0, 0, 0, 0.12)",
                                    color: "rgba(0, 0, 0, 0.26)",
                                  },
                                }}
                              >
                                {downloading === resource.id ? (
                                  <CircularProgress size={20} color="inherit" />
                                ) : (
                                  <Download fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
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
    </Box>
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
          const lessonsData = await getLessonsForCourse(courseId);
          const normalizedLessons = lessonsData.map((lesson) => ({
            ...lesson,
            completed: Boolean(lesson.completed),
          }));
          setLessons(normalizedLessons);
        } catch (error) {
          console.error("Error fetching lessons:", error.response?.data || error);
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

  const handlePreviewResource = (resource) => {
    if (isMobile) {
      const openPreviewInNewTab = async () => {
        try {
          const blob = await getResourcePreview(resource.id);
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        } catch (error) {
          console.error("Error opening preview:", error);
        }
      };
      openPreviewInNewTab();
    } else {
      setPreviewResource(resource);
      setSelectedLesson(null);
    }
  };

  const styles = {
    dialog: {
      "& .MuiDialog-paper": {
        maxWidth: "95vw",
        maxHeight: "90vh",
        width: isMobile ? "100%" : "1200px",
        margin: "16px",
        overflow: "hidden",
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

    if (selectedLesson) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 3,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                mb: 4,
              }}
            >
              {selectedLesson.description}
            </Typography>

            <Box
              sx={{
                mt: 4,
                p: 3,
                bgcolor: "rgba(20, 33, 61, 0.04)",
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#14213d",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <span role="img" aria-label="books">
                  📚
                </span>{" "}
                Available Resources
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click the dropdown arrow next to the lesson to view and access
                the lesson resources.
              </Typography>
            </Box>
          </Box>
        </Box>
      );
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
          Select a lesson to view details
        </Typography>
        <Typography variant="body2">
          Choose a lesson from the sidebar to view its description and resources
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
          Back
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
          p: 0,
          m: 0,
          minHeight: 64,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            flex: 1,
            px: 3,
            py: 2,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{
              color: "#14213d",
              fontWeight: "bold",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={courseTitle}
          >
            {courseTitle}
          </Typography>
        </Box>
        <IconButton
          edge="end"
          onClick={onClose}
          sx={{
            p: 2,
            borderRadius: 0,
            height: 64,
            width: 64,
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
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
    </Dialog>
  );
};

export default CourseViewDialog;