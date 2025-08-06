import api from './api';

export const fetchProfileData = async (token) => {
  try {
    const res = await api.get('/profile/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw error;
  }
};

export const addFamily = async (data, token) => {
  return await api.post('/profile/family', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addDailyHelp = async (data, token) => {
  return await api.post('/profile/daily-help', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addVehicle = async (data, token) => {
  return await api.post('/profile/vehicles', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addPet = async (data, token) => {
  return await api.post('/profile/pets', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addAddress = async (data, token) => {
  return await api.post('/profile/address', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ✅ NEW FUNCTION — Use this to register family as a real user
export const registerFamilyMember = async (data, token) => {
  return await api.post('/auth/register', {
    ...data,
    role: 'resident', // or 'family' depending on your schema
    password: data.password || 'defaultpassword123', // temp password if not provided
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
