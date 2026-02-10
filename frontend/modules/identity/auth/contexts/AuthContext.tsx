import React, {createContext, useContext, useEffect, useState} from 'react';
import AuthService from '@identity/auth/services/AuthService';
import {SignInState} from "@identity/auth/types/enums/SignInState.ts";
import {User} from "@identity/user/types/model/User.ts";

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    initialLoading: boolean,
    refreshAuth: () => Promise<void>;
    login: (username: string, password: string, rememberDevice: boolean, mfaCode?: string) => Promise<SignInState>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    initialLoading: true,
    refreshAuth: async () => {
    },
    login: async () => SignInState.DEFAULT_DUMMY,
    logout: () => {
    },
});

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(AuthService.isLoggedIn);
    const [user, setUser] = useState<User | null>(AuthService.getUser());
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    const syncFromService = () => {
        setIsLoggedIn(AuthService.isLoggedIn);
        setUser(AuthService.getUser());
    };

    const refreshAuth = async () => {
        await AuthService.refreshAccessToken();
        syncFromService();
    };

    const login = async (username: string, password: string, rememberDevice: boolean, mfaCode?: string) => {
        const signInState = await AuthService.login(username, password, rememberDevice, mfaCode);
        syncFromService();
        return signInState;
    };

    const logout = () => {
        AuthService.logout()
            .then(syncFromService);
    };

    useEffect(() => {
        refreshAuth()
            .then(() => setInitialLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{isLoggedIn, user, refreshAuth, login, logout, initialLoading}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
