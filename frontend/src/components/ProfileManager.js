import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Typography,
  Alert,
  Box
} from '@mui/material';
import { changePassword } from '../services/api';

const ProfileDialog = ({ open, onClose, userInfo }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }
    return "";
  };

  const handleChange = (field) => (event) => {
    setPasswordData({ ...passwordData, [field]: event.target.value });
    setErrors({ ...errors, [field]: '' });
    setApiError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    setErrors({});
    setApiError('');
    setSuccess('');

    let newErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    const newPasswordError = validatePassword(passwordData.newPassword);
    if (newPasswordError) {
      newErrors.newPassword = newPasswordError;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setApiError(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#14213d', color: 'white' }}>
        Profile Settings
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            User Information
          </Typography>
          <Typography>Name: {userInfo?.name}</Typography>
          <Typography>Email: {userInfo?.email}</Typography>
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Change Password
        </Typography>
        <TextField
          fullWidth
          margin="dense"
          label="Current Password"
          type="password"
          value={passwordData.currentPassword}
          onChange={handleChange('currentPassword')}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword}
          disabled={loading}
        />
        <TextField
          fullWidth
          margin="dense"
          label="New Password"
          type="password"
          value={passwordData.newPassword}
          onChange={handleChange('newPassword')}
          error={!!errors.newPassword}
          helperText={errors.newPassword}
          disabled={loading}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Confirm New Password"
          type="password"
          value={passwordData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          disabled={loading}
        />
        {apiError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {apiError}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{
            bgcolor: '#14213d',
            '&:hover': { bgcolor: '#fca311' }
          }}
        >
          Change Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDialog;