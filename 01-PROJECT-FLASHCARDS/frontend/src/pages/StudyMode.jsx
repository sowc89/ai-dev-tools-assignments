import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDeck, getCards, updateDeck } from '../api';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCw, Save } from 'lucide-react';

function StudyMode() {
    const { id } = useParams();
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

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
            setNotes(deckData.notes || '');
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            await updateDeck(id, { notes });
        } catch (error) {
            console.error("Failed to save notes", error);
        } finally {
            setTimeout(() => setSavingNotes(false), 1000);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading study session...</div>;
    if (!deck) return <div className="p-8 text-center">Deck not found</div>;
    if (cards.length === 0) return (
        <div className="max-w-2xl mx-auto p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">No cards in this deck</h2>
            <Link to="/" className="text-indigo-600 hover:text-indigo-800">
                Go back and add some cards
            </Link>
        </div>
    );

    const currentCard = cards[currentIndex];

    return (
        <div className="max-w-7xl mx-auto p-6 min-h-[calc(100vh-100px)] flex flex-col">
            <Link to="/" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors self-start">
                <ArrowLeft size={20} className="mr-1" />
                Back to Decks
            </Link>

            <div className="mb-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">{deck.name} <span className="text-slate-400 font-normal">Study Session</span></h1>
                <div className="text-slate-500 font-medium">
                    Card {currentIndex + 1} of {cards.length}
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 items-start">
                {/* Left: Flashcard Area */}
                <div className="w-full lg:w-2/3 flex flex-col items-center">
                    <div
                        onClick={handleFlip}
                        className="w-full max-w-2xl aspect-[3/2] perspective cursor-pointer group"
                    >
                        <div className={`relative w-full h-full duration-500 transform-style-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>

                            {/* Front */}
                            <div className="absolute w-full h-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 flex flex-col items-center justify-center backface-hidden group-hover:shadow-xl transition-shadow">
                                <span className="absolute top-6 left-6 text-xs font-bold text-slate-400 tracking-wider uppercase">Question</span>
                                <p className="text-2xl md:text-3xl text-slate-800 text-center font-medium leading-relaxed">
                                    {currentCard.front}
                                </p>
                                <div className="absolute bottom-6 text-slate-400 text-sm flex items-center gap-2">
                                    <RotateCw size={16} /> Click to reveal answer
                                </div>
                            </div>

                            {/* Back */}
                            <div className="absolute w-full h-full bg-indigo-50 rounded-2xl shadow-lg border border-indigo-100 p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180">
                                <span className="absolute top-6 left-6 text-xs font-bold text-indigo-400 tracking-wider uppercase">Answer</span>
                                <p className="text-2xl md:text-3xl text-indigo-900 text-center leading-relaxed">
                                    {currentCard.back}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-8 mt-12 mb-8">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            aria-label="Previous card"
                            className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <button
                            onClick={handleFlip}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
                        >
                            {isFlipped ? 'Show Question' : 'Show Answer'}
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={currentIndex === cards.length - 1}
                            aria-label="Next card"
                            className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Right: Notes Area */}
                <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[600px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700">Study Notes</h3>
                        <button
                            onClick={handleSaveNotes}
                            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                            disabled={savingNotes}
                        >
                            <Save size={16} />
                            {savingNotes ? 'Saving...' : 'Save Notes'}
                        </button>
                    </div>
                    <textarea
                        className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        placeholder="Type your notes here during your study session..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <p className="text-xs text-slate-400 mt-2">Notes are saved to this deck.</p>
                </div>
            </div>
        </div>
    );
}

export default StudyMode;
