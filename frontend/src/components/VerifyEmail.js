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
            
            if (response.role) {
                localStorage.setItem("userRole", response.role);
                localStorage.setItem("userName", response.name);  
                localStorage.setItem("userEmail", response.email);  
            }
            
            setStatus("success");
            localStorage.removeItem("pendingVerification");
            
            setTimeout(() => {
                navigate("/learning");
            }, 2000);
        } catch (error) {
            setStatus("error");
            setError(error.response?.data?.error || "Verification failed");
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