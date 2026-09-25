import React, { useState } from 'react';
import { MediaState, MediaTrack } from '../../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Music2,
  Radio,
  Cast,
} from 'lucide-react';

interface MediaControllerWidgetProps {
  mediaState: MediaState;
  onControlMedia: (
    action: 'play' | 'pause' | 'togglePlay' | 'next' | 'prev' | 'seek' | 'volume' | 'toggleLike' | 'changeTrack',
    data?: any
  ) => void;
  sourceDeviceName?: string;
}

const SAMPLE_TRACKS: MediaTrack[] = [
  {
    id: 'track-1',
    title: 'Midnight City',
    artist: 'M83',
    album: "Hurry Up, We're Dreaming",
    app: 'Spotify',
    duration: 244,
    coverGradient: 'from-violet-600 via-indigo-600 to-cyan-500',
  },
  {
    id: 'track-2',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    app: 'Apple Music',
    duration: 230,
    coverGradient: 'from-rose-600 via-amber-600 to-yellow-500',
  },
  {
    id: 'track-3',
    title: 'Get Lucky',
    artist: 'Daft Punk ft. Pharrell Williams',
    album: 'Random Access Memories',
    app: 'YouTube Music',
    duration: 248,
    coverGradient: 'from-blue-600 via-sky-500 to-emerald-400',
  },
  {
    id: 'track-4',
    title: 'Waveform Podcast',
    artist: 'MKBHD & David Imel',
    album: 'Ep. 214: Chrome OS Flex',
    app: 'Podcasts',
    duration: 320,
    coverGradient: 'from-emerald-600 via-teal-600 to-indigo-600',
  },
];

export const MediaControllerWidget: React.FC<MediaControllerWidgetProps> = ({
  mediaState,
  onControlMedia,
  sourceDeviceName = 'Android Phone',
}) => {
  const { currentTrack, isPlaying, position, volume, isLiked } = mediaState;
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(position);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.floor(Math.max(0, secs) % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentPos = isScrubbing ? scrubPosition : position;
  const progressPercent = Math.min(100, Math.max(0, (currentPos / currentTrack.duration) * 100));

  const handleSeekCommit = (newPos: number) => {
    setIsScrubbing(false);
    onControlMedia('seek', { position: newPos });
  };

  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-[#161822]/80 backdrop-blur-xl p-4.5 shadow-lg flex flex-col justify-between relative overflow-hidden">
      {/* Apple-style background blur glow */}
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${currentTrack.coverGradient} opacity-20 blur-2xl transition-all duration-700`}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#ff2d55]/15 border border-[#ff2d55]/25 text-[#ff2d55]">
            <Music2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white/95 tracking-tight flex items-center gap-1.5">
              <span>Now Playing</span>
              <Cast className="w-3 h-3 text-[#0a84ff]" />
            </h3>
            <p className="text-[10px] text-white/40">Remote media on {sourceDeviceName}</p>
          </div>
        </div>

        {/* Source App Badge */}
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] border border-white/[0.08] text-white/80">
          <span className="h-1.5 w-1.5 rounded-full bg-[#30d158] animate-pulse" />
          <span>{currentTrack.app}</span>
        </span>
      </div>

      {/* Main Track Info & Artwork */}
      <div className="my-3.5 flex items-center gap-3.5 relative z-10">
        {/* Album Artwork Squircle */}
        <div
          className={`relative h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br ${currentTrack.coverGradient} shadow-md ring-1 ring-white/10 flex items-center justify-center overflow-hidden`}
        >
          {/* Animated vinyl disc/ring reflection */}
          <div className={`h-8 w-8 rounded-full border border-white/20 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
            <div className="h-3 w-3 rounded-full bg-black/50" />
          </div>
        </div>

        {/* Track details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-[13.5px] font-semibold text-white/95 tracking-tight truncate leading-tight">
              {currentTrack.title}
            </h4>
            <button
              onClick={() => onControlMedia('toggleLike')}
              className="text-white/40 hover:text-[#ff2d55] p-1 transition shrink-0 active:scale-90"
              title={isLiked ? 'Unlike' : 'Favorite'}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isLiked ? 'fill-[#ff2d55] text-[#ff2d55]' : 'hover:fill-white/20'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-white/60 truncate mt-0.5">{currentTrack.artist}</p>
          <p className="text-[10px] text-white/40 truncate mt-0.5">{currentTrack.album}</p>
        </div>
      </div>

      {/* Scrubber Progress Bar */}
      <div className="space-y-1 relative z-10">
        <div className="relative group">
          <input
            type="range"
            min={0}
            max={currentTrack.duration}
            value={currentPos}
            onChange={(e) => {
              setIsScrubbing(true);
              setScrubPosition(Number(e.target.value));
            }}
            onMouseUp={() => handleSeekCommit(scrubPosition)}
            onTouchEnd={() => handleSeekCommit(scrubPosition)}
            className="w-full h-1 bg-white/[0.1] rounded-full appearance-none cursor-pointer accent-white"
            style={{
              background: `linear-gradient(to right, #0071e3 ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%)`,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-white/45 tabular-nums font-mono">
          <span>{formatTime(currentPos)}</span>
          <span>-{formatTime(currentTrack.duration - currentPos)}</span>
        </div>
      </div>

      {/* Apple Transport Buttons */}
      <div className="my-2 flex items-center justify-center gap-5 relative z-10">
        {/* Previous */}
        <button
          onClick={() => onControlMedia('prev')}
          className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/[0.08] transition active:scale-90"
          title="Previous Track"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>

        {/* Play / Pause Toggle (Apple circular white button) */}
        <button
          onClick={() => onControlMedia('togglePlay')}
          className="h-11 w-11 rounded-full bg-white hover:bg-neutral-100 text-black shadow-lg flex items-center justify-center transition active:scale-95"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={() => onControlMedia('next')}
          className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/[0.08] transition active:scale-90"
          title="Next Track"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Volume Slider */}
      <div className="mt-1 flex items-center gap-2 text-white/40 relative z-10 px-1">
        <button
          onClick={() => onControlMedia('volume', { volume: volume === 0 ? 70 : 0 })}
          className="hover:text-white transition"
          title="Mute/Unmute"
        >
          {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => onControlMedia('volume', { volume: Number(e.target.value) })}
          className="flex-1 h-1 bg-white/[0.1] rounded-full appearance-none cursor-pointer accent-white"
          style={{
            background: `linear-gradient(to right, rgba(255,255,255,0.7) ${volume}%, rgba(255,255,255,0.1) ${volume}%)`,
          }}
        />
        <span className="text-[10px] text-white/40 tabular-nums w-6 text-right font-mono">
          {volume}%
        </span>
      </div>

      {/* Quick Track Switcher (Demo switching songs remotely) */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] relative z-10">
        <span className="text-[10px] uppercase font-semibold text-white/35 block mb-1.5 tracking-wider">
          Quick Playlist:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {SAMPLE_TRACKS.map((t) => (
            <button
              key={t.id}
              onClick={() => onControlMedia('changeTrack', { track: t })}
              className={`px-2 py-1 rounded-lg text-[10.5px] transition shrink-0 flex items-center gap-1 border ${
                currentTrack.id === t.id
                  ? 'bg-white/15 text-white border-white/20 font-medium'
                  : 'bg-black/20 text-white/50 border-white/[0.04] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>{t.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
