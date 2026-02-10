import React, {JSX} from "react";
import {useAuth} from "@identity/auth/contexts/AuthContext.tsx";
import {Navigate} from "react-router-dom";

export const ProtectedRoute = ({children}: { children: JSX.Element }) => {
    const {isLoggedIn} = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace/>;
    }

    return children;

};