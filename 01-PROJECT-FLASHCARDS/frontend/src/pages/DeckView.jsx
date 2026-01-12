import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDeck, getCards, createCard, generateCards, deleteCard, refineCards } from '../api';
import { ArrowLeft, Plus, Sparkles, Trash2, Loader2, PlayCircle } from 'lucide-react';

function DeckView() {
    const { id } = useParams();
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [showAddCard, setShowAddCard] = useState(false);
    const [showGenerate, setShowGenerate] = useState(false);

    const [error, setError] = useState(null);

    // Form states
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [file, setFile] = useState(null);
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Refine/Review State
    const [isReviewing, setIsReviewing] = useState(false);
    const [generatedCards, setGeneratedCards] = useState([]);
    const [sourceText, setSourceText] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [deckData, cardsData] = await Promise.all([
                getDeck(id),
                getCards(id)
            ]);
            setDeck(deckData);
            setCards(cardsData);
        } catch (error) {
            console.error("Failed to load deck data", error);
            setError("Deck not found or failed to load.");
        }
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        try {
            await createCard({ front, back, deck_id: id });
            setFront('');
            setBack('');
            setShowAddCard(false);
            loadData();
        } catch (error) {
            console.error("Failed to add card", error);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!file) return;

        setIsGenerating(true);
        try {
            const valEndPage = endPage === '' ? -1 : parseInt(endPage);
            const valStartPage = parseInt(startPage);
            const response = await generateCards(file, valStartPage, valEndPage);

            // Response is { cards: [...], source_text: "..." }
            setGeneratedCards(response.cards);
            setSourceText(response.source_text);
            setIsReviewing(true);
            setShowGenerate(false); // Hide the generate form, show review UI
        } catch (error) {
            console.error("Failed to generate cards", error);
            alert("Failed to generate cards. Check console for details.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRefine = async () => {
        if (!feedback) return;
        setIsRefining(true);
        try {
            const newCards = await refineCards(generatedCards, sourceText, feedback);
            setGeneratedCards(newCards);
            setFeedback(''); // Clear feedback after successful refinement
        } catch (error) {
            console.error("Failed to refine cards", error);
            alert("Failed to refine cards.");
        } finally {
            setIsRefining(false);
        }
    };

    const handleSaveGenerated = async () => {
        try {
            for (const card of generatedCards) {
                await createCard({ ...card, deck_id: id });
            }
            setIsReviewing(false);
            setGeneratedCards([]);
            setSourceText('');
            loadData();
        } catch (error) {
            console.error("Failed to save cards", error);
            alert("Failed to save some cards.");
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!confirm("Are you sure you want to delete this card?")) return;
        try {
            await deleteCard(cardId);
            loadData();
        } catch (error) {
            console.error("Failed to delete card", error);
        }
    };

    if (error) return (
        <div className="p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{error}</h2>
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Return to Home
            </Link>
        </div>
    );

    if (!deck) return <div className="p-8 text-center text-slate-500">Loading deck details...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Link to="/" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
                <ArrowLeft size={20} className="mr-1" />
                Back to Decks
            </Link>

            <header className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">{deck.name}</h1>
                <p className="text-xl text-slate-600 mb-4">{deck.description}</p>
                {deck.tags && deck.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {deck.tags.map((tag, idx) => (
                            <span key={idx} className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </header>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setShowAddCard(!showAddCard)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Card
                </button>
                <button
                    onClick={() => setShowGenerate(!showGenerate)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <Sparkles size={20} />
                    Generate with AI
                </button>
            </div>


            {/* Manual Add Form */}
            {
                showAddCard && (
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-slate-100">
                        <h3 className="text-lg font-semibold mb-4">Add New Card</h3>
                        <form onSubmit={handleAddCard} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Front (Question)</label>
                                    <textarea
                                        value={front}
                                        onChange={(e) => setFront(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Back (Answer)</label>
                                    <textarea
                                        value={back}
                                        onChange={(e) => setBack(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddCard(false)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                    Save Card
                                </button>
                            </div>
                        </form>
                    </div>
                )
            }

            {/* AI Generation Form */}
            {
                showGenerate && (
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-emerald-100 bg-emerald-50">
                        <h3 className="text-lg font-semibold mb-4 text-emerald-900 flex items-center gap-2">
                            <Sparkles className="text-emerald-600" />
                            Generate from PDF
                        </h3>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label htmlFor="pdf-upload" className="block text-sm font-medium text-emerald-800 mb-1">Upload PDF Document</label>
                                <input
                                    id="pdf-upload"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
                                />
                                <p className="text-xs text-emerald-600 mt-1">
                                    💡 For best results, keep PDF size under 1 MB
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-emerald-800 mb-1">Start Page</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={startPage}
                                        onChange={(e) => setStartPage(e.target.value)}
                                        className="w-full p-2 border border-emerald-200 rounded-md focus:ring-2 focus:ring-emerald-500"
                                        placeholder="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-emerald-800 mb-1">End Page</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={endPage}
                                        onChange={(e) => setEndPage(e.target.value)}
                                        className="w-full p-2 border border-emerald-200 rounded-md focus:ring-2 focus:ring-emerald-500"
                                        placeholder="All"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowGenerate(false)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-white rounded-md border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!file || isGenerating}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : null}
                                    {isGenerating ? 'Generating...' : 'Generate Cards'}
                                </button>
                            </div>
                        </form>
                    </div>
                )
            }

            {/* Review / Refine UI */}
            {
                isReviewing && (
                    <div className="bg-indigo-50 p-6 rounded-xl shadow-md mb-8 border border-indigo-100">
                        <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                            <Sparkles className="text-indigo-600" />
                            Review Generated Cards
                        </h3>

                        <div className="space-y-4 mb-6">
                            {generatedCards.map((card, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border border-indigo-100 flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Front</span>
                                        <p className="text-slate-800">{card.front}</p>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Back</span>
                                        <p className="text-slate-800">{card.back}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-indigo-100 mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Refine with AI</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="e.g., 'Make definitions shorter', 'Focus on dates'"
                                    className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleRefine}
                                    disabled={!feedback || isRefining}
                                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 disabled:opacity-50"
                                >
                                    {isRefining ? 'Refining...' : 'Refine'}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsReviewing(false);
                                    setGeneratedCards([]);
                                }}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSaveGenerated}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                            >
                                Save to Deck
                            </button>
                        </div>
                    </div>
                )
            }

            <div className="space-y-8">
                {['NEW', 'REVIEWING', 'MASTERED'].map((status) => {
                    const filteredCards = cards.filter(card => card.status === status || (!card.status && status === 'NEW'));
                    if (filteredCards.length === 0) return null;

                    return (
                        <div key={status} className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className={`text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full ${status === 'NEW' ? 'bg-rose-100 text-rose-600' :
                                    status === 'REVIEWING' ? 'bg-orange-100 text-orange-600' :
                                        'bg-emerald-100 text-emerald-600'
                                    }`}>
                                    {status.charAt(0) + status.slice(1).toLowerCase()}
                                </h3>
                                <div className="flex-1 h-px bg-slate-100"></div>
                                <span className="text-xs font-bold text-slate-400">{filteredCards.length} cards</span>
                            </div>

                            <div className="space-y-4">
                                {filteredCards.map((card) => (
                                    <div key={card.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow relative overflow-hidden">
                                        {/* Status Strip */}
                                        <div className={`absolute top-0 left-0 w-1 h-full ${status === 'New' ? 'bg-rose-400' :
                                            status === 'Revise' ? 'bg-orange-400' :
                                                'bg-emerald-400'
                                            }`} />

                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Front</h4>
                                            <p className="text-lg text-slate-800">{card.front}</p>
                                        </div>
                                        <div className="hidden md:block w-px bg-slate-100"></div>
                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Back</h4>
                                            <p className="text-lg text-slate-800">{card.back}</p>
                                        </div>
                                        <div className="flex items-start">
                                            <button
                                                onClick={() => handleDeleteCard(card.id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {cards.length === 0 && (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p>No cards in this deck yet.</p>
                        <p className="text-sm mt-1">Add one manually or generate from a PDF.</p>
                    </div>
                )}
            </div>
        </div >
    );
}

export default DeckView;
