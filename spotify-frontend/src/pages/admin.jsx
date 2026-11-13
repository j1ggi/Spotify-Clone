import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/navbar";
import api from "../services/api";
import { toast } from "react-toastify";
import { FaUpload, FaTrash, FaMusic, FaImage } from "react-icons/fa";

function Admin() {
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [album, setAlbum] = useState("");
    const [duration, setDuration] = useState("3:30");
    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [songs, setSongs] = useState([]);
    const [loadingSongs, setLoadingSongs] = useState(true);

    const fetchSongs = useCallback(async () => {
        try {
            const res = await api.get("/song/allsongs");
            setSongs(res.data?.songs || []);
        } catch (err) {
            console.error("Failed to fetch songs:", err);
        } finally {
            setLoadingSongs(false);
        }
    }, []);

    useEffect(() => {
        fetchSongs();
    }, [fetchSongs]);

    // 1. Handle Song Upload via multipart/form-data
    const handleUpload = async (e) => {
        e.preventDefault();

        if (!title.trim() || !artist.trim() || !album.trim() || !duration.trim()) {
            toast.warn("All text fields are required");
            return;
        }

        if (!imageFile || !audioFile) {
            toast.warn("Please select both a cover image and an audio file");
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("artist", artist.trim());
        formData.append("album", album.trim());
        formData.append("duration", duration.trim());
        formData.append("image", imageFile);
        formData.append("audio", audioFile);

        try {
            setUploading(true);
            const res = await api.post("/song/add", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            toast.success("Song uploaded successfully to ImageKit & MongoDB!");
            // Reset form
            setTitle("");
            setArtist("");
            setAlbum("");
            setDuration("3:30");
            setImageFile(null);
            setAudioFile(null);
            // Reset file input elements
            e.target.reset();

            // Refresh song list
            if (res.data?.song) {
                setSongs((prev) => [res.data.song, ...prev]);
            } else {
                fetchSongs();
            }
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.mess ||
                "Upload failed. Check ImageKit credentials.";
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    // 2. Handle Song Deletion (Admin only)
    const handleDeleteSong = async (songId) => {
        if (!window.confirm("Are you sure you want to delete this song?")) return;

        try {
            await api.delete(`/song/${songId}`);
            toast.success("Song deleted successfully");
            setSongs((prev) => prev.filter((s) => s._id !== songId));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete song");
        }
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden select-none">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto pb-28">
                <Navbar title="Admin Management Center" />

                <main className="p-8 max-w-6xl mx-auto w-full">
                    {/* Upload Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 mb-10 shadow-xl">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                                <FaUpload />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Upload New Track</h2>
                                <p className="text-xs text-zinc-400">
                                    Files are safely uploaded to ImageKit CDN and registered in MongoDB.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                                        Song Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Starboy"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 text-white text-sm focus:outline-none focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                                        Artist Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. The Weeknd"
                                        value={artist}
                                        onChange={(e) => setArtist(e.target.value)}
                                        className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 text-white text-sm focus:outline-none focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                                        Album Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Starboy"
                                        value={album}
                                        onChange={(e) => setAlbum(e.target.value)}
                                        className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 text-white text-sm focus:outline-none focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                                        Duration (mm:ss) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 3:50"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 text-white text-sm focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>

                            {/* File Upload Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="border border-dashed border-zinc-700 p-4 rounded-xl bg-zinc-950/40">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                                        <FaImage className="text-green-500" />
                                        Cover Image (JPG, PNG) *
                                    </label>
                                    <input
                                        type="file"
                                        required
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                        className="text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                                    />
                                </div>

                                <div className="border border-dashed border-zinc-700 p-4 rounded-xl bg-zinc-950/40">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                                        <FaMusic className="text-green-500" />
                                        Audio File (MP3, WAV) *
                                    </label>
                                    <input
                                        type="file"
                                        required
                                        accept="audio/*"
                                        onChange={(e) => setAudioFile(e.target.files[0])}
                                        className="text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3.5 rounded-full transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <FaUpload />
                                <span>{uploading ? "Uploading to Cloud..." : "Upload Song"}</span>
                            </button>
                        </form>
                    </div>

                    {/* Manage Existing Songs */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">Database Song Catalog</h3>
                                <p className="text-xs text-zinc-400 mt-1">
                                    Delete any song from the system if needed.
                                </p>
                            </div>
                            <span className="text-xs font-mono bg-zinc-800 px-3 py-1 rounded text-zinc-300">
                                {songs.length} total
                            </span>
                        </div>

                        {loadingSongs ? (
                            <div className="text-center py-10 text-zinc-400">Loading catalog...</div>
                        ) : songs.length === 0 ? (
                            <div className="text-center py-10 text-zinc-500">No songs currently uploaded.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-zinc-300">
                                    <thead className="text-xs uppercase bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                                        <tr>
                                            <th className="py-3 px-4">Track</th>
                                            <th className="py-3 px-4">Artist</th>
                                            <th className="py-3 px-4">Album</th>
                                            <th className="py-3 px-4">Duration</th>
                                            <th className="py-3 px-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {songs.map((song) => (
                                            <tr key={song._id} className="hover:bg-zinc-800/50 transition">
                                                <td className="py-3 px-4 flex items-center gap-3">
                                                    <img
                                                        src={
                                                            song.image ||
                                                            "https://placehold.co/40x40/18181b/22c55e?text=S"
                                                        }
                                                        alt={song.title}
                                                        className="w-10 h-10 rounded object-cover bg-zinc-800 shrink-0"
                                                    />
                                                    <span className="font-semibold text-white truncate max-w-xs">
                                                        {song.title}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 truncate max-w-xs">{song.artist}</td>
                                                <td className="py-3 px-4 truncate max-w-xs">{song.album}</td>
                                                <td className="py-3 px-4 font-mono text-xs">{song.duration}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteSong(song._id)}
                                                        className="text-red-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition"
                                                        title="Delete Song"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Admin;
