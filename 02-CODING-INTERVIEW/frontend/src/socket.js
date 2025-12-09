import { io } from 'socket.io-client';

export const initSocket = () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };

    // In production (Render), use the same domain. In dev, use localhost:3001
    const socketUrl = import.meta.env.VITE_BACKEND_URL ||
        (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);

    return io(socketUrl, options);
};
