import Login from "../pages/common/Login/Login";
import Courses from '../pages/admin/Courses/Courses';
import Questions from '../pages/admin/Questions/Questions';
import NotFound from '../pages/common/NotFound/NotFound';
import Signup from "../pages/common/Signup/Signup";
import Home from '../pages/common/Home/Home';
import ForgetPassword from "../pages/common/ForgetPassword/ForgetPassword";
import ResetPassword from "../pages/common/ResetPassword/ResetPassword";

const routes = [
    //Admin
    { path: "/admin/Courses", element: <Courses />, protected: true, authRedirect: false, showHeader: true, showFooter: true },
    { path: "/admin/questions", element: <Questions />, protected: true, authRedirect: false, showHeader: true, showFooter: true },

    //common
    { path: "/", element: <Home />, protected: false, authRedirect: true, showHeader: true, showFooter: true },
    { path: "/login", element: <Login />, protected: false, authRedirect: true, showHeader: true, showFooter: true },
    { path: "/signup", element: <Signup />, protected: false, authRedirect: true, showHeader: true, showFooter: true },
    { path: "/forget-password", element: <ForgetPassword />, protected: false, authRedirect: true, showHeader: false, showFooter: false },
    { path: "/reset-password", element: <ResetPassword />, protected: false, authRedirect: true, showHeader: false, showFooter: false },
    { path: "*", element: <NotFound />, protected: false, authRedirect: false, showHeader: false, showFooter: false },
];

export default routes;