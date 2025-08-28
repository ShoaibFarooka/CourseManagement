import React from 'react'
import './ThemeToggel.css';
import { useSelector } from 'react-redux';
import AdminThemeToggle from '../AdminThemeToggel/AdminThemeToggel';
import UserThemeToggle from '../UserThemeToggel/UserThemeToggel';
const ThemeToggel = () => {

    const { user } = useSelector(state => state.user);
    const role = user?.role || 'guest';
    if (role === 'admin') {
        return <AdminThemeToggle />
    }
    return <UserThemeToggle />
}

export default ThemeToggel
