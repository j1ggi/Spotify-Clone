import {
    FaPlay,
    FaPause,
    FaStepForward,
    FaStepBackward,
    FaVolumeUp,
    FaVolumeMute
} from "react-icons/fa";
import { usePlayer } from "../context/PlayerContext";

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function Player() {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        nextSong,
        prevSong,
        seek,
        setVolume
    } = usePlayer();

    // If no song is selected, show minimal placeholder bar
    if (!currentSong) {
        return (
            <div className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-950 border-t border-zinc-800 px-6 flex items-center justify-between z-30 select-none">
                <div className="text-zinc-500 text-sm">
                    Select a song to start listening to Musicify
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 h-22 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 px-6 flex items-center justify-between z-30 select-none">
            {/* 1. Left: Song Details */}
            <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
                <img
                    src={currentSong.image || "https://placehold.co/100x100/18181b/22c55e?text=Song"}
                    alt={currentSong.title}
                    className="w-14 h-14 object-cover rounded-md shadow bg-zinc-800 shrink-0"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/100x100/18181b/22c55e?text=Song";
                    }}
                />
                <div className="overflow-hidden">
                    <p className="text-white text-sm font-semibold truncate">
                        {currentSong.title}
                    </p>
                    <p className="text-zinc-400 text-xs truncate mt-0.5">
                        {currentSong.artist}
                    </p>
                </div>
            </div>

            {/* 2. Center: Controls & Progress Bar */}
            <div className="flex flex-col items-center gap-2 max-w-xl w-2/4">
                {/* Playback Buttons */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={prevSong}
                        className="text-zinc-400 hover:text-white transition text-lg"
                        title="Previous Song"
                    >
                        <FaStepBackward />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-white text-black hover:scale-105 active:scale-95 flex items-center justify-center transition shadow-md"
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <FaPause className="text-sm" />
                        ) : (
                            <FaPlay className="text-sm ml-0.5" />
                        )}
                    </button>

                    <button
                        onClick={nextSong}
                        className="text-zinc-400 hover:text-white transition text-lg"
                        title="Next Song"
                    >
                        <FaStepForward />
                    </button>
                </div>

                {/* Progress Bar & Timers */}
                <div className="flex items-center gap-3 w-full">
                    <span className="text-zinc-400 text-xs w-10 text-right font-mono">
                        {formatTime(currentTime)}
                    </span>

                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={currentTime || 0}
                        onChange={(e) => seek(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
                    />

                    <span className="text-zinc-400 text-xs w-10 font-mono">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* 3. Right: Volume Controls */}
            <div className="flex items-center justify-end gap-3 w-1/4 min-w-[150px]">
                <button
                    onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                    className="text-zinc-400 hover:text-white transition"
                    title={volume === 0 ? "Unmute" : "Mute"}
                >
                    {volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
                />
            </div>
        </div>
    );
}

export default Player;

