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
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";
import { 
  Logout, 
  AccountCircle, 
  Settings, 
  Menu as MenuIcon,
  PersonOutline,
  AdminPanelSettings
} from "@mui/icons-material";
import ProfileDialog from "./ProfileManager";

const Navbar = ({ title, links, adminView = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('admin'); // 'admin' or 'student'

  const [userInfo, setUserInfo] = useState(() => ({
    name: localStorage.getItem("userName") || "User",
    email: localStorage.getItem("userEmail") || "",
    role: localStorage.getItem("userRole") || "",
  }));

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    if (name && email && role) {
      setUserInfo({ name, email, role });
    }
  }, []);

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
    handleClose();
    setMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    handleClose();
    setMobileMenuOpen(false);
    setProfileOpen(true);
  };

  const handleViewModeSwitch = () => {
    // Check if user has admin privileges
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      return; // Early return if not admin
    }

    const newMode = viewMode === 'admin' ? 'student' : 'admin';
    setViewMode(newMode);
    handleClose();
    setMobileMenuOpen(false);

    // Store the current view mode in localStorage
    localStorage.setItem("viewMode", newMode);

    if (newMode === 'student') {
      navigate('/learning');
    } else {
      navigate('/admin/dashboard');
    }
  };

  // Check initial view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("viewMode");
    const userRole = localStorage.getItem("userRole");
    if (savedViewMode && userRole === "admin") {
      setViewMode(savedViewMode);
    }
  }, []);

  const MobileDrawer = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          width: 240,
          backgroundColor: "#14213d",
          color: "white",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: "#fca311", mr: 1 }}>
            {getInitials(userInfo.name)}
          </Avatar>
          <Typography variant="subtitle1">{userInfo.name}</Typography>
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
        <List>
          {links.map((link) => (
            <ListItem 
              key={link.path} 
              component={Link} 
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgb(252, 162, 17)',
                },
              }}
            >
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
          <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.12)' }} />
          {adminView && (
            <ListItem 
              onClick={handleViewModeSwitch}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgb(252, 162, 17)',
                },
              }}
            >
              <ListItemIcon>
                {viewMode === 'admin' ? 
                  <PersonOutline sx={{ color: 'white' }} /> : 
                  <AdminPanelSettings sx={{ color: 'white' }} />
                }
              </ListItemIcon>
              <ListItemText primary={viewMode === 'admin' ? "View as Student" : "Back to Admin"} />
            </ListItem>
          )}
          <ListItem 
            onClick={handleProfileClick}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgb(252, 162, 17)',
              },
            }}
          >
            <ListItemIcon>
              <Settings sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Profile Settings" />
          </ListItem>
          <ListItem 
            onClick={handleLogout}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgb(252, 162, 17)',
              },
            }}
          >
            <ListItemIcon>
              <Logout sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#14213d" }}>
        <Toolbar>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            sx={{ 
              flexGrow: 1,
              fontSize: isMobile ? '1.1rem' : '1.5rem' 
            }}
          >
            {title}
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {links.map((link) => (
                <Button
                  key={link.path}
                  color="inherit"
                  component={Link}
                  to={link.path}
                  sx={{ 
                    margin: "0 0.5rem",
                    '&:hover': {
                      backgroundColor: 'rgb(252, 162, 17)',
                    },
                  }}
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
                {userInfo.role === "admin" && (
                  <MenuItem onClick={handleViewModeSwitch}>
                    <ListItemIcon>
                      {viewMode === 'admin' ? 
                        <PersonOutline fontSize="small" /> : 
                        <AdminPanelSettings fontSize="small" />
                      }
                    </ListItemIcon>
                    {viewMode === 'admin' ? "View as Student" : "Back to Admin"}
                  </MenuItem>
                )}
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
          )}

          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <MobileDrawer />

      <ProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        userInfo={userInfo}
      />
    </>
  );
};

export default Navbar;