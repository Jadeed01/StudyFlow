import axiosInstance from "./axiosInstance";

export const getStudySessions = async (params = {}) => {
  const { data } = await axiosInstance.get("/study-sessions/", { params });
  return data;
};

export const createStudySession = async (payload) => {
  const { data } = await axiosInstance.post("/study-sessions/", payload);
  return data;
};

export const updateStudySession = async (id, payload) => {
  const { data } = await axiosInstance.patch(`/study-sessions/${id}/`, payload);
  return data;
};

export const deleteStudySession = async (id) => {
  await axiosInstance.delete(`/study-sessions/${id}/`);
};