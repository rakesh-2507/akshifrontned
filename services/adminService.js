// services/adminService.js
import api from './api';

// Fetch unapproved residents
export const fetchPendingResidents = async (token) => {
  const res = await api.get('/admin/pending-residents', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Approve a resident
export const approveResident = async (userId, token) => {
  const res = await api.post(
    `/admin/approve-resident/${userId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
