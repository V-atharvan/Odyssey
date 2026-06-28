/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider, 
    OAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile 
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { useFCM } from '../firebase/useFCM';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firebaseUser, setFirebaseUser] = useState(null);

    // Register FCM hook for push notifications
    useFCM(user);

    useEffect(() => {
        // 1. Restore Odyssey session from localStorage
        const storedToken = localStorage.getItem('odyssey_token');
        const storedUser = localStorage.getItem('odyssey_user');
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser) {
                    setToken(storedToken);
                    setUser(parsedUser);
                }
            } catch (err) {
                console.error("Failed to parse stored user", err);
            }
        }

        // 2. Listen for Firebase Auth changes
        const unsubscribe = onAuthStateChanged(auth, (fUser) => {
            setFirebaseUser(fUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('odyssey_token', jwtToken);
        localStorage.setItem('odyssey_user', JSON.stringify(userData));
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (error) {
            console.error("Google login failed", error);
            throw error;
        }
    };

    const loginWithMicrosoft = async () => {
        const provider = new OAuthProvider('microsoft.com');
        try {
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (error) {
            console.error("Microsoft login failed", error);
            throw error;
        }
    };

    const sendPhoneOTP = async (phoneNumber, recaptchaContainer) => {
        try {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    console.warn("Failed to clear recaptchaVerifier", e);
                }
                window.recaptchaVerifier = null;
            }

            const appVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
                size: 'invisible',
                callback: () => {
                    console.log('reCAPTCHA solved');
                }
            });
            window.recaptchaVerifier = appVerifier;
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            return confirmationResult;
        } catch (error) {
            console.error("Phone OTP send failed", error);
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {}
                window.recaptchaVerifier = null;
            }
            throw error;
        }
    };

    const verifyPhoneOTP = async (confirmationResult, code) => {
        try {
            const result = await confirmationResult.confirm(code);
            return result.user;
        } catch (error) {
            console.error("Phone OTP verification failed", error);
            throw error;
        }
    };

    const registerWithEmail = async (email, password, fullName) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            // Update the display name in Firebase immediately
            await updateProfile(result.user, { displayName: fullName });
            return result.user;
        } catch (error) {
            console.error("Email registration failed", error);
            throw error;
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) {
            console.error("Firebase email login failed", error);
            throw error;
        }
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('odyssey_token');
        localStorage.removeItem('odyssey_user');
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Firebase signout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            firebaseUser,
            login, 
            loginWithEmail,
            loginWithGoogle,
            loginWithMicrosoft,
            sendPhoneOTP,
            verifyPhoneOTP,
            registerWithEmail,
            logout, 
            loading, 
            isAuthenticated: !!token 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
