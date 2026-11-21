import axiosInstance from "./axiosInstance";

export const getAssignments = async (params = {}) => {
  const { data } = await axiosInstance.get("/assignments/", { params });
  return data;
};

export const getAssignment = async (id) => {
  const { data } = await axiosInstance.get(`/assignments/${id}/`);
  return data;
};

export const createAssignment = async (payload) => {
  const { data } = await axiosInstance.post("/assignments/", payload);
  return data;
};

export const updateAssignment = async (id, payload) => {
  const { data } = await axiosInstance.patch(`/assignments/${id}/`, payload);
  return data;
};

export const deleteAssignment = async (id) => {
  await axiosInstance.delete(`/assignments/${id}/`);
};

export const getSubjects = async () => {
  const { data } = await axiosInstance.get("/subjects/");
  return data;
};

export const createSubject = async (payload) => {
  const { data } = await axiosInstance.post("/subjects/", payload);
  return data;
};

export const deleteSubject = async (id) => {
  await axiosInstance.delete(`/subjects/${id}/`);
};

export const getCategories = async () => {
  const { data } = await axiosInstance.get("/categories/");
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await axiosInstance.post("/categories/", payload);
  return data;
};

export const deleteCategory = async (id) => {
  await axiosInstance.delete(`/categories/${id}/`);
};