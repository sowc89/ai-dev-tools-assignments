import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DeckList from './pages/DeckList';
import DeckView from './pages/DeckView';
import StudyMode from './pages/StudyMode';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
                <nav className="bg-white border-b border-slate-200 px-6 py-4 mb-6">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Flashcards AI
                        </Link>
                    </div>
                </nav>
                <main>
                    <Routes>
                        <Route path="/" element={<DeckList />} />
                        <Route path="/decks/:id" element={<DeckView />} />
                        <Route path="/decks/:id/study" element={<StudyMode />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
