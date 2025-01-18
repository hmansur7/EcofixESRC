import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CssBaseline,
  Container,
  Link,
  CircularProgress,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  const validationRules = {
    email: {
      required: "Please enter your email",
      pattern: {
        value: /\S+@\S+\.\S+/,
        message: "Please enter a valid email",
      },
    },
    password: {
      required: "Please enter your password",
    },
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    if (rules.required && !value.trim()) {
      return rules.required;
    }

    if (rules.minLength && value.length < rules.minLength.value) {
      return rules.minLength.message;
    }

    if (rules.pattern && !rules.pattern.value.test(value)) {
      return rules.pattern.message;
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const formIsValid =
      formData.email.trim() !== "" && formData.password.trim() !== "";
    setIsValid(formIsValid);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError("");

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const touchedFields = Object.keys(formData).reduce(
      (acc, field) => ({ ...acc, [field]: true }),
      {}
    );
    setTouched(touchedFields);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser(formData.email, formData.password);
      const role = response.role;    

      if (role === "admin") {
        localStorage.setItem("viewMode", "admin");
        navigate("/admin/dashboard");
      } else {
        localStorage.removeItem("viewMode");
        navigate("/learning");
      }
    } catch (error) {
      // Check for email verification requirement
      if (
        error.message.toLowerCase().includes('verify') || 
        error.message.toLowerCase().includes('email')
      ) {
        localStorage.setItem("pendingVerification", formData.email);
        navigate("/verify-email", { 
          state: { email: formData.email }
        });
        return;
      } 
      
      // Handle other login errors
      setApiError(
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <LockOutlined sx={{ fontSize: 50, color: "#14213d" }} />
        <Typography
          component="h1"
          variant="h5"
          sx={{ mt: 1, fontWeight: "bold", color: "#14213d" }}
        >
          Login
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            mt: 3,
            backgroundColor: "#f5f5f5",
            padding: 3,
            borderRadius: 2,
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
            disabled={loading}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && Boolean(errors.password)}
            helperText={touched.password && errors.password}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !isValid}
            sx={{
              mt: 2,
              mb: 2,
              backgroundColor: "#14213d",
              "&:hover": { backgroundColor: "#fca311" },
              "&:disabled": { backgroundColor: "#cccccc" },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Login"
            )}
          </Button>
          {apiError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {apiError}
            </Alert>
          )}
          <Typography align="center" sx={{ mt: 2 }}>
            Don't have an account?{" "}
            <Link
              component="button"
              onClick={() => navigate("/register")}
              underline="none"
              sx={{ color: "#fca311", fontWeight: "bold" }}
              disabled={loading}
            >
              Register here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
