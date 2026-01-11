import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import DeckList from '../pages/DeckList';
import * as api from '../api';

vi.mock('../api', () => ({
    getDecks: vi.fn(),
    createDeck: vi.fn(),
    deleteDeck: vi.fn(),
    updateDeck: vi.fn(),
}));

const mockDecks = [
    { id: 1, name: 'Math Deck', description: 'Calculus', tags: [{ name: 'math' }, { name: 'science' }] },
    { id: 2, name: 'History Deck', description: 'World War II', tags: [{ name: 'history' }, { name: 'war' }] },
];

describe('DeckList Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.getDecks.mockResolvedValue(mockDecks);
    });

    const renderDeckList = () => {
        return render(
            <MemoryRouter>
                <DeckList />
            </MemoryRouter>
        );
    };

    it('renders decks and tags correctly', async () => {
        renderDeckList();
        expect(await screen.findByText('Math Deck')).toBeDefined();
        expect(screen.getByText('History Deck')).toBeDefined();

        // Tags are rendered as spans with original case (CSS handles uppercase)
        expect(screen.getByText('math')).toBeDefined();
        expect(screen.getByText('science')).toBeDefined();
    });

    it('filters decks based on search input', async () => {
        renderDeckList();
        await screen.findByText('Math Deck');

        const searchInput = screen.getByPlaceholderText(/Search decks or tags.../i);

        // Search for 'History'
        fireEvent.change(searchInput, { target: { value: 'History' } });
        expect(screen.queryByText('Math Deck')).toBeNull();
        expect(screen.getByText('History Deck')).toBeDefined();

        // Search for tag 'science'
        fireEvent.change(searchInput, { target: { value: 'science' } });
        expect(screen.getByText('Math Deck')).toBeDefined();
        expect(screen.queryByText('History Deck')).toBeNull();
    });

    it('shows empty state when no matches found', async () => {
        renderDeckList();
        await screen.findByText('Math Deck');

        const searchInput = screen.getByPlaceholderText(/Search decks or tags.../i);
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

        expect(screen.getByText(/No decks found matching your filter/i)).toBeDefined();

        const clearButton = screen.getByText('Clear search');
        fireEvent.click(clearButton);
        expect(screen.getByText('Math Deck')).toBeDefined();
    });

    it('enters editing mode and updates deck', async () => {
        renderDeckList();
        await screen.findByText('Math Deck');

        // Find edit button (Pencil icon) - using title
        const editButton = screen.getAllByTitle('Edit Deck')[0];
        fireEvent.click(editButton);

        // Check if input for name is present (inline editing)
        const nameInput = screen.getByDisplayValue('Math Deck');
        fireEvent.change(nameInput, { target: { value: 'Calculus Advanced' } });

        const saveButton = screen.getByLabelText('Save changes');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(api.updateDeck).toHaveBeenCalledWith(1, expect.objectContaining({
                name: 'Calculus Advanced'
            }));
        });
    });
});
