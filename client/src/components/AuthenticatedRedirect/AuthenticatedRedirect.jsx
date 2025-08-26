import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../utilis/authUtilis";
import { useSelector } from "react-redux";

const AuthenticatedRedirect = ({ children, ...rest }) => {
    const location = useLocation();
    const isAuth = isAuthenticated();
    const { user } = useSelector((state) => state.user);

    if (isAuth) {
        if (user?.role === "admin" && location.pathname !== "/admin/courses") {
            return (
                <Navigate
                    to="/admin/courses"
                    replace
                    state={{ from: location }}
                />
            );
        }

        if (user?.role === "user" && location.pathname !== "/") {
            return (
                <Navigate
                    to="/home"
                    replace
                    state={{ from: location }}
                />
            );
        }
    }

    return React.cloneElement(children, { ...rest });
};

export default AuthenticatedRedirect;
