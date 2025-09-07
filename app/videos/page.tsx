'use client';

import { useState, useEffect } from 'react';
import { Search, Play, Calendar, User, TrendingUp, Loader2 } from 'lucide-react';
import { searchYouTubeVideos, getTrendingVideos, YouTubeVideo } from '@/lib/youtube';

export default function VideosPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'trending' | 'search'>('trending');

  useEffect(() => {
    loadTrendingVideos();
  }, []);

  const loadTrendingVideos = async () => {
    setLoading(true);
    try {
      const response = await getTrendingVideos(12);
      setVideos(response.items);
      setActiveTab('trending');
    } catch (error) {
      console.error('Error loading trending videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await searchYouTubeVideos(searchQuery, 12);
      setVideos(response.items);
      setActiveTab('search');
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const openVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text mb-4 bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
            Video & Browsing
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Discover and explore amazing videos from YouTube with our modern interface
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for videos..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-fast text-lg shadow-subtle bg-card/80 backdrop-blur-sm text-text placeholder:text-text-muted"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-6 py-2 rounded-xl hover:opacity-90 transition-all duration-fast font-medium disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-1 shadow-subtle border border-border">
            <button
              onClick={loadTrendingVideos}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-fast flex items-center gap-2 ${
                activeTab === 'trending'
                  ? 'bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-card'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-3 text-text-muted">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg">Loading amazing videos...</span>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div
                key={video.id.videoId}
                className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-subtle border border-border overflow-hidden hover:shadow-card hover:scale-[1.02] transition-all duration-normal cursor-pointer group"
                onClick={() => openVideo(video.id.videoId)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-normal"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-normal flex items-center justify-center">
                    <div className="bg-card/90 rounded-full p-3">
                      <Play className="w-6 h-6 text-text fill-current" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-text mb-2 line-clamp-2 group-hover:text-accent transition-colors duration-fast">
                    {truncateText(video.snippet.title, 60)}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
                    <User className="w-4 h-4" />
                    <span className="truncate">{video.snippet.channelTitle}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(video.snippet.publishedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto shadow-subtle border border-border">
              <Search className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">No videos found</h3>
              <p className="text-text-muted">Try searching for something else or check back later.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

