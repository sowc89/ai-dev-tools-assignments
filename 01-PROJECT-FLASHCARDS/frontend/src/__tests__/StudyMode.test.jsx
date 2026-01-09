import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StudyMode from '../pages/StudyMode';
import * as api from '../api';

vi.mock('../api', () => ({
    getDeck: vi.fn(),
    getCards: vi.fn(),
    updateDeck: vi.fn(),
}));

const mockDeck = { id: 1, name: 'Test Deck', description: 'Test Desc', notes: 'Initial notes' };
const mockCards = [
    { id: 1, front: 'Question 1', back: 'Answer 1', status: 'New', deck_id: 1 },
    { id: 2, front: 'Question 2', back: 'Answer 2', status: 'Revise', deck_id: 1 },
];

describe('StudyMode Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.getDeck.mockResolvedValue(mockDeck);
        api.getCards.mockResolvedValue(mockCards);
    });

    const renderStudyMode = () => {
        return render(
            <MemoryRouter initialEntries={['/decks/1/study']}>
                <Routes>
                    <Route path="/decks/:id/study" element={<StudyMode />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('renders deck name and first card question', async () => {
        renderStudyMode();
        expect(await screen.findByText('Test Deck')).toBeDefined();
        // The back is in the DOM but hidden/rotated. We check visibility or just focus on front.
        expect(screen.getByText('Question 1')).toBeDefined();
    });

    it('flips the card when clicked', async () => {
        renderStudyMode();
        await screen.findByText('Question 1');
        const cardFront = screen.getByText('Question 1');
        fireEvent.click(cardFront);
        expect(await screen.findByText('Answer 1')).toBeDefined();
    });

    it('navigates to the next card', async () => {
        renderStudyMode();
        await screen.findByText('Question 1');

        expect(screen.getByText('Card 1 of 2')).toBeDefined();

        const nextButton = screen.getByRole('button', { name: /next card/i });
        fireEvent.click(nextButton);

        expect(await screen.findByText('Card 2 of 2')).toBeDefined();
        expect(screen.getByText('Question 2')).toBeDefined();
    });

    it('saves study notes', async () => {
        api.updateDeck.mockResolvedValue({ ...mockDeck, notes: 'New notes' });
        renderStudyMode();
        await screen.findByText('Study Notes');

        const textarea = screen.getByPlaceholderText(/Type your notes here/i);
        fireEvent.change(textarea, { target: { value: 'Updated study notes' } });

        const saveButton = screen.getByText('Save Notes');
        fireEvent.click(saveButton);

        expect(api.updateDeck).toHaveBeenCalledWith("1", { notes: 'Updated study notes' });
        expect(await screen.findByText('Saving...')).toBeDefined();
    });
});
