import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getEvents } from "../services/api";
import {
  TextField,
  Box,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  InputLabel,
  useTheme,
  useMediaQuery,
  Container,
} from "@mui/material";
import { Search } from "@mui/icons-material";

const EventsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const fetchEvents = async () => {
    try {
      const response = await getEvents();
      setEvents(response);
      setError("");
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filterEvents = (eventsList) => {
    let filtered = eventsList.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const now = new Date();
    switch (filterType) {
      case "upcoming":
        filtered = filtered.filter((event) => new Date(event.start_time) > now);
        break;
      case "past":
        filtered = filtered.filter((event) => new Date(event.end_time) < now);
        break;
      default:
        break;
    }

    return filtered;
  };

  const eventsForSelectedDate = events.filter((event) => {
    const selectedDate = date.toISOString().split("T")[0];
    const startDate = event.start_time.split("T")[0];
    const endDate = event.end_time.split("T")[0];
    return selectedDate >= startDate && selectedDate <= endDate;
  });

  const allFilteredEvents = filterEvents(events);

  const styles = {
    container: {
      padding: {
        xs: "10px",
        sm: "15px",
        md: "20px"
      },
      fontFamily: "Arial, sans-serif",
    },
    calendarAndEvents: {
      display: "flex",
      flexDirection: "column",
      gap: { xs: 2, sm: 3 },
    },
    calendar: {
      margin: "0 auto",
      maxWidth: "100%",
      overflow: "auto",
      "& .react-calendar": {
        width: "100%",
        maxWidth: { xs: "100%", sm: "600px" },
        margin: "0 auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: { xs: "0.5rem", sm: "1rem" },
        "& button": {
          padding: { xs: "0.5rem", sm: "0.75rem" },
          fontSize: { xs: "0.875rem", sm: "1rem" },
        },
        "& .react-calendar__tile--active": {
          backgroundColor: "#14213d",
          "&:hover": {
            backgroundColor: "#fca311",
          },
        },
      },
    },
    filterBox: {
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      alignItems: { xs: "stretch", sm: "center" },
      gap: 2,
    },
    searchField: {
      flex: { sm: 1 },
      backgroundColor: "white",
      borderRadius: "4px",
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#14213d",
        },
        "&:hover fieldset": {
          borderColor: "#fca311",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#14213d",
        },
      },
    },
    select: {
      width: { xs: "100%", sm: 200 },
      backgroundColor: "white",
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#14213d",
        },
        "&:hover fieldset": {
          borderColor: "#fca311",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#14213d",
        },
      },
    },
    card: {
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      padding: { xs: "0.5rem", sm: "1rem" },
      marginBottom: { xs: "15px", sm: "20px" },
    },
    eventsList: {
      listStyleType: "none",
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: { xs: 1, sm: 2 },
    },
    eventItem: {
      padding: { xs: "8px", sm: "10px" },
      border: "1px solid #ddd",
      borderRadius: "5px",
      backgroundColor: "white",
      "& span": {
        fontSize: { xs: "0.875rem", sm: "1rem" },
      },
    },
    header: {
      color: "#14213d",
      fontWeight: "bold",
      fontSize: { xs: "1.25rem", sm: "1.5rem" },
      marginBottom: { xs: 1, sm: 2 },
    },
    loading: {
      textAlign: "center",
      fontSize: { xs: "0.875rem", sm: "1rem" },
      color: "#888",
      py: 2,
    },
    errorMessage: {
      color: "error.main",
      textAlign: "center",
      marginTop: { xs: 2, sm: 3 },
      fontSize: { xs: "0.875rem", sm: "1rem" },
    },
  };

  return (
    <Container maxWidth="lg" sx={styles.container}>
      <Box sx={styles.calendarAndEvents}>
        <Card sx={styles.card}>
          <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={styles.header}>
              Filter Events
            </Typography>
            <Box sx={styles.filterBox}>
              <TextField
                placeholder="Search events..."
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={styles.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size={isMobile ? "small" : "medium"} sx={styles.select}>
                <InputLabel>Event Filter</InputLabel>
                <Select
                  value={filterType}
                  label="Event Filter"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Events</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="past">Past</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        <Box sx={styles.calendar}>
          <Calendar onChange={setDate} value={date} />
        </Box>

        <Card sx={styles.card}>
          <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={styles.header}>
              Events on {date.toDateString()}:
            </Typography>
            {loading ? (
              <Typography sx={styles.loading}>Loading events...</Typography>
            ) : eventsForSelectedDate.length > 0 ? (
              <Box component="ul" sx={styles.eventsList}>
                {eventsForSelectedDate.map((event) => (
                  <Box component="li" key={event.event_id} sx={styles.eventItem}>
                    <span>
                      <Typography variant={isMobile ? "subtitle2" : "subtitle1"} gutterBottom>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start: {new Date(event.start_time).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        End: {new Date(event.end_time).toLocaleString()}
                      </Typography>
                    </span>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography align="center">No events for this day.</Typography>
            )}
          </CardContent>
        </Card>

        {/* All Events section */}
        <Card sx={styles.card}>
          <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={styles.header}>
              All Events
            </Typography>
            {loading ? (
              <Typography sx={styles.loading}>Loading all events...</Typography>
            ) : allFilteredEvents.length > 0 ? (
              <Box component="ul" sx={styles.eventsList}>
                {allFilteredEvents.map((event) => (
                  <Box component="li" key={event.event_id} sx={styles.eventItem}>
                    <span>
                      <Typography variant={isMobile ? "subtitle2" : "subtitle1"} gutterBottom>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start: {new Date(event.start_time).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        End: {new Date(event.end_time).toLocaleString()}
                      </Typography>
                    </span>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography align="center">No events found matching your criteria.</Typography>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card sx={{ mt: 2, bgcolor: 'error.light' }}>
            <CardContent>
              <Typography color="error" sx={styles.errorMessage}>
                {error}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default EventsPage;
