import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/request";

const requestService = {
    createDeviceRequest: async (payload) => {
        try {
            const response = await axiosInstance.post(BASE_URL, payload, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },

    getAllRequests: async () => {
        try {
            const response = await axiosInstance.get(BASE_URL, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },

    approveDeviceRequest: async (requestId) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/${requestId}/approve`, {}, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },

    rejectDeviceRequest: async (requestId) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/${requestId}/reject`, {}, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },
};

export default requestService;
