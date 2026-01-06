import React, { useState, useEffect } from 'react';
import { getDecks, createDeck, deleteDeck } from '../api';
import { Plus, BookOpen, Trash2, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

function DeckList() {
    const [decks, setDecks] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [newDeckDesc, setNewDeckDesc] = useState('');

    useEffect(() => {
        loadDecks();
    }, []);

    const loadDecks = async () => {
        try {
            const data = await getDecks();
            setDecks(data);
        } catch (error) {
            console.error("Failed to load decks", error);
        }
    };

    const handleCreateDeck = async (e) => {
        e.preventDefault();
        try {
            await createDeck({ name: newDeckName, description: newDeckDesc });
            setNewDeckName('');
            setNewDeckDesc('');
            setShowCreate(false);
            loadDecks();
        } catch (error) {
            console.error("Failed to create deck", error);
        }
    };

    const handleDeleteDeck = async (id, e) => {
        // Prevent clicking the delete button from navigating to the deck view
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm("Are you sure you want to delete this deck and all its cards? This action cannot be undone.")) {
            try {
                await deleteDeck(id);
                loadDecks();
            } catch (error) {
                console.error("Failed to delete deck", error);
                alert("Failed to delete deck. Please try again.");
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">My Decks</h1>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    New Deck
                </button>
            </div>

            {showCreate && (
                <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-slate-100">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700">Create New Deck</h2>

                    {/* Warning about handwritten notes */}
                    <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">Note: This tool works best with digital text. Handwritten notes may not be processed accurately.</span>
                    </div>

                    <form onSubmit={handleCreateDeck} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Name</label>
                            <input
                                type="text"
                                value={newDeckName}
                                onChange={(e) => setNewDeckName(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                            <textarea
                                value={newDeckDesc}
                                onChange={(e) => setNewDeckDesc(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                rows="3"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {decks.map((deck) => (
                    <div key={deck.id} className="group relative">
                        <Link to={`/decks/${deck.id}`} className="block h-full">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group-hover:border-indigo-300 h-full flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                        {deck.name}
                                    </h3>
                                    <p className="text-slate-500 mb-4 h-12 overflow-hidden text-ellipsis">
                                        {deck.description || "No description"}
                                    </p>
                                </div>
                                <div className="flex items-center text-slate-400 text-sm">
                                    <BookOpen size={16} className="mr-2" />
                                    <span>View Cards</span>
                                </div>
                            </div>
                        </Link>
                        <button
                            onClick={(e) => handleDeleteDeck(deck.id, e)}
                            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            title="Delete Deck"
                        >
                            <Trash2 size={18} />
                        </button>
                        <Link
                            to={`/decks/${deck.id}/study`}
                            className="absolute bottom-6 right-6 p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                            title="Start Study Session"
                        >
                            <PlayCircle size={20} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DeckList;
