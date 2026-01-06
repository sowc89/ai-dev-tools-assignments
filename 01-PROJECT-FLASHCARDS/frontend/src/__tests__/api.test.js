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
});
