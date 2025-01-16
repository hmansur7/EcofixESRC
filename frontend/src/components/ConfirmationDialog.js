import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const ConfirmationDialog = ({ 
  open, 
  title, 
  message, 
  onConfirm, 
  onClose, 
  confirmText = "Confirm",
  isDestructive = false 
}) => {
  const styles = {
    dialog: {
      '& .MuiDialog-paper': {
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      }
    },
    dialogTitle: {
      color: '#14213d',
      fontWeight: 'bold',
      padding: '16px 24px'
    },
    dialogContent: {
      padding: '16px 24px'
    },
    dialogActions: {
      padding: '16px',
      gap: '8px'
    },
    cancelButton: {
      color: '#14213d',
      '&:hover': {
        backgroundColor: 'rgba(20, 33, 61, 0.04)'
      }
    },
    confirmButton: {
      backgroundColor: isDestructive ? '#d32f2f' : '#14213d',
      color: 'white',
      '&:hover': {
        backgroundColor: isDestructive ? '#c62828' : '#fca311'
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      sx={styles.dialog}
    >
      <DialogTitle sx={styles.dialogTitle}>{title}</DialogTitle>
      <DialogContent sx={styles.dialogContent}>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions sx={styles.dialogActions}>
        <Button 
          onClick={onClose}
          sx={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          sx={styles.confirmButton}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;