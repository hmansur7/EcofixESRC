import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Base styles for react-calendar

const EventsPage = () => {
    const [date, setDate] = useState(new Date()); // Selected date
    const [events, setEvents] = useState([]); // All events
    const [registeredEvents, setRegisteredEvents] = useState([]); // User-registered events
    const [loading, setLoading] = useState(true); // Loading state for events

    // Fetch events from the backend
    useEffect(() => {
        const fetchEvents = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const response = await fetch('http://127.0.0.1:8000/api/events/', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []); // Empty dependency array ensures this only runs once when the component mounts

    // Get events for the selected date
    const eventsForSelectedDate = events.filter(
        (event) => event.start_time.split('T')[0] === date.toISOString().split('T')[0]
    );

    // Handle event registration
    const handleRegister = (eventId) => {
        const event = events.find((e) => e.id === eventId);
        if (event && !registeredEvents.includes(event)) {
            setRegisteredEvents([...registeredEvents, event]);
            alert(`You have registered for: ${event.title}`);
        } else {
            alert('You are already registered for this event.');
        }
    };

    // Styles
    const styles = {
        container: {
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        },
        calendar: {
            margin: '20px 0',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px',
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
        registerButtonDisabled: {
            backgroundColor: '#ccc',
            color: '#666',
            cursor: 'not-allowed',
        },
        loading: {
            textAlign: 'center',
            fontSize: '16px',
            color: '#888',
        },
    };

    return (
        <div style={styles.container}>
            <h1>Events Page</h1>
            <Calendar
                onChange={setDate} // Updates the selected date
                value={date}
                style={styles.calendar}
            />
            <div style={{ marginTop: '20px' }}>
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
                                    style={
                                        registeredEvents.includes(event)
                                            ? styles.registerButtonDisabled
                                            : styles.registerButton
                                    }
                                    onClick={() => handleRegister(event.id)}
                                    disabled={registeredEvents.includes(event)}
                                >
                                    {registeredEvents.includes(event) ? 'Registered' : 'Register'}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No events for this day.</p>
                )}
            </div>
            <div style={{ marginTop: '40px' }}>
                <h2>All Events:</h2>
                {loading ? (
                    <p style={styles.loading}>Loading events...</p>
                ) : (
                    <ul style={styles.eventsList}>
                        {events.map((event) => (
                            <li key={event.id} style={styles.eventItem}>
                                <span>
                                    {event.title} <br />
                                    Start: {new Date(event.start_time).toLocaleString()} <br />
                                    End: {new Date(event.end_time).toLocaleString()}
                                </span>
                                <button
                                    style={
                                        registeredEvents.includes(event)
                                            ? styles.registerButtonDisabled
                                            : styles.registerButton
                                    }
                                    onClick={() => handleRegister(event.id)}
                                    disabled={registeredEvents.includes(event)}
                                >
                                    {registeredEvents.includes(event) ? 'Registered' : 'Register'}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default EventsPage;
