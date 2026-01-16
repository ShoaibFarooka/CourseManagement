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
        { path: '/courses' },
        { path: '/courses/dashboard' },
        { path: '/courses/unit-exams' },
        { path: '/courses/practice-exams' },
        { path: '/courses/package-exams' },
        { path: '/quiz' },
        { path: '/progress-report' },
    ]
};