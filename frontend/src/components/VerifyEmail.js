import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Paper,
} from "@mui/material";
import { MailOutline } from "@mui/icons-material";
import { verifyEmail, resendVerificationEmail } from "../services/api";

const VerifyEmail = () => {
    const [status, setStatus] = useState("pending");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || localStorage.getItem("pendingVerification");

    useEffect(() => {
        if (token) {
            verifyToken();
        }
    }, [token]);

    const verifyToken = async () => {
        try {
            setLoading(true);
            const response = await verifyEmail(token);
                        
            // Store JWT tokens
            if (response.access_token) {
                localStorage.setItem('access_token', response.access_token);
            }
            
            if (response.refresh_token) {
                localStorage.setItem('refresh_token', response.refresh_token);
            }
    
            // Store user information
            if (response.role) {
                localStorage.setItem("userRole", response.role);
                localStorage.setItem("userName", response.name);  
                localStorage.setItem("userEmail", response.email);  
            }
            
            // Remove pending verification
            localStorage.removeItem("pendingVerification");
            
            setStatus("success");
            
            // Determine redirect based on role
            setTimeout(() => {
                if (response.role === "admin") {
                    localStorage.setItem("viewMode", "admin");
                    navigate("/admin/dashboard");
                } else {
                    localStorage.removeItem("viewMode");
                    navigate("/learning");
                }
            }, 2000);
        } catch (error) {            
            setStatus("error");
            
            // More detailed error handling
            if (error.response) {
                // Server responded with an error
                if (error.response.status === 400) {
                    setError(error.response.data.error || "Invalid or expired verification token");
                } else if (error.response.status === 403) {
                    setError("Email verification failed. Please try again.");
                } else {
                    setError("An unexpected error occurred during verification");
                }
            } else if (error.message) {
                // Network error or other client-side error
                setError(error.message);
            } else {
                setError("Verification failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            setError("Email address not found. Please try registering again.");
            return;
        }

        try {
            setLoading(true);
            await resendVerificationEmail(email);
            setStatus("resent");
            setError("");
        } catch (error) {
            setError(error.response?.data?.error || "Failed to resend verification email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    mt: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <MailOutline
                        sx={{ fontSize: 50, color: "#14213d", mb: 2 }}
                    />
                    {!token ? (
                        <>
                            <Typography variant="h5" component="h1" gutterBottom>
                                Verify Your Email
                            </Typography>
                            <Typography align="center" sx={{ mb: 3 }}>
                                We've sent a verification link to {email}. Please check your
                                email and click the link to verify your account.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={handleResendVerification}
                                disabled={loading}
                                sx={{
                                    mt: 2,
                                    mb: 2,
                                    backgroundColor: "#14213d",
                                    "&:hover": { backgroundColor: "#fca311" },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} sx={{ color: "white" }} />
                                ) : (
                                    "Resend Verification Email"
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            {loading && <CircularProgress sx={{ mb: 2 }} />}
                            {status === "success" && (
                                <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
                                    Email verified successfully! Redirecting to dashboard...
                                </Alert>
                            )}
                        </>
                    )}
                    {error && (
                        <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {status === "resent" && (
                        <Alert severity="success" sx={{ width: "100%", mt: 2 }}>
                            Verification email has been resent. Please check your inbox.
                        </Alert>
                    )}
                    <Alert severity="info" sx={{ width: "100%", mt: 2 }}>
                        If you have already verified your email, please proceed to login.
                    </Alert>
                    <Button
                        sx={{
                            mt: 2,
                            color: "#fca311",
                            "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
                        }}
                        onClick={() => navigate("/login")}
                    >
                        Back to Login
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
};

export default VerifyEmail;