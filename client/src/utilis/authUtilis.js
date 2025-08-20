import Cookies from 'js-cookie';
import { menuItems } from '../constants/menuItems';

const isAuthenticated = () => {
    const token = Cookies.get('course-managment-jwt-token');
    return !!token;
};

const normalizePath = (path) => {
    return path.replace(/\/+$/, '');
};

const verifyAuthorization = (role) => {
    console.log('Verifying...', role);
    const currentPath = normalizePath(window.location.pathname);
    if (currentPath === '') {
        return true;
    }
    const allowedPages = menuItems[role]?.map(item => item.path) || [];

    return allowedPages.includes(currentPath);
};

export { isAuthenticated, verifyAuthorization };