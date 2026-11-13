/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
    const audioRef = useRef(new Audio());
    const [currentSong, setCurrentSong] = useState(null);
    const [songList, setSongList] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.8);

    // Keep ref to nextSong to avoid re-subscribing event listeners
    const nextSongRef = useRef(() => {});

    // 1. Play or toggle a song
    const playSong = useCallback((song, list = null) => {
        if (!song) return;

        if (!song.audio) {
            toast.error(`"${song.title || 'Song'}" does not have an audio file.`, {
                toastId: "audio-missing"
            });
            return;
        }

        const audio = audioRef.current;

        // If clicking currently active song, toggle play/pause
        if (currentSong && currentSong._id === song._id) {
            if (audio.paused) {
                audio.play()
                    .then(() => setIsPlaying(true))
                    .catch((err) => {
                        console.error("Resume error:", err);
                        toast.error("Cannot resume audio: " + err.message, {
                            toastId: "audio-resume-error"
                        });
                    });
            } else {
                audio.pause();
                setIsPlaying(false);
            }
            return;
        }

        // New song selected
        if (list && Array.isArray(list) && list.length > 0) {
            setSongList(list);
        }

        audio.pause();
        audio.currentTime = 0;
        setCurrentTime(0);
        setCurrentSong(song);

        audio.src = song.audio;
        audio.load();

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setIsPlaying(true);
                })
                .catch((err) => {
                    console.error("Audio playback error:", err);
                    setIsPlaying(false);
                    if (err.name !== "AbortError") {
                        toast.error("Could not play audio: " + err.message, {
                            toastId: "audio-error"
                        });
                    }
                });
        }
    }, [currentSong]);

    // 2. Toggle Play / Pause for currently loaded song
    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!currentSong) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch((err) => {
                        console.error("Playback resume error:", err);
                        if (err.name !== "AbortError") {
                            toast.error("Cannot play audio: " + err.message, {
                                toastId: "audio-error"
                            });
                        }
                    });
            }
        }
    }, [currentSong, isPlaying]);

    // 3. Next Song
    const handleNextSong = useCallback(() => {
        if (!songList.length || !currentSong) return;
        const currentIndex = songList.findIndex((s) => s._id === currentSong._id);
        const nextIndex = (currentIndex + 1) % songList.length;
        playSong(songList[nextIndex]);
    }, [songList, currentSong, playSong]);

    // 4. Previous Song
    const handlePrevSong = useCallback(() => {
        if (!songList.length || !currentSong) return;
        const currentIndex = songList.findIndex((s) => s._id === currentSong._id);
        const prevIndex = (currentIndex - 1 + songList.length) % songList.length;
        playSong(songList[prevIndex]);
    }, [songList, currentSong, playSong]);

    // Sync nextSongRef for the ended event
    useEffect(() => {
        nextSongRef.current = handleNextSong;
    }, [handleNextSong]);

    // 5. Seek to timestamp
    const seek = (seconds) => {
        const audio = audioRef.current;
        if (!isNaN(seconds)) {
            audio.currentTime = seconds;
            setCurrentTime(seconds);
        }
    };

    // 6. Volume Control
    const setVolume = (val) => {
        const vol = Math.max(0, Math.min(1, val));
        audioRef.current.volume = vol;
        setVolumeState(vol);
    };

    // Set initial audio volume
    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    // 7. Attach native HTML5 audio listeners once
    useEffect(() => {
        const audio = audioRef.current;

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onLoadedMetadata = () => setDuration(audio.duration || 0);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => {
            if (nextSongRef.current) nextSongRef.current();
        };
        const onError = () => {
            const err = audio.error;
            console.error("Audio error event:", err);
            setIsPlaying(false);
            let msg = "Failed to load audio file.";
            if (err) {
                if (err.code === 2) msg = "Network error loading audio file.";
                if (err.code === 3) msg = "Audio decoding error or unsupported format.";
                if (err.code === 4) msg = "Audio source not supported or URL unavailable.";
            }
            toast.error(msg, { toastId: "audio-error" });
        };

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("error", onError);
        };
    }, []);

    return (
        <PlayerContext.Provider
            value={{
                currentSong,
                songList,
                setSongList,
                isPlaying,
                currentTime,
                duration,
                volume,
                playSong,
                togglePlay,
                nextSong: handleNextSong,
                prevSong: handlePrevSong,
                seek,
                setVolume
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    return useContext(PlayerContext);
}
