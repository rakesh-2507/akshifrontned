import api from './api';

export const raiseComplaint = async (data, token) => {
  try {
    const res = await api.post('/chat/complaints', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('❌ Complaint Submit Failed:', err.response?.data || err.message);
    throw err;
  }
};

export const getMyComplaints = async (token) => {
  try {
    const res = await api.get('/chat/complaints', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error('❌ Fetch Complaints Failed:', err.response?.data || err.message);
    throw err;
  }
};
