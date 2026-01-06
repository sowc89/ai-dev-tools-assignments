import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthGuard from '../components/AuthGuard';

describe('AuthGuard Component', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('redirects to login when not authenticated', () => {
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route
                        path="/protected"
                        element={
                            <AuthGuard>
                                <div>Protected Content</div>
                            </AuthGuard>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Login Page')).toBeDefined();
        expect(screen.queryByText('Protected Content')).toBeNull();
    });

    it('renders children when authenticated', () => {
        localStorage.setItem('isAuthenticated', 'true');

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route
                        path="/protected"
                        element={
                            <AuthGuard>
                                <div>Protected Content</div>
                            </AuthGuard>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeDefined();
        expect(screen.queryByText('Login Page')).toBeNull();
    });
});
