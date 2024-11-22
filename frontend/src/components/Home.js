import React from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  CssBaseline,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Login, PersonAdd } from "@mui/icons-material";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="xl" disableGutters>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "green",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Custom Eco Icon (Using an Emoji 🌿) */}
        <Box
          sx={{
            fontSize: 100,
            marginBottom: 2,
          }}
        >
          🌿
        </Box>
        <Typography
          variant="h2"
          align="center"
          sx={{
            fontWeight: "bold",
            textShadow: "2px 2px 10px rgba(0,0,0,0.5)",
            marginBottom: 2,
          }}
        >
          Welcome to the Hub
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{
            maxWidth: 600,
            textShadow: "1px 1px 5px rgba(0,0,0,0.5)",
            marginBottom: 4,
          }}
        >
          Expand your knowledge of sustainability and eco-friendly practices and register for our events. Join us on our mission of moving towards a greener future.
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Login />}
              sx={{
                backgroundColor: "white",
                color: "green",
                "&:hover": { backgroundColor: "lightgreen" },
                paddingX: 4,
                paddingY: 1.5,
              }}
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<PersonAdd />}
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
                paddingX: 4,
                paddingY: 1.5,
              }}
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
