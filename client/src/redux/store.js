import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import loaderSlice from "./loaderSlice";
import logoutSlice from "./logoutSlice";
import userSlice from "./userSlice";
import progressSlice from './progressSlice';

const store = configureStore({
    reducer: {
        theme: themeReducer,
        loader: loaderSlice,
        logout: logoutSlice,
        user: userSlice,
        progress: progressSlice,
    },
});

export default store;