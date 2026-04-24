'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, Settings } from 'lucide-react';
import { formatTime, cn } from '@/lib/utils';

type Props = {
  src: string;
  poster?: string;
  initialTime?: number;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
};

export function VideoPlayer({ src, poster, initialTime = 0, onProgress, onEnded }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const progressEmit = useRef(0);

  useEffect(() => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
      setTime(initialTime);
    }
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) v.play(); else v.pause();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'ArrowRight') videoRef.current.currentTime += 5;
      else if (e.key === 'ArrowLeft') videoRef.current.currentTime -= 5;
      else if (e.key === 'f') containerRef.current?.requestFullscreen?.();
      else if (e.key === 'm') setMuted((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay]);

  let hideTimer: any;
  const revealControls = () => {
    setShowControls(true);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (playing) setShowControls(false); }, 2500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
      className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        className="h-full w-full"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
        onTimeUpdate={(e) => {
          const t = (e.target as HTMLVideoElement).currentTime;
          setTime(t);
          if (onProgress && Math.abs(t - progressEmit.current) >= 5) {
            progressEmit.current = t;
            onProgress(t, duration);
          }
        }}
        onVolumeChange={(e) => {
          const v = e.target as HTMLVideoElement;
          setVolume(v.volume); setMuted(v.muted);
        }}
        onEnded={() => { setPlaying(false); onEnded?.(); }}
      />

      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 grid place-items-center bg-black/30 text-white"
        >
          <span className="grid h-20 w-20 place-items-center rounded-full bg-white/95 text-primary shadow-2xl">
            <Play size={28} className="fill-primary" />
          </span>
        </button>
      )}

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 text-white transition',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
      >
        <input
          type="range"
          className="range-video w-full"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onMouseDown={() => setSeeking(true)}
          onMouseUp={() => setSeeking(false)}
          onChange={(e) => { if (videoRef.current) videoRef.current.currentTime = Number(e.target.value); }}
        />
        <div className="mt-2 flex items-center gap-3">
          <IconBtn onClick={togglePlay}>{playing ? <Pause size={18} /> : <Play size={18} />}</IconBtn>
          <IconBtn onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }}><RotateCcw size={16} /></IconBtn>
          <IconBtn onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }}><RotateCw size={16} /></IconBtn>
          <div className="flex items-center gap-2">
            <IconBtn onClick={() => setMuted((m) => !m)}>{muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}</IconBtn>
            <input
              type="range" min={0} max={1} step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v); setMuted(v === 0);
                if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = v === 0; }
              }}
              className="range-video h-1 w-20"
            />
          </div>
          <div className="text-xs tabular-nums text-white/80">
            {formatTime(time)} / {formatTime(duration)}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <IconBtn onClick={() => setShowSettings((v) => !v)}><Settings size={16} /></IconBtn>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 w-32 rounded-lg border border-white/10 bg-black/95 p-1 text-sm backdrop-blur">
                  <div className="px-2 py-1 text-xs uppercase text-white/50">Speed</div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRate(r); if (videoRef.current) videoRef.current.playbackRate = r;
                        setShowSettings(false);
                      }}
                      className={cn('block w-full rounded px-2 py-1 text-left hover:bg-white/10', rate === r && 'text-primary')}
                    >
                      {r}x {rate === r && '·'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <IconBtn onClick={() => containerRef.current?.requestFullscreen?.()}><Maximize size={16} /></IconBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-lg text-white/90 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}
