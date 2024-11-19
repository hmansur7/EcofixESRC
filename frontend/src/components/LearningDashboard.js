import React, { useState, useEffect } from 'react';
import API from '../api'; // Axios instance for API requests
import {
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
} from '@mui/material';

const LearningDashboard = () => {
    const [resources, setResources] = useState([]);

    // Fetch learning resources from the API
    useEffect(() => {
        API.get('contents/')
            .then((response) => {
                setResources(response.data);
            })
            .catch((error) => {
                console.error('Error fetching learning resources:', error);
            });
    }, []);

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Learning Dashboard
            </Typography>
            <Grid container spacing={3}>
                {resources.length === 0 ? (
                    <Typography>No learning resources found.</Typography>
                ) : (
                    resources.map((resource) => (
                        <Grid item xs={12} sm={6} md={4} key={resource.id}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {resource.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {resource.description}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        color="primary"
                                        onClick={() => window.open(resource.url, '_blank')}
                                    >
                                        Learn More
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
