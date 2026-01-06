import Login from "../pages/common/Login/Login";
import Courses from '../pages/admin/Courses/Courses';
import Questions from '../pages/admin/Questions/Questions';
import NotFound from '../pages/common/NotFound/NotFound';
import Signup from "../pages/common/Signup/Signup";
import Home from '../pages/common/Home/Home';
import ForgetPassword from "../pages/User/ForgetPassword/ForgetPassword";
import ResetPassword from "../pages/User/ResetPassword/ResetPassword";
import AboutUs from "../pages/common/AboutUs/AboutUs";
import ContactUs from "../pages/common/ContactUs/ContactUs";
import UserCourses from "../pages/common/Courses/Courses";
import PrivacyPolicy from "../pages/common/PrivacyPolicy/PrivacyPolicy";
import Requests from "../pages/admin/Requests/Requests";
import Profile from "../pages/User/Profile/Profile";
import OtpVerification from "../pages/User/otpverification/otpVerification";
import InvalidLink from "../pages/common/InvalidLink/InvalidLink";
import CoursesDashboard from "../pages/User/Courses/CoursesDashboard";
import Quiz from "../pages/User/Quiz/Quiz";
import ProgressReport from "../pages/User/ProgressReport/ProgressReport";

const routes = [
    //Admin
    { path: "/admin/Courses", element: <Courses />, protected: true, authRedirect: false, showHeader: true, showFooter: true },
    { path: "/admin/questions", element: <Questions />, protected: true, authRedirect: false, showHeader: true, showFooter: true },
    { path: "/admin/requests", element: <Requests />, protected: true, authRedirect: false, showHeader: true, showFooter: true },

    //User
    { path: "/forgot-password", element: <ForgetPassword />, protected: false, authRedirect: true, showHeader: true, showFooter: true },
    { path: "/reset-password", element: <ResetPassword />, protected: false, authRedirect: true, showHeader: true, showFooter: true },
    { path: "/otp-verification", element: <OtpVerification />, protected: false, authRedirect: true, showHeader: true, showFooter: true },
    { path: "/profile", element: <Profile />, protected: false, authRedirect: false, showHeader: true, showFooter: true },
    { path: "/courses", element: <CoursesDashboard />, protected: false, authRedirect: false, showHeader: true, showFooter: true },
    { path: "/quiz", element: <Quiz />, protected: false, authRedirect: false, showHeader: true, showFooter: true },
    { path: "/progress-report", element: <ProgressReport />, protected: false, authRedirect: false, showHeader: true, showFooter: true },


    //common
    { path: "/", element: <Home />, protected: false, authRedirect: false, showHeader: true, showFooter: true },
    { path: "/courses/:exam", element: <UserCourses />, protected: false, authRedirect: false, showHeader: true, showFooter: true },
    { path: "/About-Us", element: <AboutUs />, protected: false, authRedirect: false, showHeader: true, showFooter: true },
    { path: "/Contact-Us", element: <ContactUs />, protected: false, authRedirect: false, showHeader: true, showFooter: true },
    { path: "/Privacy-Policy", element: <PrivacyPolicy />, protected: false, authRedirect: false, showHeader: true, showFooter: true },
    { path: "/login", element: <Login />, protected: false, authRedirect: true, showHeader: true, showFooter: true },
    { path: "/signup", element: <Signup />, protected: false, authRedirect: true, showHeader: true, showFooter: true },
    { path: "/invalid-link", element: <InvalidLink />, protected: false, showHeader: true, showFooter: true },
    { path: "*", element: <NotFound />, protected: false, authRedirect: false, showHeader: false, showFooter: false },
];

export default routes;