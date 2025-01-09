import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Card as MobileCard,
  CardActions,
  TablePagination,
  Container,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { getEnrolledCourses } from "../services/api";
import ViewCourseModal from "./ViewCourseModal";

const LearningDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getEnrolledCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCourse(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const styles = {
    header: {
      color: "#14213d",
      fontWeight: "bold",
      fontSize: isMobile ? "1.5rem" : "2rem",
    },
    card: {
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      padding: isMobile ? "0.5rem" : "1rem",
    },
    tableHeader: {
      backgroundColor: "#14213d",
      color: "white",
      fontWeight: "bold",
      padding: isMobile ? "8px" : "16px",
    },
    searchField: {
      marginBottom: 2,
      backgroundColor: "white",
      borderRadius: "4px",
      width: isMobile ? "100%" : "auto",
      marginTop: isMobile ? 2 : 0,
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
    mobileCard: {
      backgroundColor: "#f5f5f5",
      marginBottom: "1rem",
    },
    mobileCardContent: {
      padding: "1rem",
    },
    mobileCardActions: {
      justifyContent: "flex-end",
      padding: "0.5rem 1rem",
    },
    tablePagination: {
      ".MuiTablePagination-selectLabel": {
        margin: 0,
        fontSize: { xs: "0.8rem", sm: "0.875rem" },
      },
      ".MuiTablePagination-displayedRows": {
        margin: 0,
        fontSize: { xs: "0.8rem", sm: "0.875rem" },
      },
      ".MuiTablePagination-select": {
        fontSize: { xs: "0.8rem", sm: "0.875rem" },
      },
    },
  };

  const CourseCard = ({ course }) => (
    <MobileCard sx={styles.mobileCard}>
      <CardContent sx={styles.mobileCardContent}>
        <Typography variant="h6" gutterBottom>
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {course.description}
        </Typography>
      </CardContent>
      <CardActions sx={styles.mobileCardActions}>
        <Button
          variant="contained"
          onClick={() => handleViewCourse(course)}
          sx={{
            backgroundColor: "#14213d",
            color: "white",
            "&:hover": { backgroundColor: "#fca311" },
          }}
        >
          View Course
        </Button>
      </CardActions>
    </MobileCard>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ padding: isMobile ? 2 : 3 }}>
        <Card sx={styles.card}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "stretch" : "center",
                mb: 2,
              }}
            >
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  ...styles.header,
                  mb: isMobile ? 1 : 0,
                }}
              >
                Your Courses
              </Typography>
              <TextField
                placeholder="Search courses..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
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

            {isMobile ? (
              <Box>
                {filteredCourses.length > 0 ? (
                  <>
                    {filteredCourses
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((course) => (
                        <CourseCard key={course.course_id} course={course} />
                      ))}
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={filteredCourses.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      sx={{
                        backgroundColor: "#f5f5f5",
                        mt: 2,
                        borderRadius: "4px",
                        ".MuiTablePagination-select": {
                          backgroundColor: "white",
                          borderRadius: "4px",
                        },
                        ".MuiTablePagination-selectIcon": {
                          color: "#14213d",
                        },
                        "& .MuiButtonBase-root": {
                          color: "#14213d",
                          "&:hover": {
                            color: "#fca311",
                          },
                          "&.Mui-disabled": {
                            color: "rgba(0, 0, 0, 0.26)",
                          },
                        },
                        ...styles.tablePagination,
                      }}
                    />
                  </>
                ) : (
                  <Typography align="center" sx={{ mt: 2 }}>
                    No courses found matching your search.
                  </Typography>
                )}
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={styles.tableHeader}>Course Title</TableCell>
                      <TableCell sx={styles.tableHeader} align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCourses.length > 0 ? (
                      filteredCourses
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((course) => (
                          <TableRow key={course.course_id}>
                            <TableCell>{course.title}</TableCell>
                            <TableCell align="right">
                              <Button
                                variant="contained"
                                onClick={() => handleViewCourse(course)}
                                sx={{
                                  backgroundColor: "#14213d",
                                  color: "white",
                                  "&:hover": { backgroundColor: "#fca311" },
                                }}
                              >
                                View Course
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No courses found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {selectedCourse && (
          <ViewCourseModal
            open={modalOpen}
            onClose={closeModal}
            courseId={selectedCourse.course_id}
            courseTitle={selectedCourse.title}
          />
        )}
      </Box>
    </Container>
  );
};

export default LearningDashboard;
