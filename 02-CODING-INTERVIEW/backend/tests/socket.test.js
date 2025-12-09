const { Server } = require('socket.io');
const Client = require('socket.io-client');
const http = require('http');

describe('Socket.io Integration Tests', () => {
    let io, serverSocket, clientSocket1, clientSocket2, httpServer;

    beforeAll((done) => {
        httpServer = http.createServer();
        io = new Server(httpServer);

        const userSocketMap = {};

        function getAllConnectedClients(roomId) {
            return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
                (socketId) => {
                    return {
                        socketId,
                        username: userSocketMap[socketId],
                    };
                }
            );
        }

        io.on('connection', (socket) => {
            socket.on('join', ({ roomId, username }) => {
                userSocketMap[socket.id] = username;
                socket.join(roomId);

                const clients = getAllConnectedClients(roomId);

                clients.forEach(({ socketId }) => {
                    io.to(socketId).emit('joined', {
                        clients,
                        username,
                        socketId: socket.id,
                    });
                });
            });

            socket.on('code-change', ({ roomId, code }) => {
                socket.in(roomId).emit('code-change', { code });
            });

            socket.on('sync-code', ({ socketId, code }) => {
                io.to(socketId).emit('code-change', { code });
            });

            socket.on('disconnecting', () => {
                const rooms = [...socket.rooms];
                rooms.forEach((roomId) => {
                    socket.in(roomId).emit('disconnected', {
                        socketId: socket.id,
                        username: userSocketMap[socket.id],
                    });
                });
                delete userSocketMap[socket.id];
            });
        });

        httpServer.listen(() => {
            const port = httpServer.address().port;
            clientSocket1 = new Client(`http://localhost:${port}`);
            clientSocket1.on('connect', done);
        });
    });

    afterAll(() => {
        io.close();
        clientSocket1.close();
        if (clientSocket2) clientSocket2.close();
        httpServer.close();
    });

    test('should allow a user to join a room', (done) => {
        clientSocket1.emit('join', { roomId: 'test-room', username: 'User1' });

        clientSocket1.on('joined', (data) => {
            expect(data.clients).toHaveLength(1);
            expect(data.clients[0].username).toBe('User1');
            expect(data.username).toBe('User1');
            done();
        });
    });

    test('should broadcast code changes to other users in the room', (done) => {
        const port = httpServer.address().port;
        clientSocket2 = new Client(`http://localhost:${port}`);

        clientSocket2.on('connect', () => {
            clientSocket2.emit('join', { roomId: 'test-room-2', username: 'User2' });
        });

        clientSocket2.on('joined', () => {
            // User1 joins the same room
            clientSocket1.emit('join', { roomId: 'test-room-2', username: 'User1' });
        });

        let joinedCount = 0;
        clientSocket1.on('joined', (data) => {
            joinedCount++;
            if (joinedCount === 2) { // After joining test-room-2
                // User1 sends code change
                clientSocket1.emit('code-change', { roomId: 'test-room-2', code: 'console.log("test")' });
            }
        });

        clientSocket2.on('code-change', (data) => {
            expect(data.code).toBe('console.log("test")');
            done();
        });
    });

    test('should sync code to a specific user', (done) => {
        const testCode = 'print("synced code")';

        clientSocket1.on('code-change', (data) => {
            expect(data.code).toBe(testCode);
            done();
        });

        // Simulate sync-code event
        clientSocket2.emit('sync-code', { socketId: clientSocket1.id, code: testCode });
    });
});
