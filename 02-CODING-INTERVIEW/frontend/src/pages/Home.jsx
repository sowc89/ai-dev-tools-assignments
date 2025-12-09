import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createRoom = (e) => {
        e.preventDefault();
        const id = uuidv4();
        navigate(`/room/${id}`, { state: { username } });
    };

    const joinRoom = (e) => {
        e.preventDefault();
        if (!roomId || !username) return;
        navigate(`/room/${roomId}`, { state: { username } });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom(e);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
                <h1 className="text-4xl font-bold mb-6 text-center text-blue-500">Code Sync</h1>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Username</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2">Room ID</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Paste Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        onKeyUp={handleInputEnter}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={joinRoom}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all transform hover:scale-105"
                    >
                        Join Room
                    </button>
                    <div className="text-center text-gray-400">or</div>
                    <button
                        onClick={createRoom}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-all transform hover:scale-105"
                    >
                        Create New Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
