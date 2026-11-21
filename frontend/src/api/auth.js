import axiosInstance from "./axiosInstance";

export const login = async (username, password) => {
  const { data } = await axiosInstance.post("/auth/login/", { username, password });
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  return data;
};

export const register = async (username, email, password) => {
  const { data } = await axiosInstance.post("/auth/register/", { username, email, password });
  return data;
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const getProfile = async () => {
  const { data } = await axiosInstance.get("/auth/profile/");
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await axiosInstance.patch("/auth/profile/", payload);
  return data;
};