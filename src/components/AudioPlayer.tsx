import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Headphones, Volume2, VolumeX, RotateCcw, RotateCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface AudioPlayerProps {
  url: string;
  onClose: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime + seconds;
      audioRef.current.currentTime = Math.max(0, Math.min(duration, newTime));
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-[#1F2937] text-white p-5 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col gap-4 border border-white/10"
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="min-w-0">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Research Podcast</p>
               <p className="text-[15px] font-bold truncate">Research Deep Dive Podcast</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 group">
               <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-gray-400 hover:text-white transition-colors"
               >
                 {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
               </button>
               <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary group-hover:bg-gray-500 transition-all"
               />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSkip(-15)}
                className="p-2 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95"
                title="Skip back 15s"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              <button
                onClick={togglePlay}
                className="w-12 h-12 bg-white text-[#1F2937] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 shadow-xl transition-all"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>

              <button
                onClick={() => handleSkip(15)}
                className="p-2 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95"
                title="Skip forward 15s"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 px-2">
           <span className="text-[10px] font-mono text-gray-400 w-8">{formatTime(currentTime)}</span>
           <div className="flex-1 relative group h-4 flex items-center">
              <input 
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="absolute inset-0 w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary group-hover:h-1.5 transition-all"
              />
           </div>
           <span className="text-[10px] font-mono text-gray-400 w-8">{formatTime(duration)}</span>
        </div>
        
        <audio 
          ref={audioRef}
          src={url} 
          autoPlay 
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </motion.div>
    </div>
  );
};
