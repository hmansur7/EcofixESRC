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
    <Container
      component="main"
      maxWidth={false}
      disableGutters
      sx={{ padding: 0 }}
    >
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h2"
          align="center"
          sx={{
            fontWeight: "bold",
            color: "#000000",
            marginBottom: 2,
          }}
        > 
          VirtuLearn<sub style={{fontSize: "0.5em", verticalAlign: "super"}}>TM</sub>
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{
            maxWidth: 600,
            color: "#14213d",
            marginBottom: 4,
          }}
        >
          Experience a new kind of learning<br />
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Login />}
              sx={{
                backgroundColor: "#14213d",
                color: "#ffffff",
                "&:hover": { backgroundColor: "#fca311" },
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
              variant="contained"
              startIcon={<PersonAdd />}
              sx={{
                color: "#fca311",
                backgroundColor: "transparent",
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
