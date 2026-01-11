import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DeckView from '../pages/DeckView';
import * as api from '../api';

vi.mock('../api', () => ({
    getDeck: vi.fn(),
    getCards: vi.fn(),
    createCard: vi.fn(),
    generateCards: vi.fn(),
    deleteCard: vi.fn(),
    refineCards: vi.fn(),
}));

const mockDeck = { id: 1, name: 'Integration Test Deck', description: 'Testing full flow' };
const mockCards = [
    { id: 1, front: 'New Front', back: 'New Back', status: 'NEW', deck_id: 1 },
    { id: 2, front: 'Revise Front', back: 'Revise Back', status: 'REVIEWING', deck_id: 1 },
    { id: 3, front: 'Done Front', back: 'Done Back', status: 'MASTERED', deck_id: 1 },
];

describe('DeckView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.getDeck.mockResolvedValue(mockDeck);
        api.getCards.mockResolvedValue(mockCards);
    });

    const renderDeckView = () => {
        return render(
            <MemoryRouter initialEntries={['/decks/1']}>
                <Routes>
                    <Route path="/decks/:id" element={<DeckView />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('renders deck name and cards grouped by status', async () => {
        renderDeckView();
        expect(await screen.findByText('Integration Test Deck')).toBeDefined();

        // Check for category headers
        expect(screen.getByText('New')).toBeDefined();
        expect(screen.getByText('Reviewing')).toBeDefined();
        expect(screen.getByText('Mastered')).toBeDefined();

        // Check for cards in categories
        expect(screen.getByText('New Front')).toBeDefined();
        expect(screen.getByText('Revise Front')).toBeDefined();
        expect(screen.getByText('Done Front')).toBeDefined();
    });

    it('opens and closes manual add card form', async () => {
        renderDeckView();
        const addButton = await screen.findByText('Add Card');
        fireEvent.click(addButton);

        expect(screen.getByText('Add New Card')).toBeDefined();
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(screen.queryByText('Add New Card')).toBeNull();
    });

    it('handles AI generation flow', async () => {
        api.generateCards.mockResolvedValue({
            cards: [{ front: 'AI Front', back: 'AI Back' }],
            source_text: 'Dummy Source'
        });

        renderDeckView();
        const generateBtn = await screen.findByText('Generate with AI');
        fireEvent.click(generateBtn);

        expect(screen.getByText('Generate from PDF')).toBeDefined();

        // Mock file selection
        const fileInput = screen.getByLabelText(/Upload PDF Document/i);
        const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        const submitBtn = screen.getByText('Generate Cards');
        fireEvent.click(submitBtn);

        expect(await screen.findByText('Review Generated Cards')).toBeDefined();
        expect(screen.getByText('AI Front')).toBeDefined();
    });

    it('handles refinement flow', async () => {
        // First get to the review state
        api.generateCards.mockResolvedValue({
            cards: [{ front: 'Initial AI Q', back: 'Initial AI A' }],
            source_text: 'Dummy Source'
        });
        api.refineCards.mockResolvedValue([{ front: 'Refined Q', back: 'Refined A' }]);

        renderDeckView();
        const generateBtn = await screen.findByText('Generate with AI');
        fireEvent.click(generateBtn);

        const fileInput = screen.getByLabelText(/Upload PDF Document/i);
        fireEvent.change(fileInput, { target: { files: [new File([], 'test.pdf')] } });
        fireEvent.click(screen.getByText('Generate Cards'));

        await screen.findByText('Review Generated Cards');

        const feedbackInput = screen.getByPlaceholderText(/e.g., 'Make definitions shorter'/i);
        fireEvent.change(feedbackInput, { target: { value: 'Make it better' } });

        const refineBtn = screen.getByText('Refine');
        fireEvent.click(refineBtn);

        // Note: Check api.js to see if refineCards is exported correctly. 
        // In the mock I used refineCards which matches DeckView imports
        expect(api.refineCards).toHaveBeenCalled();
    });
});
