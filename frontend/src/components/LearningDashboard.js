import React, { useState, useEffect } from "react";
import { getResources } from "../api"; // Import the new named export
import {
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
} from "@mui/material";

const LearningDashboard = () => {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        getResources()
            .then((data) => {
                setResources(data);
            })
            .catch((error) => {
                console.error("Error fetching learning resources:", error);
            });
    }, []);

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Learning Dashboard
            </Typography>
            <Grid container spacing={3}>
                {resources.length === 0 ? (
                    <Typography paddingTop={2} paddingLeft={3.2}>
                        No learning resources found.
                    </Typography>
                ) : (
                    resources.map((resource) => (
                        <Grid item xs={12} sm={6} md={4} key={resource.id}>
                            <Card sx={{ height: "100%" }}>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {resource.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {resource.description}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                        mt={1}
                                    >
                                        {resource.content_type}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={() => window.open(resource.url, "_blank")}
                                    >
                                        View {resource.content_type}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
};

export default LearningDashboard;
