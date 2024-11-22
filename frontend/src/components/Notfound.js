import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f0f4f3", 
        color: "#2c6e49", 
        padding: 3,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: "6rem",
          fontWeight: "bold",
          mb: 2,
          color: "#2c6e49", 
        }}
      >
        404
      </Typography>
      <Typography
        variant="h5"
        sx={{
          mb: 4,
          color: "#4d774e", 
        }}
      >
        Oops! The page you're looking for doesn't exist.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate("/")}
        sx={{
          backgroundColor: "#4caf50", 
          "&:hover": {
            backgroundColor: "#388e3c", 
          },
          padding: "10px 20px",
          borderRadius: "8px",
        }}
      >
        Go to Homepage
      </Button>
    </Box>
  );
};

export default NotFound;
