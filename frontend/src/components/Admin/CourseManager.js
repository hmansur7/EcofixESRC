import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  
} from '@mui/material';

const styles = {
  dialog: {
    '& .MuiDialog-paper': {
      width: '100%',
      maxWidth: '600px',
      margin: '16px',
      overflowX: 'hidden'
    }
  },
  textField: {
    '& .MuiInputBase-input': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      overflowWrap: 'break-word'
    }
  },
  dialogContent: {
    padding: '16px',
  },
  formField: {
    marginBottom: '16px'
  },
  button: {
    backgroundColor: "#14213d",
    color: "white",
    "&:hover": { backgroundColor: "#fca311" },
  },
  cancelButton: {
    color: "#14213d",
    "&:hover": { backgroundColor: "#f5f5f5" },
  }
};

const CourseManager = ({ open, onClose, course, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'Beginner',
    prerequisites: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        duration: course.duration || '',
        level: course.level || 'Beginner',
        prerequisites: course.prerequisites || ''
      });
    }
  }, [course]);

  const validateField = (name, value) => {
    const validations = {
      title: value => (!value.trim() || value.length > 35 ? "Title must be between 1-35 characters" : ""),
      description: value => (!value.trim() || value.length > 250 ? "Description must be between 1-250 characters" : ""),
      duration: value => {
        const pattern = /^\d+\s+(week|weeks|month|months)$/i;
        return !pattern.test(value) ? "Must be in format: '4 weeks' or '2 months'" : "";
      },
      prerequisites: value => (value.length > 50 ? "Must be less than 50 characters" : ""),
    };
    return validations[name] ? validations[name](value) : "";
  };

  const formatDuration = (input) => {
    let formatted = input.trim().replace(/\s+/g, " ");
    const pattern = /^(\d{1,2})\s*(week|weeks|month|months)?$/i;
    const match = formatted.match(pattern);

    if (match) {
      const number = match[1];
      let unit = match[2]?.toLowerCase() || "";

      if (unit.startsWith("week")) {
        unit = number === "1" ? "week" : "weeks";
      } else if (unit.startsWith("month")) {
        unit = number === "1" ? "month" : "months";
      }

      if (unit) {
        formatted = `${number} ${unit}`;
      }
    }
    return formatted;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length === 0) {
      setIsSaving(true);
      setSubmitError("");
      try {
        const formattedData = {
          ...formData,
          prerequisites: formData.prerequisites.trim() || "None",
          duration: formatDuration(formData.duration)
        };
        await onSave(formattedData);
        onClose();
      } catch (error) {
        setSubmitError(error.message || "Failed to save course changes");
      } finally {
        setIsSaving(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      sx={styles.dialog}
    >
      <DialogTitle sx={{ backgroundColor: '#14213d', color: '#ffff' }}>
        Edit Course
      </DialogTitle>
      <DialogContent sx={styles.dialogContent}>
        <Box sx={{ pt: 2 }}>
          <TextField
            label="Course Title"
            fullWidth
            value={formData.title}
            onChange={e => handleChange("title", e.target.value)}
            error={!!errors.title}
            helperText={errors.title || `${formData.title.length}/35 characters`}
            inputProps={{ maxLength: 35 }}
            sx={styles.formField}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            sx={{
              ...styles.formField,
              ...styles.textField,
              '& .MuiInputBase-root': {
                width: '100%'
              }
            }}
            value={formData.description}
            onChange={e => handleChange("description", e.target.value)}
            error={!!errors.description}
            helperText={errors.description || `${formData.description.length}/250 characters`}
            inputProps={{ maxLength: 250 }}
          />
          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2,
            mb: 2 
          }}>
            <TextField
              label="Duration"
              fullWidth
              value={formData.duration}
              onChange={e => {
                const value = formatDuration(e.target.value);
                handleChange("duration", value);
              }}
              error={!!errors.duration}
              helperText={errors.duration || "Format: 1-52 weeks or 1-12 months"}
              inputProps={{ maxLength: 20 }}
            />
            <TextField
              select
              label="Level"
              fullWidth
              value={formData.level}
              onChange={e => handleChange("level", e.target.value)}
            >
              {["Beginner", "Intermediate", "Advanced"].map(level => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </TextField>
          </Box>
          <TextField
            label="Prerequisites"
            fullWidth
            value={formData.prerequisites}
            onChange={e => handleChange("prerequisites", e.target.value)}
            error={!!errors.prerequisites}
            helperText={errors.prerequisites || `${formData.prerequisites.length}/50 characters (leave empty for None)`}
            inputProps={{ maxLength: 50 }}
            sx={styles.formField}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
        <Button onClick={onClose} sx={styles.cancelButton}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" sx={styles.button}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseManager;