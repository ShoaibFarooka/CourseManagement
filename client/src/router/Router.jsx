import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute.jsx';
import AuthenticatedRedirect from '../components/AuthenticatedRedirect/AuthenticatedRedirect.jsx';
import routes from './RouteConfig.jsx';

const Router = () => {
    return (
        <Routes>
            {routes.map((route, index) => (
                <Route
                    key={index}
                    path={route.path}
                    element={
                        <Layout showHeader={route.showHeader} showFooter={route.showFooter}>
                            {
                                route.protected ?
                                    <ProtectedRoute>{route.element}</ProtectedRoute>
                                    : route.authRedirect ?
                                        <AuthenticatedRedirect>
                                            {route.element}
                                        </AuthenticatedRedirect>
                                        :
                                        route.element
                            }
                        </Layout>
                    }
                />
            ))}
        </Routes>
    );
};

export default Router;