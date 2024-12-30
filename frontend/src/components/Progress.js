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
  LinearProgress,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Container,
  TablePagination,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { getCourses, getCourseProgress } from "../services/api";

const ProgressDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [progressFilter, setProgressFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchProgressData = async () => {
    try {
      const coursesList = await getCourses();
      setCourses(coursesList);

      const progressMap = {};
      const progressPromises = coursesList.map(async (course) => {
        try {
          const progress = await getCourseProgress(course.course_id);
          progressMap[course.course_id] = progress.progress_percentage;
        } catch (error) {
          console.error(
            `Error fetching progress for course ${course.course_id}:`,
            error
          );
          progressMap[course.course_id] = 0; 
        }
      });

      await Promise.all(progressPromises);
      setProgressData(progressMap);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching progress data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const progress = progressData[course.course_id] || 0;

    let matchesProgress = true;
    switch (progressFilter) {
      case "notStarted":
        matchesProgress = progress === 0;
        break;
      case "inProgress":
        matchesProgress = progress > 0 && progress < 100;
        break;
      case "completed":
        matchesProgress = progress === 100;
        break;
      default:
        matchesProgress = true;
    }

    return matchesSearch && matchesProgress;
  });

  const styles = {
    container: {
      padding: {
        xs: 1,
        sm: 2,
        md: 3,
      },
    },
    header: {
      color: "#14213d",
      fontWeight: "bold",
      fontSize: {
        xs: "1.5rem",
        sm: "2rem",
        md: "2.25rem",
      },
      mb: { xs: 2, sm: 3 },
    },
    card: {
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      padding: { xs: "0.5rem", sm: "1rem" },
    },
    tableHeader: {
      backgroundColor: "#14213d",
      color: "white",
      fontWeight: "bold",
      padding: { xs: "8px", sm: "16px" },
      fontSize: { xs: "0.875rem", sm: "1rem" },
    },
    progressBar: {
      height: { xs: 8, sm: 10 },
      borderRadius: 5,
      backgroundColor: "#e0e0e0",
    },
    progressLabel: {
      marginTop: { xs: 0.5, sm: 1 },
      fontWeight: "bold",
      textAlign: "center",
      fontSize: { xs: "0.75rem", sm: "0.875rem" },
    },
    loadingText: {
      textAlign: "center",
      marginTop: { xs: "1rem", sm: "2rem" },
      fontWeight: "bold",
      fontSize: { xs: "1rem", sm: "1.2rem" },
      color: "#888",
    },
    filterContainer: {
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      gap: { xs: 1, sm: 2 },
      marginBottom: { xs: 2, sm: 3 },
      alignItems: { xs: "stretch", sm: "center" },
    },
    searchField: {
      flex: { sm: 1 },
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
    select: {
      width: { xs: "100%", sm: 200 },
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
    tableCell: {
      padding: { xs: "8px", sm: "16px" },
      fontSize: { xs: "0.875rem", sm: "1rem" },
    },
    tablePagination: {
      '.MuiTablePagination-selectLabel': {
        margin: 0,
        fontSize: { xs: '0.8rem', sm: '0.875rem' },
      },
      '.MuiTablePagination-displayedRows': {
        margin: 0,
        fontSize: { xs: '0.8rem', sm: '0.875rem' },
      },
      '.MuiTablePagination-select': {
        fontSize: { xs: '0.8rem', sm: '0.875rem' },
      },
    },
  };

  return (
    <Container maxWidth="lg" sx={styles.container}>
      <Typography variant={isMobile ? "h5" : "h4"} sx={styles.header}>
        Progress Dashboard
      </Typography>
      {loading ? (
        <Typography sx={styles.loadingText}>Loading progress...</Typography>
      ) : (
        <Card sx={styles.card}>
          <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
            <Box sx={styles.filterContainer}>
              <TextField
                placeholder="Search courses..."
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={styles.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl
                size={isMobile ? "small" : "medium"}
                sx={styles.select}
              >
                <InputLabel>Progress Filter</InputLabel>
                <Select
                  value={progressFilter}
                  label="Progress Filter"
                  onChange={(e) => setProgressFilter(e.target.value)}
                >
                  <MenuItem value="all">All Progress</MenuItem>
                  <MenuItem value="notStarted">Not Started (0%)</MenuItem>
                  <MenuItem value="inProgress">In Progress (1-99%)</MenuItem>
                  <MenuItem value="completed">Completed (100%)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TableContainer
              component={Paper}
              sx={{
                mt: 2,
                overflowX: "auto",
              }}
            >
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={styles.tableHeader}>Course</TableCell>
                    <TableCell sx={styles.tableHeader}>Progress</TableCell>
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
                          <TableCell sx={styles.tableCell}>
                            {course.title}
                          </TableCell>
                          <TableCell sx={styles.tableCell}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              <LinearProgress
                                variant="determinate"
                                value={progressData[course.course_id] || 0}
                                sx={styles.progressBar}
                              />
                              <Typography sx={styles.progressLabel}>
                                {progressData[course.course_id]?.toFixed(2) ||
                                  "0"}
                                %
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        align="center"
                        sx={styles.tableCell}
                      >
                        No courses found matching your criteria.
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
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ProgressDashboard;
