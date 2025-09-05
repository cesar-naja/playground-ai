'use client';

import { useEffect, useState } from 'react';
import { Loader2, Sparkles, Wand2, X } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  progress?: number;
}

export default function LoadingModal({ 
  isOpen, 
  onClose, 
  title = "Processing...", 
  message = "Please wait while we process your request...",
  progress = 0
}: LoadingModalProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [dots, setDots] = useState('');

  // Animate progress bar
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setAnimatedProgress(prev => {
          if (prev >= progress) return progress;
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isOpen, progress]);

  // Animate loading dots
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAnimatedProgress(0);
      setDots('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Animated Loading Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
            {/* Sparkles Animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-500 animate-pulse absolute -top-2 -right-2" />
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse absolute -bottom-1 -left-1" />
              <Sparkles className="w-5 h-5 text-pink-400 animate-pulse absolute top-1 -left-3" />
            </div>
          </div>

          {/* Message */}
          <p className="text-lg text-gray-700 mb-6 font-medium">
            {message}
            <span className="inline-block w-8 text-left">{dots}</span>
          </p>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(animatedProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${animatedProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Motivational Text */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>✨ Crafting something amazing for you</p>
            <p>🎨 This usually takes 10-30 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
}
