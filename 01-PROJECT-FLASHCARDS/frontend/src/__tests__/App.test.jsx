import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import * as api from '../api';

vi.mock('../api', () => ({
    getDecks: vi.fn(),
    createDeck: vi.fn(),
    deleteDeck: vi.fn(),
    getDeck: vi.fn(),
    updateDeck: vi.fn(),
    getCards: vi.fn(),
    createCard: vi.fn(),
    updateCard: vi.fn(),
    deleteCard: vi.fn(),
    generateCards: vi.fn(),
}));

describe('App Component', () => {
    it('renders without crashing', () => {
        localStorage.setItem('isAuthenticated', 'true');
        api.getDecks.mockResolvedValue([]);
        render(<App />);
        // Smoke test passed if render doesn't throw
        expect(true).toBe(true);
    });
});
