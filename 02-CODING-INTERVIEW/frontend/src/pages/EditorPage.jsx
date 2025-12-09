import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Editor from '../components/Editor';
import Client from '../components/Client';
import Console from '../components/Console';
import { initSocket } from '../socket';
import { executePythonWasm } from '../utils/pyodideExecutor';

const LANGUAGES = [
    { name: 'JavaScript', value: 'javascript' },
    { name: 'Python', value: 'python' },
    { name: 'Java', value: 'java' },
    { name: 'C++', value: 'cpp' },
];

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [language, setLanguage] = useState('javascript');
    const [isSocketReady, setIsSocketReady] = useState(false);

    useEffect(() => {
        const init = () => {
            const socket = initSocket();

            socketRef.current = socket;

            socket.on('connect_error', (err) => handleErrors(err));
            socket.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                navigate('/');
            }

            socket.emit('join', {
                roomId,
                username: location.state?.username,
            });

            socket.on('joined', ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room.`);
                }
                setClients(clients);

                // Sync code from the server (if any) or send our code?
                // Actually, if we are joining, we should probably ASK for code, or receive it from someone.
                // Current logic: New user emits 'sync-code' with THEIR code (null or empty). 
                // Wait, if I join, I want the room's code.
                // The 'joined' event is sent to ME and EVERYONE.
                // If I am the NEW user: I shouldn't broadcast my empty code.

                // FIXED LOGIC: 
                // When a new user joins:
                // Existing users receive 'joined'.
                // Existing users should send 'sync-code' to the new user.

                // But here: `socket.emit('sync-code', ...)` broadcasts to `socket.to(socketId)`.
                // If I am the new user, `socketId` is MY socketId.

                // Let's check server logic:
                // socket.on('sync-code', ({ socketId, code }) => { io.to(socketId).emit('code-change', { code }); });

                // This means 'sync-code' is a request from Client A (existing) to send code to Client B (new, socketId).
                // So: `socket.on('joined')`:
                // If I am NOT the new user (username !== location.state.username check is weak if users have same name).
                // Better: check socket.id.
                // The `joined` payload has `socketId` of the joined user.

                if (socketId !== socket.id) {
                    // Someone else joined. I should send them my code.
                    socket.emit('sync-code', {
                        code: codeRef.current,
                        socketId,
                    });
                }
            });

            socket.on('code-change', ({ code }) => {
                codeRef.current = code;
            });

            socket.on('disconnected', ({ socketId, username }) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => prev.filter((client) => client.socketId !== socketId));
            });

            setIsSocketReady(true);
        };

        if (location.state?.username) {
            init();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off('joined');
                socketRef.current.off('disconnected');
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const runCode = async () => {
        setIsLoading(true);
        setOutput('');

        try {
            // Use WASM (Pyodide) for Python, Piston API for other languages
            if (language === 'python') {
                toast.success('Running Python with WASM (Pyodide)...');
                const result = await executePythonWasm(codeRef.current);

                if (result.error) {
                    setOutput(`Error: ${result.error}\n${result.output}`);
                } else {
                    setOutput(result.output || '(No output)');
                }
            } else {
                // Use Piston API for other languages
                const apiUrl = import.meta.env.VITE_BACKEND_URL ||
                    (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);

                const { data } = await axios.post(`${apiUrl}/execute`, {
                    code: codeRef.current,
                    language,
                });
                setOutput(data.run.output);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to execute code');
            setOutput(`Error: ${error.message || 'Execution failed'}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="font-bold text-xl text-blue-400">Code Sync</h2>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <h3 className="text-gray-400 uppercase text-xs font-bold mb-4">Connected Users</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username} />
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-700 flex flex-col gap-3">
                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold transition"
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(roomId);
                                toast.success('Room ID copied to clipboard');
                            } catch (e) { toast.error('Failed to copy'); }
                        }}
                    >
                        Copy Room ID
                    </button>
                    <button
                        className="w-full bg-red-600 hover:bg-red-700 py-2 rounded font-bold transition"
                        onClick={() => navigate('/')}
                    >
                        Leave Room
                    </button>
                </div>
            </div>
            <div className="flex-1 flex flex-col">
                <div className="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <select
                            className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-blue-500"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang.value} value={lang.value}>{lang.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className={`bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-4 rounded transition flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={runCode}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Running...' : 'Run Code'}
                    </button>
                </div>
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    <div className="flex-1 h-full">
                        {isSocketReady && <Editor
                            socketRef={socketRef}
                            roomId={roomId}
                            onCodeChange={(code) => { codeRef.current = code; }}
                            language={language}
                        />}
                    </div>
                    <div className="w-full md:w-1/3 h-1/3 md:h-full border-t md:border-t-0 md:border-l border-gray-700">
                        <Console output={output} loading={isLoading} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;
