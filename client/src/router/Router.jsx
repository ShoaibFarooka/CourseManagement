import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout/Layout.jsx";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute.jsx";
import AuthenticatedRedirect from "../components/AuthenticatedRedirect/AuthenticatedRedirect.jsx";
import routes from "./RouteConfig.jsx";

const renderRouteElement = (route, isChild = false) => {
    let content = route.element;

    if (route.protected) {
        content = <ProtectedRoute>{content}</ProtectedRoute>;
    } else if (route.authRedirect) {
        content = <AuthenticatedRedirect>{content}</AuthenticatedRedirect>;
    }

    if (!isChild) {
        content = (
            <Layout showHeader={route.showHeader} showFooter={route.showFooter}>
                {content}
            </Layout>
        );
    }

    return content;
};

const renderRoutes = (routes, isChild = false) =>
    routes.map((route, index) => (
        <Route
            key={index}
            path={route.path}
            index={route.index}
            element={renderRouteElement(route, isChild)}
        >
            {route.children && renderRoutes(route.children, true)}
        </Route>
    ));

const Router = () => {
    return <Routes>{renderRoutes(routes)}</Routes>;
};

export default Router;