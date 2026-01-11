import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, Mail, UserPlus, LogIn } from 'lucide-react';
import { loginUser, registerUser } from '../api';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Get the page the user was trying to access, or default to home
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isRegister) {
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setIsLoading(false);
                return;
            }
            try {
                await registerUser(username, password, email);
                // After registration, log them in
                const loginData = await loginUser(username, password);
                login(loginData.access_token);
                navigate(from, { replace: true });
            } catch (err) {
                setError(err.response?.data?.detail || 'Registration failed. Username might be taken.');
            }
        } else {
            try {
                const data = await loginUser(username, password);
                login(data.access_token);
                navigate(from, { replace: true });
            } catch (err) {
                setError('Invalid username or password.');
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-xl text-indigo-600 mb-4">
                        {isRegister ? <UserPlus size={32} /> : <Lock size={32} />}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {isRegister ? 'Register to start creating flashcards' : 'Please login to access your flashcards'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <User size={18} />
                            </span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email (Optional)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Mail size={18} />
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter email"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Lock size={18} />
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>

                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Confirm password"
                                    required={isRegister}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Login')}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                    <button
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError('');
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium translate-y-0 hover:-translate-y-0.5 transition-all"
                    >
                        {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;
