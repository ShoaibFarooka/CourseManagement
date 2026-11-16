import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/planner";

const plannerService = {
    getPlannerCourses: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/courses`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getPlan: async (payload) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/get-plan`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createPlan: async (payload) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/create-plan`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getDayQuestions: async (payload) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/day-questions`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    recordDayProgress: async (payload) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/record-progress`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    resetPlan: async (payload) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/reset-plan`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default plannerService;
