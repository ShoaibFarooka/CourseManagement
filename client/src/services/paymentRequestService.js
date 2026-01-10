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

    getAllPaymentRequests: async (page = 1, limit = 5, status = "all") => {
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

    getpaymentRequestById: async (requestId) => {
        try {
            const response = await axiosInstance.get(
                `${BASE_URL}/fetch-request/${requestId}`,
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


    approvePaymentRequest: async (requestId, courseId, partId, payload) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/approve-payment-request/${requestId}/${courseId}/${partId}`,
                payload,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },

    rejectPaymentRequest: async (requestId, payload) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/reject-payment-request/${requestId}`,
                payload,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },

    deletepaymentRequest: async (requestId) => {
        try {
            const response = await axiosInstance.delete(
                `${BASE_URL}/delete-payment-request/${requestId}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },
};

export default paymentRequestService;
