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
        { path: '/forgot-password' },
        { path: 'reset-password' },
        { path: '/otp-verification' },
        { path: '/About-Us' },
        { path: '/Contact-Us' },
        { path: "/courses/:exam" },
        { path: '/course' },
        { path: '/quiz' }
    ]
};