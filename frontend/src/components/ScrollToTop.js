import React, { useState, useEffect } from 'react';
import { Fab, Zoom } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

const ScrollToTop = ({ threshold = 300, position = { bottom: 16, right: 16 } }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > threshold) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <Zoom in={isVisible}>
      <Fab
        onClick={scrollToTop}
        size="small"
        aria-label="Scroll to top"
        title="Scroll back to top"
        sx={{
          position: 'fixed',
          bottom: position.bottom,
          right: position.right,
          backgroundColor: '#14213d',
          color: 'white',
          '&:hover': {
            backgroundColor: '#fca311',
          },
          zIndex: 1000,
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Zoom>
  );
};

export default ScrollToTop;
