import { describe, it, expect, vi } from 'vitest';
import { api, getDecks, createDeck } from '../api';

vi.mock('axios', () => {
    const mockApiInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() }
        }
    };
    return {
        default: {
            create: vi.fn(() => mockApiInstance),
            post: vi.fn(),
        },
    };
});

describe('API functions', () => {
    it('getDecks fetches decks successfully', async () => {
        const mockDecks = [{ id: 1, name: 'Test Deck' }];
        api.get.mockResolvedValue({ data: mockDecks });

        const result = await getDecks();
        expect(api.get).toHaveBeenCalledWith('/decks/');
        expect(result).toEqual(mockDecks);
    });

    it('createDeck posts new deck', async () => {
        const newDeck = { name: 'New Deck' };
        const responseData = { id: 2, ...newDeck };
        api.post.mockResolvedValue({ data: responseData });

        const result = await createDeck(newDeck);
        expect(api.post).toHaveBeenCalledWith('/decks/', newDeck);
        expect(result).toEqual(responseData);
    });

    it('handles 401 errors by clearing storage and redirecting', async () => {
        // Access the interceptor's error handler
        const interceptor = api.interceptors.response.use.mock.calls[0];
        const errorHandler = interceptor[1];

        const mockError = {
            response: { status: 401 }
        };

        localStorage.setItem('token', 'stale');
        localStorage.setItem('isAuthenticated', 'true');

        try {
            await errorHandler(mockError);
        } catch (e) {
            // Error is re-thrown by interceptor
        }

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('isAuthenticated')).toBeNull();
    });
});
