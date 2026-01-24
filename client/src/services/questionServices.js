import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/question";

const questionService = {
    getAllQuestions: async (courseId, partId, publisherId, unitId, subunitId, page = 1, limit = 5, types = [], language) => {
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', limit);

            types.forEach(type => {
                params.append('types', type);
            });

            if (Array.isArray(language)) {
                language.forEach(lang => {
                    params.append('language', lang);
                });
            } else if (language) {
                params.append('language', language);
            }

            const response = await axiosInstance.get(
                `${BASE_URL}/get-all-questions/${courseId}/${partId}/${publisherId}/${unitId}/${subunitId}?${params.toString()}`
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },


    addEssayQuestion: async (courseId, partId, publisherId, unitId, subunitId, payload) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/add/essay/${courseId}/${partId}/${publisherId}/${unitId}/${subunitId}`,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    addRapidQuestion: async (courseId, partId, publisherId, unitId, subunitId, payload) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/add/rapid/${courseId}/${partId}/${publisherId}/${unitId}/${subunitId}`,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    addMcqQuestion: async (courseId, partId, publisherId, unitId, subunitId, payload) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/add/mcq/${courseId}/${partId}/${publisherId}/${unitId}/${subunitId}`,
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
                `${BASE_URL}/update-question/${questionId}`,
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
    },

    checkMcqExcel: async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axiosInstance.post(
                `${BASE_URL}/check-mcqs`,
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

    checkRapidExcel: async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axiosInstance.post(
                `${BASE_URL}/check-rapid`,
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

    checkEssayExcel: async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axiosInstance.post(
                `${BASE_URL}/check-essay`,
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

    fetchQuestionsWithFilters: async ({
        publisherId,
        selectedUnits = [],
        selectedSubunits = {},
        page = 1,
        limit = 20,
    }) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/fetch-unit-exam-questions`,
                {
                    publisherId,
                    selectedUnits,
                    selectedSubunits,
                    page,
                    limit
                }
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    fetchPracticeExamQuestions: async ({
        courseId,
        partId,
        examType,
        page,
        limit
    }) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/fetch-practice-exam-questions`,
                {
                    courseId,
                    partId,
                    examType,
                    page,
                    pageSize: limit,
                }
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    fetchStandardReviewQuestions: async ({ courseId, partId, limit = 20, page = 1 }) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/fetch-standard-package-questions`,
                {
                    courseId,
                    partId,
                    limit,
                    page
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    fetchMegaReviewQuestions: async ({ courseId, partId, userLimit = 20, page = 1, pageSize = 20 }) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/fetch-mega-package-questions`,
                {
                    courseId,
                    partId,
                    userLimit,
                    page,
                    pageSize
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    CountQuestionsInPart: async ({ courseId, partId }) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/get-total-question-in-part`,
                {
                    courseId,
                    partId,
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },


};




export default questionService;
