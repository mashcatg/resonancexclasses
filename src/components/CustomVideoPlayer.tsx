import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// @ts-ignore - ReactPlayer types are incompatible
const Player = ReactPlayer as any;

interface CustomVideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
}

export const CustomVideoPlayer = ({ url, title, className = '' }: CustomVideoPlayerProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (playing && showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playing, showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleProgress = (state: any) => {
    setPlayed(state.played);
  };

  const handleSeek = (value: number[]) => {
    const seekTo = value[0] / 100;
    setPlayed(seekTo);
    playerRef.current?.seekTo(seekTo);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
    setMuted(false);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Custom keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          playerRef.current?.seekTo(played + 0.05);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          playerRef.current?.seekTo(played - 0.05);
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
  }, [played, playing]);

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = ('0' + date.getUTCSeconds()).slice(-2);
    if (hh) {
      return `${hh}:${('0' + mm).slice(-2)}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <Player
        ref={playerRef}
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        width="100%"
        height="100%"
        onProgress={handleProgress}
        onDuration={setDuration}
        onBuffer={() => setBuffering(true)}
        onBufferEnd={() => setBuffering(false)}
        onEnded={() => setPlaying(false)}
        config={{
          youtube: {
            playerVars: {
              controls: 0,
              modestbranding: 1,
              rel: 0,
              fs: 0,
              disablekb: 1,
            },
          },
        }}
      />

      {/* Loading Indicator */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Large Play Button Overlay */}
      {!playing && !buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button
            size="icon"
            variant="secondary"
            className="w-20 h-20 rounded-full hover:scale-110 transition-transform"
            onClick={handlePlayPause}
          >
            <Play className="w-10 h-10 ml-1" />
          </Button>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !playing ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[played * 100]}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={handlePlayPause}
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          {/* Volume Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={toggleMute}
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <div className="w-20 hidden sm:block">
              <Slider
                value={[muted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Time Display */}
          <span className="text-sm text-white font-medium hidden sm:inline">
            {formatTime(played * duration)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Playback Speed */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <DropdownMenuItem
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={playbackRate === rate ? 'bg-accent' : ''}
                >
                  {rate === 1 ? 'Normal' : `${rate}x`}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen */}
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={toggleFullscreen}
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Title Overlay */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 pointer-events-none">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
      )}
    </div>
  );
};
