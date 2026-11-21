import axiosInstance from "./axiosInstance";

export const getNotifications = async (params = {}) => {
  const { data } = await axiosInstance.get("/notifications/", { params });
  return data;
};

export const markNotificationRead = async (id) => {
  const { data } = await axiosInstance.patch(`/notifications/${id}/`, { is_read: true });
  return data;
};