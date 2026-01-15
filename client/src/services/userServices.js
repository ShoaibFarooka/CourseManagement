import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/user";
const token = localStorage.getItem("course-managment-jwt-token");

const userService = {
    loginUser: async (payload) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/login`, payload, {
                withCredentials: true,
                skipAuthRefresh: true,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    registerUser: async (formData, userType) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/${userType}-register`,
                formData,
                {
                    withCredentials: true,
                    skipAuthRefresh: true,
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },


    forgotPassword: async (payload) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/forgot-password`,
                payload,
                { withCredentials: true, skipAuthRefresh: true }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    verifyResetToken: async (token) => {
        try {
            const response = await axiosInstance.get(
                `${BASE_URL}/verify-reset-token/${token}`,
                { withCredentials: true, skipAuthRefresh: true }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (payload) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/reset-password`,
                payload,
                { withCredentials: true, skipAuthRefresh: true }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    refreshToken: async (payload) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/refresh-token`,
                payload,
                { withCredentials: true, skipAuthRefresh: true }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    logoutUser: async (payload) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/logout`, payload, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getUserInfo: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/fetch-user-info`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateUserInfo: async (payload) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/update-user-info`,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateUserProfileImage: async (payload) => {
        try {
            const token = localStorage.getItem("course-managment-jwt-token");
            const response = await axiosInstance.patch(
                `${BASE_URL}/update-user-profile-Image`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    },
                    withCredentials: true
                }

            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    changeUserPassword: async (payload) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/change-user-password`,
                payload
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    sendContactForm: async (payload) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/Contact-Us`,
                payload,
                { withCredentials: false }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },
};

export default userService;