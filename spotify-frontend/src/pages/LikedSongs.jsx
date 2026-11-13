import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/navbar";
import SongCard from "../components/SongCard";
import api from "../services/api";
import { FaHeart, FaPlay } from "react-icons/fa";
import { usePlayer } from "../context/PlayerContext";

function LikedSongs() {
    const [likedSongs, setLikedSongs] = useState([]);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playSong } = usePlayer();

    const fetchLikedSongs = useCallback(async () => {
        try {
            const res = await api.get("/auth/liked");
            setLikedSongs(res.data?.likedSongs || []);
        } catch (err) {
            console.error("Failed to load liked songs:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPlaylists = useCallback(async () => {
        try {
            const res = await api.get("/playlist/myplaylist");
            setUserPlaylists(res.data?.playlists || []);
        } catch (err) {
            console.error("Failed to load playlists:", err);
        }
    }, []);

    useEffect(() => {
        fetchLikedSongs();
        fetchPlaylists();
    }, [fetchLikedSongs, fetchPlaylists]);

    const handleUnlike = (songId) => {
        setLikedSongs((prev) => prev.filter((s) => (s._id || s) !== songId));
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden select-none">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto pb-28">
                <Navbar title="Your Library" />

                <main className="p-8">
                    {/* Header Banner */}
                    <div className="flex items-end gap-6 mb-8 p-6 bg-gradient-to-r from-red-950/60 to-zinc-900 rounded-2xl border border-zinc-800">
                        <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-2xl shrink-0">
                            <FaHeart className="text-white text-5xl" />
                        </div>
                        <div>
                            <span className="text-xs uppercase font-bold text-zinc-400">Playlist</span>
                            <h1 className="text-4xl font-extrabold text-white mt-1">Liked Songs</h1>
                            <p className="text-sm text-zinc-400 mt-2">
                                {likedSongs.length} {likedSongs.length === 1 ? "song" : "songs"} saved
                            </p>
                        </div>
                    </div>

                    {/* Play All button if there are songs */}
                    {likedSongs.length > 0 && (
                        <div className="mb-6">
                            <button
                                onClick={() => playSong(likedSongs[0], likedSongs)}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-full font-bold shadow-lg transition hover:scale-105"
                            >
                                <FaPlay className="text-sm" />
                                <span>Play All Liked Songs</span>
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-20 text-zinc-400">
                            Loading your liked tracks...
                        </div>
                    ) : likedSongs.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500">
                            <p className="text-xl font-semibold">No liked songs yet</p>
                            <p className="text-sm mt-2">
                                Tap the heart icon on any song on the Home page to save it here!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {likedSongs.map((song) => (
                                <SongCard
                                    key={song._id}
                                    song={song}
                                    songList={likedSongs}
                                    isLiked={true}
                                    onLikeChange={(id, isLiked) => {
                                        if (!isLiked) handleUnlike(id);
                                    }}
                                    userPlaylists={userPlaylists}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default LikedSongs;
