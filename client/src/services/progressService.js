import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/progress";

const progressService = {
    recordAnswerBatch: async (answers) => {
        const response = await axiosInstance.post(`${BASE_URL}/record-answer`, {
            answers,
        });
        return response.data;
    },

    getUnitProgress: async ({ courseId, partId, publisherId, unitId }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/single-unit-progress`, {
                params: { courseId, partId, publisherId, unitId },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },


    getAllUnitsProgress: async ({ courseId, partId, publisherId }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/unit-progress`, {
                params: { courseId, partId, publisherId },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAllSubunitsProgress: async ({ courseId, partId, publisherId, unitId }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/subunit-progress`, {
                params: { courseId, partId, publisherId, unitId },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getContinueSession: async ({ courseId, partId, publisherId, unitId }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/session/continue`, {
                params: { courseId, partId, publisherId, unitId },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getStartOverSession: async ({ courseId, partId, publisherId, unitId }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/session/start-over`, {
                courseId,
                partId,
                publisherId,
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
                params: { courseId, partId, publisherId, unitId },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default progressService;