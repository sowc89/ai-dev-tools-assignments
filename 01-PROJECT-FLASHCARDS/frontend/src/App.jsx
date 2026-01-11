import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import DeckList from './pages/DeckList';
import DeckView from './pages/DeckView';
import StudyMode from './pages/StudyMode';
import Login from './pages/Login';
import AuthGuard from './components/AuthGuard';
import { LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-slate-200 px-6 py-4 mb-6">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    StudyPal
                </Link>
                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
                    <Navbar />
                    <main>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/" element={
                                <AuthGuard>
                                    <DeckList />
                                </AuthGuard>
                            } />
                            <Route path="/decks/:id" element={
                                <AuthGuard>
                                    <DeckView />
                                </AuthGuard>
                            } />
                            <Route path="/decks/:id/study" element={
                                <AuthGuard>
                                    <StudyMode />
                                </AuthGuard>
                            } />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
