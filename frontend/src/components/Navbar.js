import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api"; 

const Navbar = ({ title, links }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser(); 
        navigate("/login"); 
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: "#14213d" }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>
                <Box>
                    {links.map((link) => (
                        <Button
                            key={link.path}
                            color="inherit"
                            component={Link}
                            to={link.path}
                            sx={{ margin: "0 0.5rem" }}
                        >
                            {link.label}
                        </Button>
                    ))}
                    <Button color="inherit" onClick={handleLogout} sx={{ margin: "0 0.5rem" }}>
                        Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
