import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/progress";

const progressService = {
    recordAnswer: async ({ courseId, unitId, questionId, isCorrect }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/record-answer`, {
                courseId,
                unitId,
                questionId,
                isCorrect,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getUnitProgress: async ({ courseId, unitId }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/unit-progress`, {
                params: { courseId, unitId },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getContinueSession: async ({ courseId, unitId }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/session/continue`, {
                params: { courseId, unitId },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getStartOverSession: async ({ courseId, unitId }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/session/start-over`, {
                courseId,
                unitId,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getWrongOnlySession: async ({ courseId, unitId }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/session/wrong-only`, {
                params: { courseId, unitId },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default progressService;