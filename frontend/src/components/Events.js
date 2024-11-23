import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
    getEvents,
    registerUserEvent,
    unregisterUserEvent,
    getUserRegisteredEvents,
} from "../services/api";

const EventsPage = () => {
    const [date, setDate] = useState(new Date()); // Selected date
    const [events, setEvents] = useState([]); // All events
    const [registeredEvents, setRegisteredEvents] = useState([]); // User-registered events
    const [loading, setLoading] = useState(true); // Loading state for events
    const [error, setError] = useState(""); // Error state

    // Fetch all events from the backend
    const fetchEvents = async () => {
        try {
            const response = await getEvents(); // Fetch all events
            setEvents(response);
            setError(""); // Clear any previous errors
        } catch (error) {
            console.error("Error fetching events:", error);
            setError("Failed to load events. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch registered events for the user
    const fetchRegisteredEvents = async () => {
        try {
            const response = await getUserRegisteredEvents(); // Fetch registered events
            setRegisteredEvents(response);
            setError(""); // Clear any previous errors
        } catch (error) {
            console.error("Error fetching registered events:", error);
            setError("Failed to load registered events. Please try again.");
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchEvents();
        fetchRegisteredEvents();
    }, []);

    // Get events for the selected date
    const eventsForSelectedDate = events.filter((event) => {
        const selectedDate = date.toISOString().split("T")[0];
        const startDate = event.start_time.split("T")[0];
        const endDate = event.end_time.split("T")[0];
        return selectedDate >= startDate && selectedDate <= endDate;
    });

    // Handle event registration
    const handleRegister = async (eventId) => {
        try {
            const response = await registerUserEvent(eventId); // Register user for event
            alert(response.message); // Show success message
            fetchRegisteredEvents(); // Refresh registered events
        } catch (error) {
            console.error("Error registering for event:", error);
            alert(
                error.response?.data?.error || "An error occurred while registering. Please try again."
            );
        }
    };

    // Handle unregistering from an event
    const handleUnregister = async (eventId) => {
        try {
            const response = await unregisterUserEvent(eventId); // Unregister user from event
            alert(response.message); // Show success message
            fetchRegisteredEvents(); // Refresh registered events
        } catch (error) {
            console.error("Error unregistering from event:", error);
            alert(
                error.response?.data?.error || "An error occurred while unregistering. Please try again."
            );
        }
    };

    // Styles
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
        registerButton: {
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "5px 10px",
            cursor: "pointer",
        },
        unregisterButton: {
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "5px 10px",
            cursor: "pointer",
            marginLeft: "10px", // Add spacing to avoid cramping
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
                {/* Calendar Component */}
                <div style={styles.calendar}>
                    <Calendar
                        onChange={setDate} // Updates the selected date
                        value={date}
                    />
                </div>

                {/* Events on the selected date */}
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
                                <button
                                    style={styles.registerButton}
                                    onClick={() => handleRegister(event.event_id)}
                                >
                                    Register
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No events for this day.</p>
                )}

                {/* All Events */}
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
                                <button
                                    style={styles.registerButton}
                                    onClick={() => handleRegister(event.event_id)}
                                >
                                    Register
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No events available.</p>
                )}
            </div>

            {/* Registered Events */}
            <div style={styles.registeredEvents}>
                <h2>Your Registered Events:</h2>
                {loading ? (
                    <p style={styles.loading}>Loading registered events...</p>
                ) : registeredEvents.length > 0 ? (
                    <ul style={styles.eventsList}>
                        {registeredEvents.map((event) => (
                            <li key={event.event_id} style={styles.registeredEventItem}>
                                <span>
                                    {event.title} <br />
                                    Start: {new Date(event.start_time).toLocaleString()} <br />
                                    End: {new Date(event.end_time).toLocaleString()}
                                </span>
                                <button
                                    style={styles.unregisterButton}
                                    onClick={() => handleUnregister(event.event_id)}
                                >
                                    Unregister
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>You are not registered for any events.</p>
                )}
            </div>

            {error && <p style={styles.errorMessage}>{error}</p>}
        </div>
    );
};

export default EventsPage;
