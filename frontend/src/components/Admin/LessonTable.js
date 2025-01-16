import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  TablePagination,
  Box,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const LessonTable = ({
  filteredLessons,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleDeleteConfirmation,
  styles,
  lessons,
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer sx={{
        ...styles.tableContainer,
        maxHeight: { xs: '60vh', sm: '70vh' },
      }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{
                  ...styles.tableHeader,
                  width: { xs: '25%', sm: '30%' }
                }}
              >
                Title
              </TableCell>
              <TableCell 
                align="center" 
                sx={{
                  ...styles.tableHeader,
                  width: { xs: '15%', sm: '10%' }
                }}
              >
                Order
              </TableCell>
              <TableCell 
                align="center" 
                sx={{
                  ...styles.tableHeader,
                  width: { xs: '15%', sm: '10%' }
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLessons
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((lesson) => (
                <TableRow
                  key={lesson.lesson_id}
                  sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                >
                  <TableCell sx={{ wordBreak: 'break-word' }}>
                    {lesson.title}
                  </TableCell>
                  <TableCell align="center">{lesson.order}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete Lesson" arrow>
                      <IconButton
                        onClick={() => handleDeleteConfirmation(lesson.lesson_id)}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'white',
                          },
                        }}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            {filteredLessons.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      {lessons.length === 0
                        ? 'No lessons found. Add your first lesson using the form below.'
                        : 'No lessons match your search criteria.'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredLessons.length > 0 && (
        <TablePagination
          component="div"
          count={filteredLessons.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            bgcolor: '#fca311',
            borderRadius: '0 0 8px 8px',
            '.MuiTablePagination-select': {
              bgcolor: 'white',
              borderRadius: 1,
            },
            '.MuiTablePagination-selectIcon': {
              color: '#14213d',
            },
            '& .MuiButtonBase-root': {
              color: '#14213d',
              '&.Mui-disabled': {
                color: 'rgba(0, 0, 0, 0.26)',
              },
            },
          }}
        />
      )}
    </Box>
  );
};

export default LessonTable;