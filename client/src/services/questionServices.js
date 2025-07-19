import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/question";

const questionService = {
    getAllQuestions: async (subunitId, page = 1, limit = 5) => {
        try {
            const response = await axiosInstance.get(
                `${BASE_URL}/get-all/${subunitId}?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },



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

    deleteQuestion: async (questionId) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/delete/${questionId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    uploadMcqExcel: async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axiosInstance.post(
                `${BASE_URL}/upload-mcq`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    uploadRapidExcel: async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axiosInstance.post(
                `${BASE_URL}/upload-rapid`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    uploadEssayExcel: async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axiosInstance.post(
                `${BASE_URL}/upload-essay`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    }

};




export default questionService;
