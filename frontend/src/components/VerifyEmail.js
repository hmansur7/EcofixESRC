import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Paper,
    Fade,
} from "@mui/material";
import { MailOutline } from "@mui/icons-material";
import { verifyEmail, resendVerificationEmail } from "../services/api";

const VerifyEmail = () => {
    const [status, setStatus] = useState("pending");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || localStorage.getItem("pendingVerification");

    const startResendCooldown = useCallback(() => {
        setResendCooldown(6);
        const timer = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (token) {
            verifyToken();
        }
    }, [token]);

    const verifyToken = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await verifyEmail(token);
            
            if (!response.access_token || !response.role) {
                throw new Error("Invalid server response");
            }

            // Store authentication data
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('refresh_token', response.refresh_token);
            localStorage.setItem("userRole", response.role);
            localStorage.setItem("userName", response.name);
            localStorage.setItem("userEmail", response.email);
            
            // Clear verification state
            localStorage.removeItem("pendingVerification");
            
            setStatus("success");
            
            // Redirect based on role
            setTimeout(() => {
                const redirectPath = response.role === "admin" ? "/admin/dashboard" : "/learning";
                if (response.role === "admin") {
                    localStorage.setItem("viewMode", "admin");
                } else {
                    localStorage.removeItem("viewMode");
                }
                navigate(redirectPath);
            }, 2000);

        } catch (error) {            
            setStatus("error");
            
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError("Verification failed. Please try again or request a new verification email.");
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

        if (resendCooldown > 0) {
            return;
        }

        try {
            setLoading(true);
            setError("");
            await resendVerificationEmail(email);
            setStatus("resent");
            startResendCooldown();
        } catch (error) {
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError("Failed to resend verification email. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    const renderResendButton = () => (
        <Button
            variant="contained"
            onClick={handleResendVerification}
            disabled={loading || resendCooldown > 0}
            sx={{
                mt: 2,
                mb: 2,
                backgroundColor: "#14213d",
                "&:hover": { backgroundColor: "#fca311" },
                "&.Mui-disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.12)",
                },
            }}
        >
            {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
            ) : resendCooldown > 0 ? (
                `Wait ${resendCooldown}s to resend`
            ) : (
                "Resend Verification Email"
            )}
        </Button>
    );

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
                        position: "relative",
                    }}
                >
                    <MailOutline
                        sx={{ 
                            fontSize: 50, 
                            color: "#14213d", 
                            mb: 2,
                            animation: "bounce 2s infinite"
                        }}
                    />
                    
                    {!token ? (
                        <Fade in={true}>
                            <Box sx={{ width: "100%", textAlign: "center" }}>
                                <Typography variant="h5" component="h1" gutterBottom>
                                    Verify Your Email
                                </Typography>
                                {email && (
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            mb: 3,
                                            color: "#14213d",
                                            wordBreak: "break-word"
                                        }}
                                    >
                                        {email}
                                    </Typography>
                                )}
                                <Typography align="center" sx={{ mb: 3 }}>
                                    Please check your email and click the verification link to activate your account.
                                </Typography>
                                {renderResendButton()}
                            </Box>
                        </Fade>
                    ) : (
                        <Fade in={true}>
                            <Box sx={{ width: "100%", textAlign: "center" }}>
                                {loading && <CircularProgress sx={{ mb: 2 }} />}
                                {status === "success" && (
                                    <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
                                        Email verified successfully! Redirecting to dashboard...
                                    </Alert>
                                )}
                            </Box>
                        </Fade>
                    )}
                    
                    <Fade in={Boolean(error)}>
                        <Box sx={{ width: "100%" }}>
                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}
                        </Box>
                    </Fade>
                    
                    <Fade in={status === "resent"}>
                        <Box sx={{ width: "100%" }}>
                            {status === "resent" && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    Verification email has been resent. Please check your inbox.
                                </Alert>
                            )}
                        </Box>
                    </Fade>

                    {!token && (
                        <Alert severity="info" sx={{ width: "100%", mt: 2 }}>
                            Already verified? You can proceed to login.
                        </Alert>
                    )}

                    <Button
                        sx={{
                            mt: 2,
                            color: "#fca311",
                            "&:hover": {
                                backgroundColor: "transparent",
                                textDecoration: "underline",
                            },
                        }}
                        onClick={() => navigate("/login")}
                    >
                        Back to Login
                    </Button>
                </Paper>
            </Box>
            <style>
                {`
                    @keyframes bounce {
                        0%, 20%, 50%, 80%, 100% {
                            transform: translateY(0);
                        }
                        40% {
                            transform: translateY(-10px);
                        }
                        60% {
                            transform: translateY(-5px);
                        }
                    }
                `}
            </style>
        </Container>
    );
};

export default VerifyEmail;