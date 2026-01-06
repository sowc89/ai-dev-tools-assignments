import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getDecks = async () => {
    const response = await api.get('/decks/');
    return response.data;
};

export const createDeck = async (deck) => {
    const response = await api.post('/decks/', deck);
    return response.data;
};

export const getDeck = async (id) => {
    const response = await api.get(`/decks/${id}`);
    return response.data;
};

export const updateDeck = async (id, deck) => {
    const response = await api.put(`/decks/${id}`, deck);
    return response.data;
};

export const deleteDeck = async (id) => {
    const response = await api.delete(`/decks/${id}`);
    return response.data;
};

export const getCards = async (deckId) => {
    const response = await api.get(`/decks/${deckId}/cards`);
    return response.data;
};

export const createCard = async (card) => {
    const response = await api.post('/cards/', card);
    return response.data;
};

export const updateCard = async (id, card) => {
    const response = await api.put(`/cards/${id}`, card);
    return response.data;
};

export const deleteCard = async (id) => {
    const response = await api.delete(`/cards/${id}`);
    return response.data;
};

export const generateCards = async (file, startPage = 1, endPage = -1) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('start_page', startPage);
    formData.append('end_page', endPage);
    const response = await axios.post(`${API_URL}/generate`, formData);
    return response.data;
};

export const refineCards = async (currentCards, sourceText, feedback) => {
    const payload = {
        cards: currentCards,
        source_text: sourceText,
        feedback: feedback
    };
    const response = await axios.post(`${API_URL}/generate/refine`, payload);
    return response.data;
};
