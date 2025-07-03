import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/question";

const questionService = {
    // ✅ Get all questions for a specific subunit
    getAllQuestions: async (subunitId) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/get-all/${subunitId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },



    // ✅ Add an essay question
    addEssayQuestion: async (subunitId, publisherId, payload) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/add/essay/${subunitId}/${publisherId}`,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ✅ Add a rapid question
    addRapidQuestion: async (subunitId, publisherId, payload) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/add/rapid/${subunitId}/${publisherId}`,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ✅ Add a multiple choice question
    addMcqQuestion: async (subunitId, publisherId, payload) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/add/mcq/${subunitId}/${publisherId}`,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ✅ Update a question by ID
    updateQuestion: async (questionId, payload) => {
        try {
            const response = await axiosInstance.put(
                `${BASE_URL}/update/${questionId}`,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ✅ Delete a question by ID
    deleteQuestion: async (questionId) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/delete/${questionId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};



export default questionService;
