import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/course";

const courseService = {
    getAllCourses: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/get-all-courses`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    addCourse: async (payload) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/add-course`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateCourse: async (courseId, payload) => {
        try {
            const response = await axiosInstance.put(`${BASE_URL}/update-course/${courseId}`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    deleteCourse: async (courseId) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/delete-course/${courseId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default courseService;
