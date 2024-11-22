import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Base styles for react-calendar
import Axios from 'axios';

const EventsPage = () => {
    const [date, setDate] = useState(new Date()); // Selected date
    const [events, setEvents] = useState([]); // All events
    const [registeredEvents, setRegisteredEvents] = useState([]); // User-registered events
    const [loading, setLoading] = useState(true); // Loading state for events
    const [error, setError] = useState(''); // Error state
    const [userToken, setUserToken] = useState(localStorage.getItem('authToken')); // Authentication token

    // Fetch events from the backend
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await Axios.get('http://127.0.0.1:8000/api/events/', {
                    headers: {
                        'Authorization': `Token ${userToken}`,
                    },
                });
                setEvents(response.data);
                setError(''); // Clear any previous errors
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Failed to load events. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [userToken]); // Empty dependency array ensures this only runs once when the component mounts

    // Get events for the selected date
    const eventsForSelectedDate = events.filter(
        (event) => event.start_time.split('T')[0] === date.toISOString().split('T')[0]
    );

    // Handle event registration
    const handleRegister = async (eventId) => {
        try {
            // Ensure the eventId is valid
            if (!eventId) {
                alert('Invalid event ID');
                return;
            }
    
            // Send the POST request to the backend to register for the event
            const response = await Axios.post(
                `http://127.0.0.1:8000/api/auth/event/${eventId}/register/`,
                {}, // Empty body if not required by the backend
                {
                    headers: {
                        'Authorization': `Token ${userToken}`, // Ensure you send the correct token
                    },
                }
            );
    
            // Handle successful registration
            if (response.status === 201) {
                alert('Successfully registered for the event!');
                // Optionally, fetch registered events again to update the UI
                fetchRegisteredEvents();
            } else {
                alert('Error registering for event: ' + response.data.error);
            }
        } catch (error) {
            console.error('Error registering for event:', error);
            alert('An error occurred while registering for the event. Please try again.');
        }
    };

    // Fetch events the user is registered for
    const fetchRegisteredEvents = async () => {
        try {
            const response = await Axios.get('http://127.0.0.1:8000/api/events/', {
                headers: {
                    'Authorization': `Token ${userToken}`,
                },
            });
            const registeredEvents = response.data.filter((event) => event.attendees.includes(userToken));
            setRegisteredEvents(registeredEvents);
        } catch (error) {
            console.error('Error fetching registered events:', error);
        }
    };

    useEffect(() => {
        if (userToken) {
            fetchRegisteredEvents();
        }
    }, [userToken]);

    // Styles
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        },
        calendarAndEvents: {
            flex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        },
        calendar: {
            marginBottom: '20px',
        },
        eventsList: {
            listStyleType: 'none',
            padding: 0,
        },
        eventItem: {
            padding: '10px',
            border: '1px solid #ddd',
            marginBottom: '10px',
            borderRadius: '5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        registerButton: {
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer',
        },
        loading: {
            textAlign: 'center',
            fontSize: '16px',
            color: '#888',
        },
        errorMessage: {
            color: 'red',
            textAlign: 'center',
            marginTop: '20px',
        },
        registeredEvents: {
            marginTop: '20px',
            paddingLeft: '20px',
            borderTop: '1px solid #ddd',
            paddingTop: '20px',
        },
        registeredEventItem: {
            padding: '10px',
            border: '1px solid #ddd',
            marginBottom: '10px',
            borderRadius: '5px',
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
                            <li key={event.id} style={styles.eventItem}>
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
                            <li key={event.id} style={styles.eventItem}>
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

            {/* Registered Events on the right side */}
            <div style={styles.registeredEvents}>
                <h2>Your Registered Events:</h2>
                {loading ? (
                    <p style={styles.loading}>Loading registered events...</p>
                ) : registeredEvents.length > 0 ? (
                    <ul style={styles.eventsList}>
                        {registeredEvents.map((event) => (
                            <li key={event.id} style={styles.registeredEventItem}>
                                <span>
                                    {event.title} <br />
                                    Start: {new Date(event.start_time).toLocaleString()} <br />
                                    End: {new Date(event.end_time).toLocaleString()}
                                </span>
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
