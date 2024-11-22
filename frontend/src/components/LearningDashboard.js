import React, { useState, useEffect } from "react";
import { getCourses } from "../services/api";
import {
    Box,
    Typography,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Alert,
} from "@mui/material";

const LearningDashboard = () => {
    const [courses, setCourses] = useState([]); // Courses state
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(""); // Error state

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses(); // Fetch courses
                setCourses(data);
            } catch (err) {
                console.error("Error fetching courses:", err);
                setError("Failed to load courses. Please try again.");
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchCourses();
    }, []);

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Learning Dashboard
            </Typography>
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : courses.length > 0 ? (
                <Grid container spacing={3}>
                    {courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.id}>
                            <Card sx={{ height: "100%" }}>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {course.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 1 }}
                                    >
                                        {course.description || "No description available"}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={() =>
                                            alert(`Selected Course: ${course.title}`)
                                        }
                                    >
                                        View Course
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography>No courses available at the moment.</Typography>
            )}
        </Box>
    );
};

export default LearningDashboard;
