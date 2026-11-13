import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import LikedSongs from "./pages/LikedSongs";
import Playlist from "./pages/Playlist";
import Admin from "./pages/admin";

import Player from "./components/Player";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";

function MainAppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="relative min-h-screen bg-black text-white font-sans">
            <Routes>
                {/* Public Authentication Routes */}
                <Route
                    path="/"
                    element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />}
                />
                <Route
                    path="/register"
                    element={isAuthenticated ? <Navigate to="/home" replace /> : <Register />}
                />

                {/* Protected User Routes */}
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/liked"
                    element={
                        <ProtectedRoute>
                            <LikedSongs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/playlist"
                    element={
                        <ProtectedRoute>
                            <Playlist />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Admin-Only Route */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <Admin />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback Catch-all Route */}
                <Route
                    path="*"
                    element={<Navigate to={isAuthenticated ? "/home" : "/"} replace />}
                />
            </Routes>

            {/* Persistent Music Player displayed whenever logged in */}
            {isAuthenticated && <Player />}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <PlayerProvider>
                <MainAppRoutes />
            </PlayerProvider>
        </AuthProvider>
    );
}

export default App;
