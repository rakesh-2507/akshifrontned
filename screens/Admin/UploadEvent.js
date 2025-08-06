import React, { useState } from 'react';
import api from '../../services/api';

const UploadEvent = () => {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [place, setPlace] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventType || !place || !eventDate || files.length === 0) {
      setMessage('❌ All fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append('eventType', eventType);
    formData.append('place', place);
    formData.append('eventDate', eventDate);
    formData.append('title', title);

    files.forEach(file => {
      formData.append('assets', file);
    });

    try {
      const res = await api.post('/gallery-events/upload-event', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 201) {
        setMessage(res.data.message);
        setEventType('');
        setPlace('');
        setEventDate('');
        setFiles([]);
        setTitle('');
      } else {
        setMessage('❌ Upload failed.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('❌ Upload failed. Try again later.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload Event</h2>
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>

        <label>Event Type:</label>
        <select value={eventType} onChange={(e) => setEventType(e.target.value)} required>
          <option value="">Select</option>
          <option value="Festival">Festival</option>
          <option value="Sports">Sports</option>
          <option value="Community">Community</option>
          <option value="Parties">Parties</option>
          <option value="Others">Others</option>
        </select>

        <label>Event Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />


        <label>Place:</label>
        <input type="text" value={place} onChange={(e) => setPlace(e.target.value)} required />

        <label>Date:</label>
        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />

        <label>Assets:</label>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => setFiles(Array.from(e.target.files))}
          required
        />

        <button type="submit" style={styles.button}>Upload</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '30px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default UploadEvent;
