import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LessonsList = ({ courseId }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch lessons for the specific course when the component mounts
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/courses/${courseId}/lessons/`);
        setLessons(response.data); // Set lessons data to state
        setLoading(false);
      } catch (err) {
        setError('Error fetching lessons');
        setLoading(false);
      }
    };

    fetchLessons();
  }, [courseId]); // Re-run the effect if courseId changes

  if (loading) return <div>Loading lessons...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="lessons-list">
      <h2>Lessons for this Course:</h2>
      {lessons.length === 0 ? (
        <p>No lessons available for this course.</p>
      ) : (
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson.id} className="lesson-item">
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <p>{lesson.content}</p>
              {lesson.video_url && (
                <a href={lesson.video_url} target="_blank" rel="noopener noreferrer">
                  Watch Video
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LessonsList;
