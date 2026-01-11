import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD ? '' : 'http://localhost:8000');

export const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear authentication state
            localStorage.removeItem('token');
            localStorage.removeItem('isAuthenticated');
            // We avoid window.location.href here to prevent full page reloads.
            // The AuthGuard or AuthContext will detect the state change and redirect.
        }
        return Promise.reject(error);
    }
);

// Auth API
export const loginUser = async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/token', formData);
    return response.data;
};

export const registerUser = async (username, password, email) => {
    const response = await api.post('/register', { username, password, email });
    return response.data;
};

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
    const response = await api.post('/generate', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const refineCards = async (currentCards, sourceText, feedback) => {
    const payload = {
        cards: currentCards,
        source_text: sourceText,
        feedback: feedback
    };
    const response = await api.post('/generate/refine', payload);
    return response.data;
};
