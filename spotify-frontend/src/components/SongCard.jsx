import { useState } from "react";
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaPlus } from "react-icons/fa";
import { usePlayer } from "../context/PlayerContext";
import api from "../services/api";
import { toast } from "react-toastify";

function SongCard({
    song,
    songList = [],
    isLiked = false,
    onLikeChange = null,
    userPlaylists = [],
    onSongAddedToPlaylist = null
}) {
    const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
    const [liked, setLiked] = useState(isLiked);
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

    const isCurrentActive = currentSong?._id === song._id;

    // Handle Play / Pause click
    const handlePlayClick = () => {
        if (!song.audio) {
            toast.error(`"${song.title}" has no audio file attached!`);
            return;
        }

        if (isCurrentActive) {
            togglePlay();
        } else {
            playSong(song, songList);
        }
    };

    // Handle Like / Unlike
    const handleLikeClick = async () => {
        try {
            if (liked) {
                await api.delete(`/auth/unlike/${song._id}`);
                setLiked(false);
                toast.info("Removed from Liked Songs");
                if (onLikeChange) onLikeChange(song._id, false);
            } else {
                await api.post(`/auth/like/${song._id}`);
                setLiked(true);
                toast.success("Added to Liked Songs");
                if (onLikeChange) onLikeChange(song._id, true);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update like status");
        }
    };

    // Handle adding song to a specific playlist
    const handleAddToPlaylist = async (playlistId) => {
        try {
            await api.put(`/playlist/addsong/${playlistId}`, {
                songId: song._id
            });
            toast.success("Song added to playlist");
            setShowPlaylistMenu(false);
            if (onSongAddedToPlaylist) onSongAddedToPlaylist(playlistId, song._id);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not add to playlist");
        }
    };

    return (
        <div className="group bg-zinc-900/90 hover:bg-zinc-800 p-4 rounded-xl transition duration-200 flex flex-col justify-between relative shadow-md">
            <div>
                {/* Cover Image (Clickable) */}
                <div
                    onClick={handlePlayClick}
                    className="relative w-full aspect-square overflow-hidden rounded-lg mb-4 bg-zinc-800 cursor-pointer"
                >
                    <img
                        src={song.image || "https://placehold.co/300x300/18181b/22c55e?text=Musicify"}
                        alt={song.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/300x300/18181b/22c55e?text=Musicify";
                        }}
                    />

                    {/* Quick Play overlay icon */}
                    <div
                        className={`absolute bottom-3 right-3 w-11 h-11 rounded-full bg-green-500 text-black flex items-center justify-center shadow-lg transition duration-200 transform ${
                            isCurrentActive && isPlaying
                                ? "opacity-100 scale-100"
                                : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                        } hover:scale-110`}
                    >
                        {isCurrentActive && isPlaying ? (
                            <FaPause className="text-sm" />
                        ) : (
                            <FaPlay className="text-sm ml-0.5" />
                        )}
                    </div>
                </div>

                {/* Song Meta (Clickable Title) */}
                <h3
                    onClick={handlePlayClick}
                    className={`font-bold text-base truncate cursor-pointer hover:underline ${
                        isCurrentActive ? "text-green-500" : "text-white"
                    }`}
                >
                    {song.title}
                </h3>
                <p className="text-sm text-zinc-400 truncate mt-0.5">{song.artist}</p>
                {song.album && (
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {song.album} • {song.duration || "Audio"}
                    </p>
                )}

                {/* Prominent Always-Visible Play Button */}
                <button
                    onClick={handlePlayClick}
                    className={`mt-4 w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition duration-200 shadow cursor-pointer ${
                        isCurrentActive && isPlaying
                            ? "bg-zinc-100 hover:bg-white text-black"
                            : "bg-green-500 hover:bg-green-400 text-black"
                    }`}
                >
                    {isCurrentActive && isPlaying ? (
                        <>
                            <FaPause className="text-xs" />
                            <span>Pause</span>
                        </>
                    ) : (
                        <>
                            <FaPlay className="text-xs ml-0.5" />
                            <span>Play</span>
                        </>
                    )}
                </button>
            </div>

            {/* Bottom Actions: Like and Add to Playlist */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/60">
                <button
                    onClick={handleLikeClick}
                    className="text-zinc-400 hover:text-red-500 transition text-lg p-1"
                    title={liked ? "Unlike" : "Like"}
                >
                    {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </button>

                {/* Add to Playlist button */}
                {userPlaylists.length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                            className="text-zinc-400 hover:text-green-500 transition text-sm flex items-center gap-1.5 p-1"
                            title="Add to Playlist"
                        >
                            <FaPlus className="text-xs" />
                            <span className="text-xs">Playlist</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showPlaylistMenu && (
                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl p-2 z-20">
                                <p className="text-xs font-semibold text-zinc-400 px-2 py-1 border-b border-zinc-800">
                                    Add to playlist:
                                </p>
                                <div className="max-h-36 overflow-y-auto mt-1">
                                    {userPlaylists.map((pl) => (
                                        <button
                                            key={pl._id}
                                            onClick={() => handleAddToPlaylist(pl._id)}
                                            className="w-full text-left px-2 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded truncate"
                                        >
                                            {pl.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SongCard;
