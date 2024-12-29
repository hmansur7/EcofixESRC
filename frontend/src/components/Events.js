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
  Paper,
} from "@mui/material";
import { Search } from "@mui/icons-material";

const EventsPage = () => {
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
      display: "flex",
      justifyContent: "space-between",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    calendarAndEvents: {
      flex: 2,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    calendar: {
      marginBottom: "20px",
      margin: "0 auto",
    },
    eventsList: {
      listStyleType: "none",
      padding: 0,
    },
    eventItem: {
      padding: "10px",
      border: "1px solid #ddd",
      marginBottom: "10px",
      borderRadius: "5px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    loading: {
      textAlign: "center",
      fontSize: "16px",
      color: "#888",
    },
    errorMessage: {
      color: "red",
      textAlign: "center",
      marginTop: "20px",
    },
    registeredEvents: {
      marginTop: "20px",
      paddingLeft: "20px",
      borderTop: "1px solid #ddd",
      paddingTop: "20px",
    },
    registeredEventItem: {
      padding: "10px",
      border: "1px solid #ddd",
      marginBottom: "10px",
      borderRadius: "5px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    filterContainer: {
      marginBottom: 20,
      padding: 20,
      backgroundColor: "#f5f5f5",
      borderRadius: 8,
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    searchField: {
        flex: 1,
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
      minWidth: 200,
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.calendarAndEvents}>
        <Paper elevation={3} style={styles.filterContainer}>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              placeholder="Search events..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" style={styles.select}>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Events</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="past">Past</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        <div style={styles.calendar}>
          <Calendar onChange={setDate} value={date} />
        </div>

        <Typography variant="h5" gutterBottom>
          Events on {date.toDateString()}:
        </Typography>
        {loading ? (
          <p style={styles.loading}>Loading events...</p>
        ) : eventsForSelectedDate.length > 0 ? (
          <ul style={styles.eventsList}>
            {eventsForSelectedDate.map((event) => (
              <li key={event.event_id} style={styles.eventItem}>
                <span>
                  {event.title} <br />
                  Start: {new Date(event.start_time).toLocaleString()} <br />
                  End: {new Date(event.end_time).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No events for this day.</p>
        )}

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          All Events:
        </Typography>
        {loading ? (
          <p style={styles.loading}>Loading all events...</p>
        ) : allFilteredEvents.length > 0 ? (
          <ul style={styles.eventsList}>
            {allFilteredEvents.map((event) => (
              <li key={event.event_id} style={styles.eventItem}>
                <span>
                  {event.title} <br />
                  Start: {new Date(event.start_time).toLocaleString()} <br />
                  End: {new Date(event.end_time).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No events found matching your criteria.</p>
        )}
      </div>

      {error && <p style={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default EventsPage;
