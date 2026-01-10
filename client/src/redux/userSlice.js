import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ShowLoading, HideLoading } from './loaderSlice';
import userService from '../services/userServices';
import deviceRequestService from '../services/deviceRequestService';
import paymentRequestService from '../services/paymentRequestService';
import { getBasicDeviceInfo } from '../utilis/deviceInfoUtils';


export const fetchUserInfo = createAsyncThunk(
    'user/fetchUserInfo',
    async (_, { dispatch, rejectWithValue }) => {
        dispatch(ShowLoading());
        try {
            const res = await userService.getUserInfo();
            return res.user;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        } finally {
            dispatch(HideLoading());
        }
    }
);

export const fetchAllowedDevices = createAsyncThunk(
    'user/fetchAllowedDevices',
    async (_, { dispatch, rejectWithValue }) => {
        dispatch(ShowLoading());
        try {
            const res = await deviceRequestService.getUserDevices()
            return res.devices.devices || [];
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        } finally {
            dispatch(HideLoading());
        }
    }
);


export const fetchPurchasedCourses = createAsyncThunk(
    'user/fetchPurchasedCourses',
    async (_, { dispatch, rejectWithValue }) => {
        dispatch(ShowLoading());
        try {
            const res = await paymentRequestService.getUserPayments();
            console.log(res.requests);
            const courses = res.requests.map(payment => ({
                paymentId: payment._id,
                courseId: payment.course._id,
                courseName: payment.course.name,
                partId: payment.part,
                partName: payment.part.name,
                startDate: payment.startDate,
                expiryDate: payment.expiryDate,
                amount: payment.amount
            }));
            return courses;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        } finally {
            dispatch(HideLoading());
        }
    }
);

export const checkCurrentDeviceStatus = createAsyncThunk(
    'user/checkCurrentDeviceStatus',
    async (_, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState();
            let allowedDevices = state.user.allowedDevices || [];

            if (allowedDevices.length === 0) {
                const result = await dispatch(fetchAllowedDevices()).unwrap()
                allowedDevices = result || [];
            }

            const deviceInfo = await getBasicDeviceInfo();
            const isAllowed = allowedDevices.some(
                d => String(d.deviceId).trim() === String(deviceInfo.visitorId).trim()
            );

            return isAllowed;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


const initialState = {
    user: null,
    allowedDevices: [],
    purchasedCourses: [],
    currentDeviceStatus: false,
    loading: {
        user: false,
        devices: false,
        courses: false,
        deviceCheck: false
    },
    errors: {
        user: null,
        devices: null,
        courses: null,
        deviceCheck: null
    }
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUser(state) {
            state.user = null;
            state.allowedDevices = [];
            state.purchasedCourses = [];
            state.currentDeviceStatus = false;
            state.loading = { user: false, devices: false, courses: false, deviceCheck: false };
            state.errors = { user: null, devices: null, courses: null, deviceCheck: null };
        },
        setCurrentDeviceStatus(state, action) {
            state.currentDeviceStatus = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // User info
            .addCase(fetchUserInfo.pending, (state) => {
                state.loading.user = true;
                state.errors.user = null;
            })
            .addCase(fetchUserInfo.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading.user = false;
            })
            .addCase(fetchUserInfo.rejected, (state, action) => {
                state.errors.user = action.payload || "Failed to fetch user info";
                state.loading.user = false;
            })

            // Allowed devices
            .addCase(fetchAllowedDevices.pending, (state) => {
                state.loading.devices = true;
                state.errors.devices = null;
            })
            .addCase(fetchAllowedDevices.fulfilled, (state, action) => {
                state.allowedDevices = action.payload;
                state.loading.devices = false;
            })
            .addCase(fetchAllowedDevices.rejected, (state, action) => {
                state.errors.devices = action.payload || "Failed to fetch devices";
                state.loading.devices = false;
            })

            // Purchased courses
            .addCase(fetchPurchasedCourses.pending, (state) => {
                state.loading.courses = true;
                state.errors.courses = null;
            })
            .addCase(fetchPurchasedCourses.fulfilled, (state, action) => {
                state.purchasedCourses = action.payload;
                state.loading.courses = false;
            })
            .addCase(fetchPurchasedCourses.rejected, (state, action) => {
                state.errors.courses = action.payload || "Failed to fetch purchased courses";
                state.loading.courses = false;
            })

            // Device status
            .addCase(checkCurrentDeviceStatus.pending, (state) => {
                state.loading.deviceCheck = true;
                state.errors.deviceCheck = null;
            })
            .addCase(checkCurrentDeviceStatus.fulfilled, (state, action) => {
                state.currentDeviceStatus = action.payload; // true/false
                state.loading.deviceCheck = false;
            })
            .addCase(checkCurrentDeviceStatus.rejected, (state, action) => {
                state.errors.deviceCheck = action.payload || "Failed to check device status";
                state.loading.deviceCheck = false;
            });
    }
});

export const { clearUser, setCurrentDeviceStatus } = userSlice.actions;
export default userSlice.reducer;
