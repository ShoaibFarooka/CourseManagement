import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/payment-request";

const paymentRequestService = {
    createPaymentRequest: async (courseId, partId) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/create-request`,
                {
                    courseId,
                    partId
                },
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },

    getAllRequests: async (page = 1, limit = 5, status = "all") => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/fetch-all-requests`, {
                params: { page, limit, status },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw (error);
        }
    },

    getRequestById: async (paymentId) => {
        try {
            const response = await axiosInstance.get(
                `${BASE_URL}/fetch-request/${paymentId}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },

    getRequestsByUser: async (userId) => {
        try {
            const response = await axiosInstance.get(
                `${BASE_URL}/fetch-user-request/${userId}`,
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
                `${BASE_URL}/update-payment/${requestId}`,
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
                `${BASE_URL}/delete-payment/${requestId}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },
};

export default paymentRequestService;
