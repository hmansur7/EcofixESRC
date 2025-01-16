import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  FormControl,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const SearchAndSort = ({ searchTerm, setSearchTerm, sortOrder, toggleSortOrder, styles }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
      }}
    >
      <Tooltip
        title="Filter lessons by title or description"
        arrow
        sx={{
          bgcolor: theme.palette.background.paper,
          '& .MuiTooltip-arrow': {
            color: theme.palette.background.paper,
          },
        }}
      >
        <FormControl 
          sx={{
            ...styles.searchField,
            flexGrow: 1,
            maxWidth: isMobile ? '100%' : '300px',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              color: 'action.active',
              pointerEvents: 'none'
            }}
          >
            <Search fontSize="small" />
          </Box>
          <textarea
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxLength={35}
            placeholder="Search lessons..."
            style={{
              width: '100%',
              height: '40px',
              padding: '8px 14px 8px 40px',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              backgroundColor: 'white',
              resize: 'none',
              outline: 'none',
              overflow: 'hidden',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.palette.primary.main;
              e.target.style.borderWidth = '2px';
              e.target.style.padding = '7px 13px 7px 39px';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.23)';
              e.target.style.borderWidth = '1px';
              e.target.style.padding = '8px 14px 8px 40px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
        </FormControl>
      </Tooltip>

      <Box sx={{ display: 'flex', gap: 1, alignSelf: isMobile ? 'flex-start' : 'center' }}>
        <Tooltip title={`Sort by order: ${sortOrder === 'asc' ? 'lowest first' : 'highest first'}`} arrow>
          <IconButton
            onClick={toggleSortOrder}
            sx={{
              bgcolor: '#f8f9fa',
              '&:hover': { bgcolor: '#fca311', color: 'white' },
            }}
          >
            {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default SearchAndSort;