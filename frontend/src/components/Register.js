// Register.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CssBaseline,
  Container,
  Link,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const validationRules = {
    name: {
      required: "Name is required",
      minLength: { value: 2, message: "Name must be at least 2 characters" },
      maxLength: { value: 50, message: "Name must not exceed 50 characters" },
      pattern: {
        value: /^[a-zA-Z\s-']+$/,
        message: "Name can only contain letters, spaces, hyphens, and apostrophes"
      }
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email address"
      }
    },
    password: {
      required: "Password is required",
      minLength: { value: 8, message: "Password must be at least 8 characters" },
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      }
    }
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    if (rules.required && !value) {
      return rules.required;
    }

    if (rules.minLength && value.length < rules.minLength.value) {
      return rules.minLength.message;
    }

    if (rules.maxLength && value.length > rules.maxLength.value) {
      return rules.maxLength.message;
    }

    if (rules.pattern && !rules.pattern.value.test(value)) {
      return rules.pattern.message;
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const formIsValid = Object.keys(formData).every(
      field => formData[field].length > 0 && !errors[field]
    );
    setIsValid(formIsValid);
  }, [formData, errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const touchedFields = Object.keys(formData).reduce(
      (acc, field) => ({ ...acc, [field]: true }), {}
    );
    setTouched(touchedFields);

    if (!validateForm()) {
      return;
    }

    try {
      const response = await registerUser(
        formData.name,
        formData.email,
        formData.password
      );
      
      // Store email for verification
      localStorage.setItem("pendingVerification", formData.email);
      setRegistrationSuccess(true);
      
      // Navigate to verification page after a brief delay to show success message
      setTimeout(() => {
        navigate("/verify-email", { 
          state: { email: formData.email }
        });
      }, 2000);
      
    } catch (error) {
      setApiError(error.response?.data?.error || "Registration failed");
    }
  };

  if (registrationSuccess) {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <PersonAdd sx={{ fontSize: 50, color: "#14213d" }} />
          <Typography 
            component="h1" 
            variant="h5" 
            sx={{ 
              mt: 1, 
              mb: 3,
              fontWeight: "bold", 
              color: "#14213d",
              textAlign: "center"
            }}
          >
            Registration Successful!
          </Typography>
          <Box
            sx={{
              backgroundColor: "#f5f5f5",
              padding: 3,
              borderRadius: 2,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              width: "100%",
            }}
          >
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2,
                '& .MuiAlert-message': {
                  width: '100%',
                  textAlign: 'center'
                }
              }}
            >
              Account created successfully!
            </Alert>
            <Typography align="center" sx={{ mb: 2 }}>
              Please check your email to verify your account. Redirecting to verification page...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

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
        <PersonAdd sx={{ fontSize: 50, color: "#14213d" }} />
        <Typography component="h1" variant="h5" sx={{ mt: 1, fontWeight: "bold", color: "#14213d" }}>
          Register
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
            id="name"
            label="Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && Boolean(errors.name)}
            helperText={touched.name && errors.name}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && Boolean(errors.password)}
            helperText={touched.password && errors.password}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={!isValid}
            sx={{
              mt: 2,
              mb: 2,
              backgroundColor: "#14213d",
              "&:hover": { backgroundColor: "#fca311" },
              "&:disabled": { backgroundColor: "#cccccc" }
            }}
          >
            Register
          </Button>
          {apiError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {apiError}
            </Alert>
          )}
          <Typography align="center" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Link
              component="button"
              onClick={() => navigate("/login")}
              underline="none"
              sx={{ color: "#fca311", fontWeight: "bold" }}
            >
              Login here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;