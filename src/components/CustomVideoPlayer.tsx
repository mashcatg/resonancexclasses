import { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Volume1,
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomVideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
}

export const CustomVideoPlayer = ({ url, title, className = '' }: CustomVideoPlayerProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<any>(null);
  const [seeking, setSeeking] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Normalize URL
  const normalizeUrl = (inputUrl: string) => {
    if (!inputUrl) return '';
    let clean = inputUrl.trim();
    if (!/^https?:\/\//i.test(clean) && (clean.includes('youtube.com') || clean.includes('youtu.be'))) {
      clean = `https://${clean}`;
    }
    return clean;
  };

  const cleanUrl = normalizeUrl(url);

  // Auto-hide controls
  const hideControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (playing && !showSpeedMenu && !showVolumeSlider) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [playing, showSpeedMenu, showVolumeSlider]);

  useEffect(() => {
    hideControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [hideControlsTimer, showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
    hideControlsTimer();
  };

  const handlePlayPause = useCallback(() => {
    setPlaying(!playing);
  }, [playing]);

  const handleProgress = (state: any) => {
    if (!seeking) {
      setPlayed(state.played);
      setLoaded(state.loaded);
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setPlayed(pos);
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    setSeeking(false);
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    playerRef.current?.seekTo(pos);
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = useCallback(() => {
    setMuted(!muted);
  }, [muted]);

  const skip = (seconds: number) => {
    const current = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(current + seconds);
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(v => Math.min(1, v + 0.1));
          setMuted(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePlayPause, toggleMute, toggleFullscreen]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video bg-zinc-950 rounded-lg overflow-hidden select-none",
        isFullscreen && "rounded-none",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (playing) setShowControls(false);
        setShowVolumeSlider(false);
        setShowSpeedMenu(false);
        setHoverTime(null);
      }}
    >
      {/* Video Player */}
      {cleanUrl && (
        <div className="absolute inset-0">
          <ReactPlayer
            key={cleanUrl}
            ref={playerRef}
            url={cleanUrl}
            playing={playing}
            volume={volume}
            muted={muted}
            playbackRate={playbackRate}
            width="100%"
            height="100%"
            controls={false}
            onProgress={handleProgress}
            onDuration={setDuration}
            onBuffer={() => setBuffering(true)}
            onBufferEnd={() => setBuffering(false)}
            onEnded={() => setPlaying(false)}
            onError={(e) => { console.error(e); setError(e); }}
            config={{
              playerVars: {
                controls: 0,
                modestbranding: 1,
                rel: 0,
                fs: 0,
                disablekb: 1,
                playsinline: 1,
                showinfo: 0,
                iv_load_policy: 3,
                cc_load_policy: 0,
                origin: window.location.origin
              },
            }}
          />
        </div>
      )}

      {/* Clickable overlay for play/pause */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={handlePlayPause}
        onDoubleClick={toggleFullscreen}
      />

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white">
          <div className="text-red-500 mb-2 text-lg font-medium">Unable to play video</div>
          <p className="text-zinc-400 text-sm">Please check the video URL and try again</p>
        </div>
      )}

      {/* Buffering */}
      {buffering && !error && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-full p-4">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        </div>
      )}

      {/* Center Play Button (when paused) */}
      {!playing && !buffering && !error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-white/10 backdrop-blur-md rounded-full p-5 border border-white/20 shadow-2xl transition-transform duration-200 group-hover:scale-105">
            <Play className="w-14 h-14 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Top gradient (for title) */}
      {title && (
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 pb-16 transition-all duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <h3 className="text-white font-semibold text-base line-clamp-1">{title}</h3>
        </div>
      )}

      {/* Bottom Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-30 transition-all duration-300",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />
        
        <div className="relative px-4 pb-3 pt-8">
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="group/progress h-1.5 mb-3 cursor-pointer relative"
            onClick={handleSeekMouseUp}
            onMouseDown={handleSeekMouseDown}
            onMouseMove={(e) => { if (seeking) handleSeekChange(e); handleProgressHover(e); }}
            onMouseUp={handleSeekMouseUp}
            onMouseLeave={() => setHoverTime(null)}
          >
            {/* Background track */}
            <div className="absolute inset-0 bg-white/20 rounded-full" />
            
            {/* Loaded/buffered track */}
            <div 
              className="absolute top-0 left-0 h-full bg-white/40 rounded-full"
              style={{ width: `${loaded * 100}%` }}
            />
            
            {/* Played track */}
            <div 
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-75"
              style={{ width: `${played * 100}%` }}
            />
            
            {/* Hover preview */}
            {hoverTime !== null && (
              <div 
                className="absolute bottom-full mb-2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded pointer-events-none"
                style={{ left: `${hoverPosition}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
            
            {/* Scrubber handle */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg"
              style={{ left: `${played * 100}%` }}
            />
          </div>

          {/* Control buttons row */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="p-2 text-white hover:text-primary transition-colors rounded-full hover:bg-white/10"
            >
              {playing ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            {/* Skip backward */}
            <button
              onClick={() => skip(-10)}
              className="p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10 hidden sm:block"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Skip forward */}
            <button
              onClick={() => skip(10)}
              className="p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10 hidden sm:block"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div 
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={toggleMute}
                className="p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <VolumeIcon className="w-5 h-5" />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300",
                showVolumeSlider ? "w-20 opacity-100 ml-1" : "w-0 opacity-0"
              )}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-primary
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-3 
                    [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-primary
                    [&::-webkit-slider-thumb]:shadow-md"
                />
              </div>
            </div>

            {/* Time display */}
            <div className="text-white/80 text-sm font-mono ml-2 hidden sm:block">
              {formatTime(played * duration)} <span className="text-white/40">/</span> {formatTime(duration)}
            </div>

            <div className="flex-1" />

            {/* Playback speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 text-white/80 hover:text-white text-sm font-medium transition-colors rounded hover:bg-white/10"
              >
                {playbackRate === 1 ? 'Speed' : `${playbackRate}x`}
              </button>
              
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-zinc-900/95 backdrop-blur-sm rounded-lg border border-white/10 py-1 min-w-[80px] shadow-xl">
                  {playbackRates.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => { setPlaybackRate(rate); setShowSpeedMenu(false); }}
                      className={cn(
                        "w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 transition-colors",
                        playbackRate === rate ? "text-primary" : "text-white/80"
                      )}
                    >
                      {rate === 1 ? 'Normal' : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
