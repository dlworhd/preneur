import React, { useState, useEffect } from "react";
import {
    Play,
    Pause,
    Square,
    Music,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    HelpCircle,
} from "lucide-react";
import Button from "../../common/Button";

export default function NavFooter() {
    // Command palette hook
    
    // Pomodoro timer state
    const [time, setTime] = useState(25 * 60);
    const [inputTime, setInputTime] = useState(25);
    const [isRunning, setIsRunning] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Music player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(50);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Sample playlist with audio sources - you can replace with real music files
    const playlist = [
        {
            title: "Focus Music",
            artist: "Ambient",
            duration: "3:45",
            src: "https://cdn.pixabay.com/audio/2023/08/15/audio_41ba2a2f6a.mp3", // 테스트용 샘플
        },
        {
            title: "Deep Work",
            artist: "Lo-Fi",
            duration: "4:12",
            src: "https://cdn.pixabay.com/audio/2025/05/19/audio_1dc3832313.mp3", // 테스트용 샘플
        },
        {
            title: "Concentration",
            artist: "Nature",
            duration: "2:58",
            src: "https://cdn.pixabay.com/audio/2025/03/05/audio_7c5c7d8a00.mp3", // 테스트용 샘플
        },
        {
            title: "Study Beats",
            artist: "Chill",
            duration: "3:33",
            src: "https://cdn.pixabay.com/audio/2024/12/27/audio_10be832d59.mp3", // 테스트용 샘플
        },
    ];

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== "undefined") {
            const savedTime = localStorage.getItem("pomodoroTime");
            if (savedTime) {
                setTime(parseInt(savedTime) * 60);
                setInputTime(parseInt(savedTime));
            }

            // 오디오 초기화
            const audioElement = new Audio();
            audioElement.preload = "metadata";
            audioElement.crossOrigin = "anonymous";
            audioElement.volume = 0.5;
            audioElement.src = playlist[0].src;
            setAudio(audioElement);

            // 오디오 이벤트 리스너
            const handleLoadedMetadata = () => {
                setDuration(audioElement.duration);
            };

            const handleTimeUpdate = () => {
                setCurrentTime(audioElement.currentTime);
            };

            const handleEnded = () => {
                console.log('Track ended, moving to next track');
                setCurrentTime(0);
                // 다음 곡으로 자동 이동 (마지막 곡이면 처음으로)
                setCurrentTrack((prev) => {
                    const nextIndex = (prev + 1) % playlist.length;
                    console.log(`Moving from track ${prev} to track ${nextIndex}`);
                    return nextIndex;
                });
                // 재생 상태는 유지하고, 트랙 변경 useEffect에서 자동 재생 처리
            };

            audioElement.addEventListener(
                "loadedmetadata",
                handleLoadedMetadata
            );
            audioElement.addEventListener("timeupdate", handleTimeUpdate);
            audioElement.addEventListener("ended", handleEnded);

            return () => {
                audioElement.removeEventListener(
                    "loadedmetadata",
                    handleLoadedMetadata
                );
                audioElement.removeEventListener(
                    "timeupdate",
                    handleTimeUpdate
                );
                audioElement.removeEventListener("ended", handleEnded);
                audioElement.pause();
            };
        }
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRunning && time > 0) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime - 1);
            }, 1000);
        } else if (time === 0) {
            setIsRunning(false);
            setTime(inputTime * 60);
            setShowToast(true);
        }
        return () => clearInterval(interval);
    }, [isRunning, time, inputTime]);

    // 트랙 변경 시 오디오 소스 업데이트
    useEffect(() => {
        if (audio && playlist[currentTrack]) {
            console.log(`Loading track ${currentTrack}: ${playlist[currentTrack].title}`);
            const wasPlaying = isPlaying;
            
            audio.src = playlist[currentTrack].src;
            audio.load();
            setCurrentTime(0);
            
            // 재생 중이었다면 새 트랙 자동 재생
            if (wasPlaying) {
                console.log('Auto-playing next track');
                // 약간의 지연 후 재생 (로딩 완료 대기)
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log('Auto-play successful');
                        })
                        .catch(error => {
                            console.error('Auto-play failed:', error);
                            // 자동재생 실패 시 재생 상태를 false로 변경
                            setIsPlaying(false);
                        });
                }
            }
        }
    }, [currentTrack, audio]);

    // 볼륨 변경 시 오디오 볼륨 업데이트
    useEffect(() => {
        if (audio) {
            audio.volume = isMuted ? 0 : volume / 100;
            audio.muted = isMuted;
        }
    }, [volume, audio, isMuted]);

    // Pomodoro timer functions
    const startTimer = () => {
        setIsRunning(true);
        localStorage.setItem("pomodoroTime", inputTime.toString());
    };

    const pauseTimer = () => {
        setIsRunning(false);
    };

    const stopTimer = () => {
        setIsRunning(false);
        setTime(inputTime * 60);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setInputTime(value);
            setTime(value * 60);
        }
    };

    // Music player functions
    const togglePlay = async () => {
        if (!audio) return;

        try {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                await audio.play();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error("Audio play error:", error);
        }
    };

    const stopMusic = () => {
        if (!audio) return;
        
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const nextTrack = () => {
        console.log('Manual next track');
        setCurrentTrack((prev) => (prev + 1) % playlist.length);
        // 현재 재생 중이면 다음 곡도 자동 재생
        if (!isPlaying && audio && !audio.paused) {
            setIsPlaying(true);
        }
    };

    const prevTrack = () => {
        console.log('Manual previous track');
        setCurrentTrack(
            (prev) => (prev - 1 + playlist.length) % playlist.length
        );
        // 현재 재생 중이면 이전 곡도 자동 재생
        if (!isPlaying && audio && !audio.paused) {
            setIsPlaying(true);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        
        // 음소거 상태에서 볼륨바를 조정하면 자동으로 음소거 해제
        if (isMuted) {
            setIsMuted(false);
        }
        
        // 볼륨이 0이면 음소거
        if (newVolume === 0) {
            setIsMuted(true);
        }
    };

    const toggleMute = () => {
        if (isMuted) {
            // 음소거 해제: 이전 볼륨으로 복원
            setIsMuted(false);
            setVolume(previousVolume);
        } else {
            // 음소거: 현재 볼륨 저장 후 0으로 설정
            setPreviousVolume(volume);
            setIsMuted(true);
        }
    };

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    if (!isClient)
        return (
            <div className="h-20 flex-1 flex flex-col justify-end items-center"></div>
        );

    return (
        <div className="h-20 flex-1 flex flex-col justify-end items-center">
            
            
            {/* Unified Music Player Box */}
            <div className="w-full bg-[var(--background)]/90 border border-[var(--container-border)]/50 rounded-lg p-3 text-[var(--secondary)] opacity-60 hover:opacity-100 transition-opacity duration-300 relative">
                {/* Help Icon */}
                <div className="absolute top-2 right-2 group">
                    <Button className="p-0.5 rounded-full hover:bg-[var(--primary)]/10 transition-colors">
                        <HelpCircle width={10} height={10} className="opacity-40 hover:opacity-70" />
                    </Button>
                    <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-[var(--background)] border border-[var(--container-border)] rounded text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        로열티 프리 음악입니다 :)
                    </div>
                </div>
                
                {/* Track Info */}
                <div className="text-center mb-2">
                    <div className="text-[10px] font-medium truncate flex items-center justify-center gap-1">
                        <Music width={10} height={10} />
                        {playlist[currentTrack].title} <span className="opacity-70 truncate">{playlist[currentTrack].artist}</span>
                    </div>
                    <div className="text-[9px] opacity-70 truncate">
                         {" "}
                        {duration > 0
                            ? `${Math.floor(currentTime / 60)}:${Math.floor(
                                  currentTime % 60
                              )
                                  .toString()
                                  .padStart(2, "0")} | ${Math.floor(
                                  duration / 60
                              )}:${Math.floor(duration % 60)
                                  .toString()
                                  .padStart(2, "0")}`
                            : playlist[currentTrack].duration}
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between mb-2">
                    {/* Music Controls */}
                    <div className="flex items-center gap-1">
                        <Button
                            onClick={prevTrack}
                            className="p-0.5 rounded hover:bg-[var(--primary)]/10 transition-colors"
                        >
                            <SkipBack width={10} height={10} />
                        </Button>
                        <Button
                            onClick={togglePlay}
                            className="p-0.5 rounded hover:bg-[var(--primary)]/10 transition-colors"
                        >
                            {isPlaying ? (
                                <Pause width={12} height={12} />
                            ) : (
                                <Play width={12} height={12} />
                            )}
                        </Button>
                        <Button
                            onClick={stopMusic}
                            className="p-0.5 rounded hover:bg-[var(--primary)]/10 transition-colors"
                            title="정지"
                        >
                            <Square width={10} height={10} />
                        </Button>
                        <Button
                            onClick={nextTrack}
                            className="p-0.5 rounded hover:bg-[var(--primary)]/10 transition-colors"
                        >
                            <SkipForward width={10} height={10} />
                        </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-1">
                        <Button
                            onClick={toggleMute}
                            className="p-0.5 rounded hover:bg-[var(--primary)]/10 transition-colors"
                            title={isMuted ? "음소거 해제" : "음소거"}
                        >
                            {isMuted ? (
                                <VolumeX width={10} height={10} />
                            ) : (
                                <Volume2 width={10} height={10} />
                            )}
                        </Button>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-12 h-1 bg-[var(--container-border)] rounded-lg appearance-none cursor-pointer volume-slider"
                            style={{
                                background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${isMuted ? 0 : volume}%, var(--container-border) ${isMuted ? 0 : volume}%, var(--container-border) 100%)`,
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                            }}
                        />
                    </div>
                </div>

                {/* Progress Bar */}
                <div
                    className="w-full bg-[var(--container-border)] rounded-full h-1 cursor-pointer"
                    onClick={(e) => {
                        if (audio && duration > 0) {
                            const rect =
                                e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            const clickRatio = clickX / rect.width;
                            const newTime = clickRatio * duration;
                            audio.currentTime = newTime;
                            setCurrentTime(newTime);
                        }
                    }}
                >
                    <div
                        className="bg-[var(--primary)] h-1 rounded-full transition-all duration-300"
                        style={{
                            width:
                                duration > 0
                                    ? `${(currentTime / duration) * 100}%`
                                    : "0%",
                        }}
                    ></div>
                </div>
            </div>

            {/* Pomodoro Timer */}
            {/* <div className="flex items-center gap-1 mb-1">
                <Timer width={14} height={14} />
                <span className="font-mono text-base font-bold">
                    {minutes.toString().padStart(2, "0")}:
                    {seconds.toString().padStart(2, "0")}
                </span>
            </div>
            <div className="flex gap-1 text-[10px] bg-[var(--background)]/80 p-1 rounded border border-[var(--container-border)]/50">
                <input
                    type="number"
                    value={inputTime}
                    onChange={handleTimeChange}
                    className="w-12 bg-transparent text-center focus:outline-none"
                    min="1"
                    disabled={isRunning}
                />
                <button
                    onClick={startTimer}
                    disabled={isRunning}
                    className="p-0.5 rounded hover:bg-[var(--primary)]/10 disabled:opacity-30"
                >
                    <Play width={10} height={10} />
                </button>
                <button
                    onClick={pauseTimer}
                    disabled={!isRunning}
                    className="p-0.5 rounded hover:bg-[var(--primary)]/10 disabled:opacity-30"
                >
                    <Pause width={10} height={10} />
                </button>
                <button
                    onClick={stopTimer}
                    className="p-0.5 rounded hover:bg-[var(--primary)]/10"
                >
                    <Square width={10} height={10} />
                </button>
            </div>
            {isClient && showToast && (
                <Toast
                    message="뽀모도로 타이머가 완료되었습니다!"
                    type="success"
                    onClose={() => {
                        setShowToast(false);
                    }}
                />
            )} */}
        </div>
    );
}
