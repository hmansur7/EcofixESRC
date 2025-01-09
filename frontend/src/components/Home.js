import { Box, Typography, Grid, Button, Container, Paper, useTheme, useMediaQuery } from '@mui/material';
import { Login, PersonAdd, Public, MenuBook, Groups } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    { icon: MenuBook, title: 'Quality Content' },
    { icon: Public, title: 'Free Access' },
    { icon: Groups, title: 'Global Reach' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 4, sm: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 4, sm: 6, md: 8 },
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: { xs: 1, sm: 2 },
              fontSize: {
                xs: '2rem',
                sm: '2.5rem',
                md: '3.5rem',
                lg: '4rem'
              },
              position: 'relative',
              display: 'inline-block',
              wordBreak: 'break-word',
              px: 2,
              background: `linear-gradient(135deg, #14213d 60%, #fca311)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 4px rgba(20, 33, 61, 0.1)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '4px',
                background: 'linear-gradient(90deg, #14213d, #fca311)',
                borderRadius: '2px',
              }
            }}
          >
            VirtuLearn
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: '#14213d',
              mb: { xs: 4, sm: 5, md: 6 },
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: {
                xs: '1rem',
                sm: '1.2rem',
                md: '1.5rem'
              },
              px: 2,
            }}
          >
            Expert-crafted courses, freely accessible to everyone
          </Typography>
        </Box>

        <Grid 
          container 
          spacing={{ xs: 2, sm: 4, md: 6 }} 
          justifyContent="center" 
          sx={{ 
            mb: { xs: 4, sm: 6, md: 8 },
            px: { xs: 1, sm: 2 }
          }}
        >
          {features.map(({ icon: Icon, title }) => (
            <Grid item xs={6} sm={6} md={3} key={title}>
              <Paper
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: isMobile ? 'none' : 'translateY(-8px)',
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: { xs: 32, sm: 40, md: 48 },
                    color: '#14213d',
                    mb: { xs: 1, sm: 2 },
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: '#14213d',
                    fontWeight: 600,
                    fontSize: {
                      xs: '0.9rem',
                      sm: '1.1rem',
                      md: '1.25rem'
                    },
                  }}
                >
                  {title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 2 },
            justifyContent: 'center',
            flexWrap: 'wrap',
            px: { xs: 2, sm: 0 },
          }}
        >
          <Button
            variant="contained"
            size={isMobile ? "medium" : "large"}
            startIcon={<Login sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />}
            onClick={() => navigate('/login')}
            sx={{
              backgroundColor: '#14213d',
              color: '#ffffff',
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 1, sm: 1.5 },
              borderRadius: 2,
              textTransform: 'none',
              fontSize: {
                xs: '0.9rem',
                sm: '1rem',
                md: '1.1rem'
              },
              fontWeight: 600,
              boxShadow: '0 4px 6px rgba(20, 33, 61, 0.12)',
              '&:hover': {
                backgroundColor: '#fca311',
                transform: isMobile ? 'none' : 'translateY(-2px)',
                boxShadow: '0 6px 8px rgba(20, 33, 61, 0.2)',
              },
              transition: 'all 0.2s ease-in-out',
              width: { xs: '100%', sm: 'auto' },
              mb: { xs: 1, sm: 0 },
            }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            size={isMobile ? "medium" : "large"}
            startIcon={<PersonAdd sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />}
            onClick={() => navigate('/register')}
            sx={{
              color: '#14213d',
              borderColor: '#14213d',
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 1, sm: 1.5 },
              borderRadius: 2,
              textTransform: 'none',
              fontSize: {
                xs: '0.9rem',
                sm: '1rem',
                md: '1.1rem'
              },
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                backgroundColor: 'rgba(20, 33, 61, 0.04)',
                borderColor: '#fca311',
                color: '#fca311',
                borderWidth: 2,
                transform: isMobile ? 'none' : 'translateY(-2px)',
              },
              transition: 'all 0.2s ease-in-out',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Register
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;