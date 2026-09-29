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

            if (res.user?.isBlocked === true) {
                return rejectWithValue({
                    message: "Your account has been blocked. Please contact support."
                });
            }
            return res.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || error.message
            );
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
            const courses = res.requests.map(payment => ({
                paymentId: payment._id,
                courseId: payment.course._id,
                courseName: payment.course.name,
                partId: payment.part,
                startDate: payment.startDate,
                expiryDate: payment.expiryDate,
                amount: payment.amount,
                isCancelled: payment.isCancelled,
                cancelledAt: payment.cancelledAt
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
            let { user } = getState().user;
            if (!user) {
                const userResult = await dispatch(fetchUserInfo()).unwrap();
                user = userResult;
            }
            if (user?.deviceVerificationBypass) {
                return true;
            }
            const deviceInfo = await getBasicDeviceInfo();
            const res = await deviceRequestService.checkDeviceStatus(deviceInfo.visitorId);
            return res.isAllowed;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


const initialState = {
    user: null,
    purchasedCourses: [],
    currentDeviceStatus: false,
    loading: {
        user: false,
        courses: false,
        deviceCheck: false
    },
    errors: {
        user: null,
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
            state.purchasedCourses = [];
            state.currentDeviceStatus = false;
            state.loading = { user: false, courses: false, deviceCheck: false };
            state.errors = { user: null, courses: null, deviceCheck: null };
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
                state.user = {
                    ...action.payload,
                    language: action.payload?.language || "eng"
                };
                state.loading.user = false;
            })
            .addCase(fetchUserInfo.rejected, (state, action) => {
                state.errors.user = action.payload || "Failed to fetch user info";
                state.loading.user = false;
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