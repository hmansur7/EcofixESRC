import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getEvents } from "../services/api";

const EventsPage = () => {
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(""); 

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

    const eventsForSelectedDate = events.filter((event) => {
        const selectedDate = date.toISOString().split("T")[0];
        const startDate = event.start_time.split("T")[0];
        const endDate = event.end_time.split("T")[0];
        return selectedDate >= startDate && selectedDate <= endDate;
    });

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
    };

    return (
        <div style={styles.container}>
            <div style={styles.calendarAndEvents}>
                <div style={styles.calendar}>
                    <Calendar
                        onChange={setDate} 
                        value={date}
                    />
                </div>

                <h2>Events on {date.toDateString()}:</h2>
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

                <h2>All Events:</h2>
                {loading ? (
                    <p style={styles.loading}>Loading all events...</p>
                ) : events.length > 0 ? (
                    <ul style={styles.eventsList}>
                        {events.map((event) => (
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
                    <p>No events available.</p>
                )}
            </div>

            {error && <p style={styles.errorMessage}>{error}</p>}
        </div>
    );
};

export default EventsPage;
