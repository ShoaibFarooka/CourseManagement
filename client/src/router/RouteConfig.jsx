import Login from "../pages/admin/Login/Login";
import DashBoard from '../pages/admin/Dashboard/Dashboard';
import Questions from '../pages/admin/Questions/Questions';
import NotFound from '../pages/common/NotFound/NotFound';
const routes = [
    //Admin
    { path: "/admin/login", element: <Login />, protected: false, authRedirect: true, showHeader: false, showFooter: false },
    { path: "/admin/dashboard", element: <DashBoard />, protected: true, authRedirect: false, showHeader: true, showFooter: true },
    { path: "/admin/questions", element: <Questions />, protected: true, authRedirect: false, showHeader: true, showFooter: true },
    { path: "*", element: <NotFound />, protected: false, authRedirect: false, showHeader: false, showFooter: false },

    //common
    /*  { path: "/", element: <Home />, protected: false, authRedirect: false, showHeader: true, showFooter: true }, */
];

export default routes;