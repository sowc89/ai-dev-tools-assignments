import React, { useState, useEffect } from 'react';
import { getDecks, createDeck, deleteDeck, updateDeck } from '../api';
import { Plus, BookOpen, Trash2, PlayCircle, Pencil, X, Check, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

function DeckList() {
    const [decks, setDecks] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [newDeckDesc, setNewDeckDesc] = useState('');
    const [newDeckTags, setNewDeckTags] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingDeckId, setEditingDeckId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editTags, setEditTags] = useState('');

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
            await createDeck({
                name: newDeckName,
                description: newDeckDesc,
                tags: newDeckTags
            });
            setNewDeckName('');
            setNewDeckDesc('');
            setNewDeckTags('');
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

    const handleUpdateDeck = async (e) => {
        e.preventDefault();
        try {
            await updateDeck(editingDeckId, {
                name: editName,
                description: editDesc,
                tags: editTags
            });
            setEditingDeckId(null);
            loadDecks();
        } catch (error) {
            console.error("Failed to update deck", error);
        }
    };

    const startEditing = (deck, e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingDeckId(deck.id);
        setEditName(deck.name);
        setEditDesc(deck.description || '');
        setEditTags(deck.tags || '');
    };

    const filteredDecks = decks.filter(deck => {
        const query = searchQuery.toLowerCase();
        return (
            deck.name.toLowerCase().includes(query) ||
            (deck.description && deck.description.toLowerCase().includes(query)) ||
            (deck.tags && deck.tags.toLowerCase().includes(query))
        );
    });

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Decks</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and study your flashcard collections</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search decks or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all text-sm outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-all"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all whitespace-nowrap font-medium"
                    >
                        <Plus size={20} />
                        New Deck
                    </button>
                </div>
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
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={newDeckTags}
                                onChange={(e) => setNewDeckTags(e.target.value)}
                                placeholder="e.g. Science, Finals, Week 1"
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                {filteredDecks.map((deck) => (
                    <div key={deck.id} className="group relative">
                        <Link to={`/decks/${deck.id}`} className="block h-full">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group-hover:border-indigo-300 h-full flex flex-col justify-between">
                                {editingDeckId === deck.id ? (
                                    <div className="space-y-3" onClick={(e) => e.preventDefault()}>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full p-2 text-lg font-semibold border-b border-indigo-200 focus:outline-none focus:border-indigo-500"
                                            placeholder="Deck Name"
                                            autoFocus
                                        />
                                        <textarea
                                            value={editDesc}
                                            onChange={(e) => setEditDesc(e.target.value)}
                                            className="w-full p-2 text-sm text-slate-500 border border-slate-100 rounded focus:border-indigo-300 focus:outline-none resize-none"
                                            rows="2"
                                            placeholder="Description"
                                        />
                                        <input
                                            type="text"
                                            value={editTags}
                                            onChange={(e) => setEditTags(e.target.value)}
                                            className="w-full p-2 text-xs border border-slate-100 rounded focus:border-indigo-300 focus:outline-none"
                                            placeholder="Tags (comma separated)"
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button
                                                onClick={() => setEditingDeckId(null)}
                                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                            <button
                                                onClick={handleUpdateDeck}
                                                className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
                                            >
                                                <Check size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                    {deck.name}
                                                </h3>
                                            </div>
                                            <p className="text-slate-500 mb-4 h-12 overflow-hidden text-ellipsis">
                                                {deck.description || "No description"}
                                            </p>

                                            {deck.tags && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {deck.tags.split(',').map((tag, idx) => (
                                                        <span key={idx} className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                            {tag.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center text-slate-400 text-sm">
                                                <BookOpen size={16} className="mr-2" />
                                                <span>View Cards</span>
                                            </div>

                                            {/* Mobile specific study button */}
                                            <div className="md:hidden">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        window.location.href = `/decks/${deck.id}/study`;
                                                    }}
                                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-full"
                                                >
                                                    <PlayCircle size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Link>

                        {/* Action Overlay - Desktop: Hover, Mobile: Always visible */}
                        {editingDeckId !== deck.id && (
                            <div className="flex items-center gap-2 absolute top-4 right-4 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200">
                                <button
                                    onClick={(e) => startEditing(deck, e)}
                                    className="p-2.5 bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all"
                                    title="Edit Deck"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteDeck(deck.id, e)}
                                    className="p-2.5 bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-all"
                                    title="Delete Deck"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}

                        {/* Study Button - Desktop: Bottom-right hover, Mobile: Handled in card body */}
                        {editingDeckId !== deck.id && (
                            <Link
                                to={`/decks/${deck.id}/study`}
                                className="hidden md:flex absolute bottom-6 right-6 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:scale-110 shadow-lg shadow-indigo-100 transition-all md:opacity-0 md:group-hover:opacity-100"
                                title="Start Study Session"
                            >
                                <PlayCircle size={24} />
                            </Link>
                        )}
                    </div>
                ))}
                {filteredDecks.length === 0 && (
                    <div className="col-span-1 md:col-span-2 text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-500">No decks found matching your filter.</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DeckList;
