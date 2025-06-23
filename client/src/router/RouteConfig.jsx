import Login from "../pages/admin/Login/Login";
import DashBoard from '../pages/admin/Dashboard/DashBoard';
const routes = [
    //Admin
    { path: "/admin/login", element: <Login />, protected: false, authRedirect: true, showHeader: false, showFooter: true },
    { path: "/admin/dashboard", element: <DashBoard />, protected: false, authRedirect: false, showHeader: true, showFooter: true },

    //common
    /*  { path: "/", element: <Home />, protected: false, authRedirect: false, showHeader: true, showFooter: true }, */
];

export default routes;