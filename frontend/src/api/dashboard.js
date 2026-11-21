import axiosInstance from "./axiosInstance";

export const getDashboardStats = async () => {
  const { data } = await axiosInstance.get("/dashboard-stats/");
  return data;
};

export const getStudyPlan = async () => {
  const { data } = await axiosInstance.get("/study-plan/");
  return data;
};