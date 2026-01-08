import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/payment-request";

const paymentRequestService = {
    createRequest: async (payload) => {
        try {
            const response = await axiosInstance.post(
                BASE_URL,
                payload,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },

    getAllRequests: async (page = 1, limit = 5, status = "all") => {
        try {
            const response = await axiosInstance.get(BASE_URL, {
                params: { page, limit, status },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            else throw new Error("Network error, server not reachable");
        }
    },

    getRequestsByUser: async (userId) => {
        try {
            const response = await axiosInstance.get(
                `${BASE_URL}/user/${userId}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },


    updateRequestStatus: async (requestId, payload) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/update/${requestId}`,
                payload,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },

    deleteRequest: async (requestId) => {
        try {
            const response = await axiosInstance.delete(
                `${BASE_URL}/${requestId}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },
};

export default paymentRequestService;
