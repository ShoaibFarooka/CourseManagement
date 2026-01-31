export const menuItems = {
    admin: [
        { path: '/admin/courses' },
        { path: '/admin/questions' },
        { path: '/admin/requests' },
        { path: '/admin/payments' }
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
        { path: '/dashboard' },
        { path: '/dashboard/dashboard' },
        { path: '/dashboard/unit-exams' },
        { path: '/dashboard/practice-exams' },
        { path: '/dashboard/package-exams' },
        { path: '/quiz' },
        { path: '/progress-report' },
    ]
};