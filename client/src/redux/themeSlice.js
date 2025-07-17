import { createSlice } from '@reduxjs/toolkit';

const savedTheme = localStorage.getItem('appTheme') || 'light';

const initialState = {
    theme: savedTheme,
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme(state) {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('appTheme', state.theme);
        },
        setTheme(state, action) {
            state.theme = action.payload;
            localStorage.setItem('appTheme', state.theme);
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
