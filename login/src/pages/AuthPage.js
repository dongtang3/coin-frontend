import React, { useState } from 'react';
import LoginForm from '../components/Login';
import SignupForm from '../components/Signup';
import '../css/Auth.css';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <button
                        className={`auth-toggle ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        LOGIN
                    </button>
                    <button
                        className={`auth-toggle ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        SIGNUP
                    </button>
                </div>
                {isLogin ? <LoginForm /> : <SignupForm />}
            </div>
        </div>
    );
};

export default AuthPage;