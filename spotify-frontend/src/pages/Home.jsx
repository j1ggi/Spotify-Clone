import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/navbar";
import SongCard from "../components/SongCard";
import api from "../services/api";
import { FaSearch } from "react-icons/fa";

function Home() {
    const [songs, setSongs] = useState([]);
    const [likedSongIds, setLikedSongIds] = useState(new Set());
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchInitialData = useCallback(async () => {
        try {
            // 1. Fetch all songs
            const songsRes = await api.get("/song/allsongs");
            const fetchedSongs = songsRes.data?.songs || [];
            setSongs(fetchedSongs);

            // 2. Fetch user's liked songs to highlight heart icons
            try {
                const likedRes = await api.get("/auth/liked");
                const likedList = likedRes.data?.likedSongs || [];
                const ids = new Set(likedList.map((s) => s._id || s));
                setLikedSongIds(ids);
            } catch {
                // Ignore if not logged in
            }

            // 3. Fetch user's playlists for "Add to playlist" dropdown
            try {
                const plRes = await api.get("/playlist/myplaylist");
                setUserPlaylists(plRes.data?.playlists || []);
            } catch {
                // Ignore if not logged in
            }
        } catch (err) {
            console.error("Failed to load songs:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Callback when a song is liked/unliked on SongCard
    const handleLikeChange = (songId, isNowLiked) => {
        setLikedSongIds((prev) => {
            const next = new Set(prev);
            if (isNowLiked) next.add(songId);
            else next.delete(songId);
            return next;
        });
    };

    // Filter songs based on search input (title, artist, album)
    const filteredSongs = songs.filter((s) => {
        const query = searchTerm.toLowerCase();
        return (
            s.title?.toLowerCase().includes(query) ||
            s.artist?.toLowerCase().includes(query) ||
            s.album?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="flex h-screen bg-black overflow-hidden select-none">
            {/* 1. Left Sidebar */}
            <Sidebar />

            {/* 2. Main Content View */}
            <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto pb-28">
                {/* Top Navigation with Search Input */}
                <Navbar title="Discover & Listen">
                    <div className="relative w-72 max-w-full">
                        <FaSearch className="absolute left-3.5 top-3.5 text-zinc-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search by song, artist..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-full bg-zinc-800 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-green-500 transition"
                        />
                    </div>
                </Navbar>

                {/* Song Grid Section */}
                <main className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-white text-2xl font-bold">
                            {searchTerm ? `Search Results for "${searchTerm}"` : "All Songs"}
                        </h2>
                        <span className="text-xs text-zinc-500 font-semibold">
                            {filteredSongs.length} {filteredSongs.length === 1 ? "track" : "tracks"}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20 text-zinc-400">
                            Loading music collection...
                        </div>
                    ) : filteredSongs.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500">
                            <p className="text-lg">No songs found.</p>
                            <p className="text-sm mt-1">Try another search term or ask an admin to upload tracks!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {filteredSongs.map((song) => (
                                <SongCard
                                    key={song._id}
                                    song={song}
                                    songList={filteredSongs}
                                    isLiked={likedSongIds.has(song._id)}
                                    onLikeChange={handleLikeChange}
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

export default Home;
