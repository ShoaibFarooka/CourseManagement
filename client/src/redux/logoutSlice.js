import { createSlice } from '@reduxjs/toolkit';

export const logoutSlice = createSlice({
    name: 'logout',
    initialState: {
        hasLoggedOut: false,
    },
    reducers: {
        setLoggedOut: state => {
            state.hasLoggedOut = true;
        }
    },
});

export const { setLoggedOut } = logoutSlice.actions;

export default logoutSlice.reducer;