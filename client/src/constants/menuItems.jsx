export const menuItems = {
    admin: [
        { path: '/admin/courses' },
        { path: '/admin/questions' },
        { path: '/admin/requests' }
    ],
    user: [
        { path: '/' },
        { path: '/login' },
        { path: '/signup' },
        { path: '/forget-password' },
        { path: 'reset-password' },
        { path: '/About-Us' },
        { path: '/Contact-Us' },
        { path: "/courses/:exam" },
    ]
};