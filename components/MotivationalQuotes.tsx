'use client';

import { useState, useEffect } from 'react';
interface MotivationalQuote {
  quote: string;
  author: string;
  theme: string;
}
import { RefreshCw, Quote } from 'lucide-react';

interface QuoteWithImage extends MotivationalQuote {
  image: string;
}

export default function MotivationalQuotes() {
  const [currentQuote, setCurrentQuote] = useState<QuoteWithImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeClass, setFadeClass] = useState('opacity-100');

  const fetchNewQuote = async () => {
    setIsLoading(true);
    setFadeClass('opacity-0');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for slower fade out
      const response = await fetch('/api/motivational-quote');
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }
      const newQuote = await response.json();
      setCurrentQuote(newQuote);
      setFadeClass('opacity-100');
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load initial quote
    fetchNewQuote();
    
    // Set up auto-refresh every 8 seconds
    const interval = setInterval(() => {
      fetchNewQuote();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  if (!currentQuote) {
    return (
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg mb-4 max-w-2xl mx-auto"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg max-w-md mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[2000ms] ease-in-out ${fadeClass}`}
          style={{ backgroundImage: `url(${currentQuote.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <div className={`transition-all duration-[1500ms] ease-in-out transform ${fadeClass} ${fadeClass === 'opacity-100' ? 'translate-y-0' : 'translate-y-4'}`}>
          {/* Quote Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Quote className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Quote Text */}
          <blockquote className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
              &ldquo;{currentQuote.quote}&rdquo;
            </span>
          </blockquote>

          {/* Author */}
          <p className="text-xl md:text-2xl text-blue-100 mb-4 font-medium">
            — {currentQuote.author}
          </p>

          {/* Theme Badge */}
          <div className="inline-flex items-center px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
            <span className="text-white/90 font-medium capitalize">
              {currentQuote.theme}
            </span>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-center">
            <button
              onClick={fetchNewQuote}
              disabled={isLoading}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              {isLoading ? 'Generating...' : 'New Quote'}
            </button>
          </div>
        </div>

        {/* Auto-refresh Indicator */}
        <div className="mt-8">
          <div className="flex justify-center items-center gap-2 text-white/60 text-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>Auto-refreshing every 8 seconds</span>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-xl" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-lg" />
    </section>
  );
}
