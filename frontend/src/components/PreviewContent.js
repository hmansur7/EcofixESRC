import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { getResourcePreview } from '../services/api';

const PreviewContent = ({ resource }) => {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const fileExtension = resource.file.toLowerCase().split('.').pop();
        const blob = await getResourcePreview(resource.id);
        const blobUrl = URL.createObjectURL(blob);
        const mimeType = blob.type;

        if (fileExtension === 'pdf' || mimeType === 'application/pdf') {
          setContent(
            <Box sx={{ width: '100%', height: '100%' }}>
              <iframe
                src={blobUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title={resource.title}
              />
            </Box>
          );
        } else if (
          fileExtension.match(/^(jpg|jpeg|png|gif)$/) ||
          mimeType.startsWith('image/')
        ) {
          setContent(
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              bgcolor: '#f8f9fa'
            }}>
              <img
                src={blobUrl}
                alt={resource.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          );
        } else if (
          fileExtension.match(/^(txt|md)$/) ||
          mimeType === 'text/plain'
        ) {
          const text = await new Response(blob).text();
          setContent(
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              overflow: 'auto', 
              bgcolor: '#fff',
              p: 3
            }}>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  margin: 0,
                  fontFamily: 'monospace'
                }}
              >
                {text}
              </pre>
            </Box>
          );
        } else {
          setError(
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="error">
                Preview not available
              </Typography>
              <Typography>
                File type: {fileExtension.toUpperCase()}
                {mimeType && ` (${mimeType})`}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                You can download this file to view it.
              </Typography>
            </Box>
          );
        }
      } catch (err) {
        console.error('Preview error:', err);
        setError(
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom color="error">
              Failed to load preview
            </Typography>
            <Typography>
              {err.response?.status === 403
                ? "You don't have access to this resource"
                : err.response?.data?.detail || err.message}
            </Typography>
          </Box>
        );
      }
    };

    if (resource) {
      loadPreview();
    }

    return () => {
      if (content?.props?.src) {
        URL.revokeObjectURL(content.props.src);
      }
    };
  }, [resource]);

  if (error) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: 3,
      }}>
        {error}
      </Box>
    );
  }

  return content || (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}>
      <LinearProgress sx={{ width: '50%' }} />
    </Box>
  );
};

export default PreviewContent;