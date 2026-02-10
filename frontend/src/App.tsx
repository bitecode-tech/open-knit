import '@app/index.css';
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import {LoginFormPage} from "@identity/auth/pages/LoginFormPage.tsx";
import {RegisterFormPage} from "@identity/user/pages/login/RegisterFormPage.tsx";
import React, {useMemo} from "react";
import {ForgotPasswordFormPage} from "@identity/user/pages/login/ForgotPasswordFormPage.tsx";
import {ResetForgotPasswordFormPage} from "@identity/user/pages/login/ResetForgotPasswordFormPage.tsx";
import {AdminLayout} from "@app/components/admin/AdminLayout.tsx";
import {AuthProvider, useAuth} from "@identity/auth/contexts/AuthContext.tsx";
import {VerifyAccountFormPage} from "@identity/auth/pages/VerifyAccountFormPage.tsx";
import {ProtectedRoute} from "@common/components/router/ProtectedRoute.tsx";

const getAdminLayoutProtectedRoute = () => {
    return <Route path="/admin/*" element={
        <ProtectedRoute>
            <AdminLayout/>
        </ProtectedRoute>
    }/>
};

enum Roles {
    ADMIN = "ROLE_ADMIN",
    USER = "ROLE_USER",
}

function AppRoutesWithAuth() {
    const {isLoggedIn, initialLoading, user} = useAuth();

    const role = useMemo(() => {
        if (!user?.roles) {
            return null;
        }
        return user.roles.includes("ROLE_ADMIN") ? Roles.ADMIN : Roles.USER;
    }, [user?.roles]);

    const layoutRoute = useMemo(() => {
        switch (role) {
            case "ROLE_ADMIN":
                return {route: getAdminLayoutProtectedRoute(), path: "/admin"};
            default:
                return null;
        }
    }, [role])


    if (initialLoading) {
        return <div></div>
    }
    return (
        <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/login" element={isLoggedIn ? <Navigate to="/"/> : <LoginFormPage/>}/>
            <Route path="/register" element={<RegisterFormPage/>}/>
            <Route path="/forgot-password" element={<ForgotPasswordFormPage/>}/>
            <Route path="/reset-forgot-password" element={<ResetForgotPasswordFormPage/>}/>
            <Route path="/verify-account" element={<VerifyAccountFormPage/>}/>

            {/* PROTECTED ROUTES */}

            {layoutRoute?.route}

            {/* Root redirect depending on login */}
            {isLoggedIn && (
                <Route path="/" element={<Navigate to={`${layoutRoute?.path ?? "/login"}`}/>}/>
            )}

            {/* FALLBACK */}
            <Route
                path="*"
                element={
                    isLoggedIn ? (
                        <Navigate to={`${layoutRoute?.path ?? "/login"}`}/>
                    ) : (
                        <Navigate to="/login"/>
                    )
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                {/* routes that never use AuthProvider */}

                {/*...*/}

                {/* Auth routes */}
                <Route
                    path="/*"
                    element={
                        <AuthProvider>
                            <AppRoutesWithAuth/>
                        </AuthProvider>
                    }
                />
            </Routes>
        </Router>
    )
}

export default App;
