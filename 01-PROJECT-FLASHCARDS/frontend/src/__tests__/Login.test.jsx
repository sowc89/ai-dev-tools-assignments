import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../api';

// Mock useNavigate and useLocation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: null }),
    };
});

vi.mock('../api', () => ({
    loginUser: vi.fn(),
    registerUser: vi.fn(),
}));

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders login form by default', () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthProvider>
        );
        expect(screen.getByText('Welcome Back')).toBeDefined();
        expect(screen.getByPlaceholderText('Enter username')).toBeDefined();
        expect(screen.getByRole('button', { name: /Login/i })).toBeDefined();
    });

    it('toggles to registration form', () => {
        render(
            <AuthProvider>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthProvider>
        );
        const toggleBtn = screen.getByText(/Don't have an account\? Sign Up/i);
        fireEvent.click(toggleBtn);

        expect(screen.getByText('Create Account')).toBeDefined();
        expect(screen.getByPlaceholderText('Enter email')).toBeDefined();
        expect(screen.getByPlaceholderText('Confirm password')).toBeDefined();
        expect(screen.getByRole('button', { name: /Sign Up/i })).toBeDefined();
    });

    it('handles successful login', async () => {
        api.loginUser.mockResolvedValue({ access_token: 'fake-token' });

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthProvider>
        );

        fireEvent.change(screen.getByPlaceholderText('Enter username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => {
            expect(api.loginUser).toHaveBeenCalledWith('testuser', 'password123');
            expect(localStorage.getItem('token')).toBe('fake-token');
            expect(localStorage.getItem('isAuthenticated')).toBe('true');
            expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        });
    });

    it('handles login error', async () => {
        api.loginUser.mockRejectedValue(new Error('Unauthorized'));

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthProvider>
        );

        // Fill data to avoid potential issues with 'required' (though fireEvent skips browser validation)
        fireEvent.change(screen.getByPlaceholderText('Enter username'), { target: { value: 'user' } });
        fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'pass' } });
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        expect(await screen.findByText(/Invalid username or password/i)).toBeDefined();
    });

    it('handles registration success', async () => {
        api.registerUser.mockResolvedValue({ id: 1, username: 'newuser' });
        api.loginUser.mockResolvedValue({ access_token: 'new-token' });

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthProvider>
        );

        fireEvent.click(screen.getByText(/Don't have an account\? Sign Up/i));

        fireEvent.change(screen.getByPlaceholderText('Enter username'), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByPlaceholderText('Enter email'), { target: { value: 'new@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'pass123' } });

        fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        await waitFor(() => {
            expect(api.registerUser).toHaveBeenCalledWith('newuser', 'pass123', 'new@example.com');
            expect(api.loginUser).toHaveBeenCalledWith('newuser', 'pass123');
            expect(localStorage.getItem('token')).toBe('new-token');
            expect(mockNavigate).toHaveBeenCalled();
        });
    });
});
