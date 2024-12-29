// Navbar.js
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Avatar,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";
import { Logout, AccountCircle, Settings } from "@mui/icons-material";
import ProfileDialog from "./ProfileManager";

const Navbar = ({ title, links }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const [userInfo, setUserInfo] = useState(() => ({
    name: localStorage.getItem("userName") || "User",
    email: localStorage.getItem("userEmail") || "",
  }));

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    if (name && email) {
      setUserInfo({ name, email });
    }
  }, []); // Run once on component mount

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const handleProfileClick = () => {
    handleClose();
    setProfileOpen(true);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#14213d" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
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

            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleMenu}
              sx={{ ml: 2 }}
            >
              <AccountCircle />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem>
                <Avatar sx={{ bgcolor: "#fca311" }}>
                  {getInitials(userInfo.name)}
                </Avatar>
                {userInfo.name}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Profile Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <ProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        userInfo={userInfo}
      />
    </>
  );
};

export default Navbar;
