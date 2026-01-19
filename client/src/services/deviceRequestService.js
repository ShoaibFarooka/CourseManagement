import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/device-request";

const deviceRequestService = {
    createDeviceRequest: async (payload) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/create-request`, payload, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },

    getAllDevicesRequests: async (page = 1, limit = 5, filter = "all") => {
        try {
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", limit);
            params.append("filter", filter);

            const response = await axiosInstance.get(
                `${BASE_URL}/fetch-all-requests?${params.toString()}`,
                { withCredentials: true }
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },


    approveDeviceRequest: async (requestId) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/approve-device/${requestId}`, {}, { withCredentials: true });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    rejectDeviceRequest: async (requestId) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/reject-device/${requestId}`, {}, { withCredentials: true });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    overwriteDeviceRequest: async (requestId, targetDeviceId) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/overwrite-device/${requestId}`,
                targetDeviceId,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    blockUser: async (userId) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/block-user/${userId}`,
                {},
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    unblockUser: async (userId) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/unblock-user/${userId}`,
                {},
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },


    removeUserDevice: async (userId, deviceId) => {
        try {
            const response = await axiosInstance.delete(
                `${BASE_URL}/user-device/${userId}/${deviceId}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },


    getUserDevices: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/user-devices`, {
                withCredentials: true,
            });
            return { devices: response.data }
        } catch (error) {
            throw error;
        }
    },

    deleteDeviceRequest: async (requestId) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/delete-device-request/${requestId}`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },


    fetchUserDevicesById: async (userId) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/user-devices/${userId}`, {
                withCredentials: true,
            });
            return { devices: response.data }
        } catch (error) {
            throw error;
        }
    },
};

export default deviceRequestService;
