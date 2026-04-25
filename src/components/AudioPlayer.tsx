import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X } from 'lucide-react';
import { motion } from 'motion/react';

interface AudioPlayerProps {
  url: string;
  onClose: () => void;
  transcript?: TranscriptLine[];
}

interface TranscriptLine {
  speaker: string;
  text: string;
  timestamp: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, onClose, transcript: propTranscript }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Mock transcript data - replace with actual transcript from your audio processing
  const defaultTranscript: TranscriptLine[] = [
    { speaker: "Host", text: "Welcome to today's research deep dive. We're exploring the fascinating world of artificial intelligence and its impact on modern society.", timestamp: 0 },
    { speaker: "Guest", text: "Thank you for having me. It's an exciting time to be working in this field. The developments we're seeing are truly transformative.", timestamp: 5 },
    { speaker: "Host", text: "Let's start with the basics. Can you explain what makes current AI systems different from previous generations?", timestamp: 12 },
    { speaker: "Guest", text: "Absolutely. The key difference is scale and capability. Modern AI systems can understand context, generate creative content, and even reason through complex problems.", timestamp: 18 },
    { speaker: "Host", text: "That's remarkable. What are some of the most promising applications you're seeing?", timestamp: 28 },
    { speaker: "Guest", text: "We're seeing breakthroughs in healthcare, education, scientific research, and creative industries. AI is becoming a powerful tool for human augmentation.", timestamp: 33 },
  ];

  const transcript = propTranscript || defaultTranscript;

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    // Update active transcript line based on current time
    const currentIndex = transcript.findIndex((line, index) => {
      const nextLine = transcript[index + 1];
      return currentTime >= line.timestamp && (!nextLine || currentTime < nextLine.timestamp);
    });
    setActiveLineIndex(currentIndex);
  }, [currentTime]);

  useEffect(() => {
    // Auto-scroll to keep active line centered
    if (activeLineRef.current && transcriptRef.current && activeLineIndex >= 0) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLineIndex]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold mb-2">Research Deep Dive Podcast</h1>
          <p className="text-orange-100">AI Generated Audio Summary</p>
        </div>

        {/* Player Controls */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-all"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <div className="flex-1">
              <div className="text-sm text-gray-600">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div ref={transcriptRef} className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Transcript</h2>
          <div className="space-y-4">
            {transcript.map((line, index) => (
              <div
                key={index}
                ref={index === activeLineIndex ? activeLineRef : null}
                className={`flex gap-3 transition-colors ${
                  index === activeLineIndex ? 'bg-orange-100 -mx-2 px-2 py-1 rounded' : ''
                }`}
              >
                <div className={`font-semibold min-w-[80px] ${
                  line.speaker === 'Host'
                    ? 'text-orange-600'
                    : 'text-orange-500'
                }`}>
                  {line.speaker}:
                </div>
                <div className="text-gray-700 flex-1">
                  {line.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <audio
          ref={audioRef}
          src={url}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </motion.div>
    </div>
  );
};
