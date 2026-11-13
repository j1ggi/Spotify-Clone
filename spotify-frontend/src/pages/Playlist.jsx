import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/navbar";
import api from "../services/api";
import { toast } from "react-toastify";
import { FaPlay, FaTrash, FaPlus, FaFolderOpen, FaMusic } from "react-icons/fa";
import { usePlayer } from "../context/PlayerContext";

function Playlist() {
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const { playSong } = usePlayer();

    const fetchPlaylists = useCallback(async () => {
        try {
            const res = await api.get("/playlist/myplaylist");
            const list = res.data?.playlists || [];
            setPlaylists(list);
            setSelectedPlaylist((current) => {
                if (!current && list.length > 0) return list[0];
                if (current) {
                    const match = list.find((p) => p._id === current._id);
                    return match || (list.length > 0 ? list[0] : null);
                }
                return null;
            });
        } catch (err) {
            console.error("Failed to fetch playlists:", err);
            toast.error("Failed to load your playlists");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);

    // 1. Create a new playlist
    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) {
            toast.warn("Please enter a playlist name");
            return;
        }

        try {
            setCreating(true);
            const res = await api.post("/playlist/create", {
                name: newPlaylistName.trim()
            });

            toast.success("Playlist created!");
            setNewPlaylistName("");
            const created = res.data?.playlist;
            const updated = [created, ...playlists];
            setPlaylists(updated);
            setSelectedPlaylist(created);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create playlist");
        } finally {
            setCreating(false);
        }
    };

    // 2. Delete a playlist
    const handleDeletePlaylist = async (playlistId, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;

        try {
            await api.delete(`/playlist/${playlistId}`);
            toast.success("Playlist deleted");
            const updated = playlists.filter((p) => p._id !== playlistId);
            setPlaylists(updated);
            if (selectedPlaylist?._id === playlistId) {
                setSelectedPlaylist(updated[0] || null);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete playlist");
        }
    };

    // 3. Remove a song from the active playlist
    const handleRemoveSong = async (songId) => {
        if (!selectedPlaylist) return;

        try {
            const res = await api.put(
                `/playlist/removesong/${selectedPlaylist._id}/${songId}`
            );
            toast.info("Song removed from playlist");
            const updated = res.data?.playlist;
            setSelectedPlaylist(updated);
            setPlaylists((prev) =>
                prev.map((p) => (p._id === updated._id ? updated : p))
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove song");
        }
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden select-none">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto pb-28">
                <Navbar title="Your Playlists" />

                <main className="p-8">
                    {/* Create New Playlist Bar */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">Create a Custom Playlist</h2>
                            <p className="text-xs text-zinc-400 mt-1">
                                Organize your favorite tracks into personalized playlists.
                            </p>
                        </div>

                        <form onSubmit={handleCreatePlaylist} className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="New playlist title..."
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                className="bg-zinc-800 text-sm text-white px-4 py-2.5 rounded-lg border border-zinc-700 focus:outline-none focus:border-green-500 w-full sm:w-64"
                            />
                            <button
                                type="submit"
                                disabled={creating}
                                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-black px-4 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50 shrink-0"
                            >
                                <FaPlus className="text-xs" />
                                <span>{creating ? "Creating..." : "Create"}</span>
                            </button>
                        </form>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-zinc-400">Loading playlists...</div>
                    ) : playlists.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500">
                            <FaFolderOpen className="text-5xl mx-auto mb-3 text-zinc-600" />
                            <p className="text-lg font-semibold text-zinc-300">No playlists found</p>
                            <p className="text-sm mt-1">Create your first playlist using the form above!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Playlist Selector Column */}
                            <div className="lg:col-span-1 space-y-2">
                                <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-3 px-1">
                                    Your Collections
                                </h3>
                                {playlists.map((pl) => (
                                    <div
                                        key={pl._id}
                                        onClick={() => setSelectedPlaylist(pl)}
                                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition ${
                                            selectedPlaylist?._id === pl._id
                                                ? "bg-zinc-800 text-green-500 border border-zinc-700"
                                                : "bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                                <FaMusic className="text-sm text-green-500" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-sm truncate">{pl.name}</p>
                                                <p className="text-xs text-zinc-500">
                                                    {pl.songs?.length || 0} tracks
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => handleDeletePlaylist(pl._id, e)}
                                            className="text-zinc-500 hover:text-red-500 p-2 transition"
                                            title="Delete Playlist"
                                        >
                                            <FaTrash className="text-xs" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Active Playlist Songs Column */}
                            <div className="lg:col-span-3">
                                {selectedPlaylist ? (
                                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                                        <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-6">
                                            <div>
                                                <span className="text-xs uppercase font-bold text-zinc-500">
                                                    Selected Playlist
                                                </span>
                                                <h2 className="text-3xl font-extrabold text-white mt-1">
                                                    {selectedPlaylist.name}
                                                </h2>
                                                <p className="text-xs text-zinc-400 mt-1">
                                                    {selectedPlaylist.songs?.length || 0} songs in this playlist
                                                </p>
                                            </div>

                                            {selectedPlaylist.songs?.length > 0 && (
                                                <button
                                                    onClick={() =>
                                                        playSong(selectedPlaylist.songs[0], selectedPlaylist.songs)
                                                    }
                                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2.5 rounded-full transition shadow-md hover:scale-105"
                                                >
                                                    <FaPlay className="text-xs" />
                                                    <span>Play All</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Songs list */}
                                        {!selectedPlaylist.songs || selectedPlaylist.songs.length === 0 ? (
                                            <div className="text-center py-16 text-zinc-500">
                                                <p className="text-base">This playlist is empty.</p>
                                                <p className="text-xs mt-1">
                                                    Go to Home, find a track, and tap the <strong>+ Playlist</strong> button to add it!
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {selectedPlaylist.songs.map((song, index) => (
                                                    <div
                                                        key={song._id}
                                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/80 transition group"
                                                    >
                                                        <div className="flex items-center gap-4 overflow-hidden">
                                                            <span className="text-xs text-zinc-500 w-5 text-center font-mono">
                                                                {index + 1}
                                                            </span>
                                                            <img
                                                                src={
                                                                    song.image ||
                                                                    "https://placehold.co/80x80/18181b/22c55e?text=Music"
                                                                }
                                                                alt={song.title}
                                                                className="w-11 h-11 rounded-lg object-cover bg-zinc-800 shrink-0"
                                                            />
                                                            <div className="overflow-hidden">
                                                                <p className="text-white text-sm font-semibold truncate group-hover:text-green-500 transition">
                                                                    {song.title}
                                                                </p>
                                                                <p className="text-xs text-zinc-400 truncate">
                                                                    {song.artist} • {song.album}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                onClick={() =>
                                                                    playSong(song, selectedPlaylist.songs)
                                                                }
                                                                className="w-8 h-8 rounded-full bg-green-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow hover:scale-105"
                                                                title="Play"
                                                            >
                                                                <FaPlay className="text-xs ml-0.5" />
                                                            </button>

                                                            <button
                                                                onClick={() => handleRemoveSong(song._id)}
                                                                className="text-zinc-500 hover:text-red-500 transition p-1.5"
                                                                title="Remove from this playlist"
                                                            >
                                                                <FaTrash className="text-xs" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-zinc-500">
                                        Select a playlist from the left to view songs.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Playlist;
