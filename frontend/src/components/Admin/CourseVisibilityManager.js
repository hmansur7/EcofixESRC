import React, { useState, useCallback, memo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const STYLES = {
  visibilityButton: (isVisible) => ({
    backgroundColor: isVisible ? "#14213d" : "#f5f5f5",
    color: isVisible ? "white" : "#14213d",
    "&:hover": {
      backgroundColor: isVisible ? "#fca311" : "#e0e0e0",
      transform: "translateY(-1px)",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    transition: "all 0.2s ease-in-out",
  }),
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: "8px",
      padding: 1,
    },
  },
  dialogContent: {
    py: 3,
  },
  dialogActions: {
    padding: 2,
    gap: 1,
  },
  cancelButton: {
    color: "#14213d",
    "&:hover": {
      backgroundColor: "rgba(20, 33, 61, 0.04)",
      borderColor: "#14213d",
    },
  },
  confirmButton: {
    backgroundColor: "#14213d",
    color: "white",
    "&:hover": {
      backgroundColor: "#fca311",
    },
  },
};

const VisibilityDialog = memo(({ open, onClose, onConfirm, isVisible }) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="visibility-dialog-title"
    sx={STYLES.dialog}
  >
    <DialogTitle id="visibility-dialog-title">
      {isVisible ? "Hide Course?" : "Make Course Visible?"}
    </DialogTitle>
    <DialogContent sx={STYLES.dialogContent}>
      <DialogContentText>
        {isVisible
          ? "Are you sure you want to hide this course from all users?"
          : "Are you sure you want to make this course visible to all users?"}
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={STYLES.dialogActions}>
      <Button onClick={onClose} variant="text" sx={STYLES.cancelButton}>
        Cancel
      </Button>
      <Button onClick={onConfirm} variant="contained" sx={STYLES.confirmButton}>
        {isVisible ? "Hide Course" : "Make Visible"}
      </Button>
    </DialogActions>
  </Dialog>
));

const CourseVisibilityManager = ({
  isVisible,
  onVisibilityChange,
  disabled = false,
}) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    pendingVisibility: null,
  });
  const [error, setError] = useState({ open: false, message: "" });

  const handleVisibilityToggle = useCallback(() => {
    setDialogState({
      isOpen: true,
      pendingVisibility: !isVisible,
    });
  }, [isVisible]);

  const handleVisibilityDialogClose = useCallback(() => {
    setDialogState({
      isOpen: false,
      pendingVisibility: null,
    });
  }, []);

  const handleVisibilityConfirm = useCallback(async () => {
    try {
      await onVisibilityChange({
        is_visible: dialogState.pendingVisibility,
        visibility_start_date: null,
        visibility_end_date: null,
      });
      handleVisibilityDialogClose();
    } catch (err) {
      setError({
        open: true,
        message: "Failed to update course visibility, please try again later.",
      });
    }
  }, [
    dialogState.pendingVisibility,
    onVisibilityChange,
    handleVisibilityDialogClose,
  ]);

  const handleCloseError = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setError({ ...error, open: false });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Tooltip
          title={
            isVisible ? "Click to hide course" : "Click to make course visible"
          }
          arrow
        >
          <span>
            <Button
              variant="contained"
              size="small"
              onClick={handleVisibilityToggle}
              startIcon={isVisible ? <Visibility /> : <VisibilityOff />}
              sx={STYLES.visibilityButton(isVisible)}
              disabled={disabled}
              aria-label={isVisible ? "Hide course" : "Show course"}
            >
              {isVisible ? "Visible" : "Hidden"}
            </Button>
          </span>
        </Tooltip>

        <VisibilityDialog
          open={dialogState.isOpen}
          onClose={handleVisibilityDialogClose}
          onConfirm={handleVisibilityConfirm}
          isVisible={isVisible}
        />
      </Box>
      <Snackbar
        open={error.open}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {error.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

CourseVisibilityManager.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onVisibilityChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

VisibilityDialog.displayName = "VisibilityDialog";

export default memo(CourseVisibilityManager);
