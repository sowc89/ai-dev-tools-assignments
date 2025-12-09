const request = require('supertest');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

// Create a test server instance
function createTestServer() {
    const app = express();
    const server = http.createServer(app);

    app.use(cors());
    app.use(express.json());

    // Code execution endpoint
    app.post('/execute', async (req, res) => {
        const { code, language } = req.body;
        try {
            const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
                language: language,
                version: "*",
                files: [
                    {
                        content: code
                    }
                ],
            });
            res.json(response.data);
        } catch (error) {
            console.error('Execution error:', error.message);
            res.status(500).json({ error: 'Failed to execute code' });
        }
    });

    return { app, server };
}

describe('API Integration Tests', () => {
    let app;
    let server;

    beforeAll(() => {
        const testServer = createTestServer();
        app = testServer.app;
        server = testServer.server;
    });

    afterAll((done) => {
        if (server) {
            server.close(done);
        } else {
            done();
        }
    });

    describe('POST /execute', () => {
        it('should execute Python code successfully', async () => {
            const response = await request(app)
                .post('/execute')
                .send({
                    code: 'print("Hello from Python")',
                    language: 'python'
                })
                .expect(200);

            expect(response.body).toHaveProperty('run');
            expect(response.body.run).toHaveProperty('output');
            expect(response.body.run.output).toContain('Hello from Python');
        }, 15000);

        it('should execute JavaScript code successfully', async () => {
            const response = await request(app)
                .post('/execute')
                .send({
                    code: 'console.log("Hello from JavaScript")',
                    language: 'javascript'
                })
                .expect(200);

            expect(response.body).toHaveProperty('run');
            expect(response.body.run).toHaveProperty('output');
            expect(response.body.run.output).toContain('Hello from JavaScript');
        }, 15000);

        it('should handle execution errors gracefully', async () => {
            const response = await request(app)
                .post('/execute')
                .send({
                    code: 'invalid syntax here!!!',
                    language: 'python'
                });

            // Should still return 200 but with error in output
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('run');
        }, 15000);
    });
});
