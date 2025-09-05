'use client';

import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { 
  Search, 
  Wand2, 
  Download, 
  Heart, 
  Loader2, 
  Settings, 
  Sparkles,
  Image as ImageIcon,
  Grid3X3,
  Palette,
  Zap,
  Star,
  Trash2,
  RefreshCw,
  Filter,
  SortDesc,
  Eye
} from 'lucide-react';
import ImageModal from '@/components/ImageModal';
import LoadingModal from '@/components/LoadingModal';
import {
  generateImages,
  promptSuggestions,
  imageSizeOptions,
  styleOptions,
  qualityOptions,
  ImageSize,
  ImageStyle,
  ImageQuality,
  ImageGenerationRequest
} from '@/lib/ai-image-generator';
import {
  saveGeneratedImage,
  getUserImages,
  toggleImageFavorite,
  deleteSavedImage,
  SavedImage
} from '@/lib/firebase-image-service';

export default function AIGeneratorPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const authLoading = !clerkLoaded;
  
  // Generation states
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1024x1024');
  const [style, setStyle] = useState<ImageStyle>('vivid');
  const [quality, setQuality] = useState<ImageQuality>('hd');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  
  // UI states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery'>('generate');
  
  // Gallery states
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [savingImage, setSavingImage] = useState<string | null>(null);
  
  // Modal states
  const [modalImage, setModalImage] = useState<{
    url: string;
    prompt: string;
    size: ImageSize;
    style: ImageStyle;
    quality: ImageQuality;
    isGenerated?: boolean;
    savedImage?: SavedImage;
  } | null>(null);
  
  // Gallery filters
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'favorites'>('all');
  const [gallerySortBy, setGallerySortBy] = useState<'newest' | 'oldest'>('newest');

  // Load user's saved images
  const loadSavedImages = async () => {
    if (!clerkUser) return;
    
    setLoadingGallery(true);
    try {
      console.log('Loading saved images for Clerk user ID:', clerkUser.id);
      const images = await getUserImages(clerkUser.id, 50); // Use Clerk user ID
      setSavedImages(images || []); // Ensure we always have an array
      console.log('Loaded images count:', images?.length || 0);
    } catch (error) {
      console.error('Error loading saved images:', error);
      setSavedImages([]); // Set empty array on error
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    if (clerkUser && activeTab === 'gallery') {
      console.log('Effect triggered - loading images for user:', clerkUser.id);
      loadSavedImages();
    }
  }, [clerkUser, activeTab]);

  // Debug effect to log when clerkUser changes
  useEffect(() => {
    console.log('Clerk user changed:', clerkUser ? { id: clerkUser.id, email: clerkUser.emailAddresses?.[0]?.emailAddress } : 'null');
  }, [clerkUser]);

  // Generate images
  const handleGenerate = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;
    if (!promptToUse.trim()) return;

    setIsGenerating(true);
    setGeneratedImages([]);
    setCurrentPrompt(promptToUse);

    try {
      const request: ImageGenerationRequest = {
        prompt: promptToUse,
        size,
        style,
        quality,
        n: 1
      };

      const response = await generateImages(request);
      const imageUrl = response.images[0]?.url;
      if (imageUrl) {
        setGeneratedImages([imageUrl]);
        
        // Close loading modal and open image modal immediately
        setIsGenerating(false);
        setModalImage({
          url: imageUrl,
          prompt: promptToUse,
          size,
          style,
          quality,
          isGenerated: true
        });
      }
    } catch (error: any) {
      alert('Failed to generate image: ' + error.message);
      setIsGenerating(false);
    }
  };

  // Save image to Firebase (from modal)
  const handleSaveImageFromModal = async () => {
    if (!clerkUser || !modalImage) return;

    setSavingImage(modalImage.url);
    try {
      console.log('Starting save process from modal for Clerk user:', clerkUser.id);
      
      const documentId = await saveGeneratedImage(
        clerkUser.id, // Use Clerk user ID
        modalImage.url,
        modalImage.prompt,
        undefined,
        modalImage.size,
        modalImage.style,
        modalImage.quality,
        'generated'
      );
      
      console.log('Image saved successfully with ID:', documentId);
      
      // Close modal and refresh gallery
      setModalImage(null);
      await loadSavedImages();
      setActiveTab('gallery'); // Switch to gallery to show saved image
      
      // Show success message (optional)
      // You could add a toast notification here instead of alert
      
    } catch (error: any) {
      console.error('Save image error:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'An unexpected error occurred while saving the image.';
      alert('Save Failed: ' + errorMessage);
    } finally {
      setSavingImage(null);
    }
  };

  // Download image
  const handleDownload = async (imageUrl: string, filename?: string) => {
    try {
      let blob: Blob;
      
      // Check if it's a Firebase Storage URL (these work directly) or OpenAI URL (needs API route)
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        // Firebase Storage URLs work directly
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Failed to fetch image');
        blob = await response.blob();
      } else {
        // OpenAI URLs need to go through our API route
        const response = await fetch('/api/convert-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl }),
        });
        
        if (!response.ok) throw new Error('Failed to convert image for download');
        blob = await response.blob();
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `ai-generated-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (image: SavedImage) => {
    try {
      await toggleImageFavorite(image.id, !image.isFavorite);
      await loadSavedImages();
    } catch (error: any) {
      alert('Failed to update favorite: ' + error.message);
    }
  };

  // Delete saved image
  const handleDeleteImage = async (image: SavedImage) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteSavedImage(image);
      await loadSavedImages();
    } catch (error: any) {
      alert('Failed to delete image: ' + error.message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Image Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create stunning images with AI. Describe what you want and watch it come to life.
          </p>
        </div>

        <SignedOut>
          <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <Wand2 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In to Generate Images</h2>
            <p className="text-gray-600 mb-6">
              Create an account to start generating amazing AI images and save them to your gallery.
            </p>
            <SignInButton>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold">
                Get Started
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          {/* Navigation Pills */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-gray-200">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'generate'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Wand2 className="w-5 h-5" />
                Create
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'gallery'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                Gallery
                {savedImages.length > 0 && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                    {savedImages.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {activeTab === 'generate' && (
            <div className="space-y-8">
              {/* Search Bar */}
              <div className="max-w-5xl mx-auto">
                <div className="relative">
                  <div className="relative group">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-purple-400 w-6 h-6 group-focus-within:text-purple-600 transition-colors duration-200" />
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
                      placeholder="Describe the image you want to create... (e.g., 'A magical forest with glowing mushrooms')"
                      className="w-full pl-16 pr-24 py-7 rounded-3xl border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-lg font-medium shadow-lg bg-white text-gray-900 placeholder-gray-500"
                      disabled={isGenerating}
                    />
                    <button
                      onClick={() => handleGenerate()}
                      disabled={isGenerating || !prompt.trim()}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      {isGenerating ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    Advanced Options
                    <span className={`transform transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}>
                      ↓
                    </span>
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Size Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Grid3X3 className="w-4 h-4" />
                            Image Size
                          </label>
                          <select
                            value={size}
                            onChange={(e) => setSize(e.target.value as ImageSize)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {imageSizeOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Style Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Style
                          </label>
                          <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value as ImageStyle)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {styleOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quality Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Quality
                          </label>
                          <select
                            value={quality}
                            onChange={(e) => setQuality(e.target.value as ImageQuality)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {qualityOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt Suggestions */}
              <div className="max-w-6xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  ✨ Quick Ideas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {promptSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleGenerate(suggestion.prompt)}
                      disabled={isGenerating}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-2xl mb-2">{suggestion.icon}</div>
                      <h4 className="font-medium text-gray-900 mb-1 group-hover:text-purple-600 transition-colors duration-200">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {suggestion.prompt}
                      </p>
                      <div className="mt-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {suggestion.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>


            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="max-w-7xl mx-auto">
              {/* Gallery Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Creative Gallery</h2>
                  <p className="text-gray-600">
                    {savedImages.length === 0 
                      ? 'No creations yet - start generating!' 
                      : `${savedImages.length} masterpiece${savedImages.length === 1 ? '' : 's'} created`
                    }
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Filter Buttons */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200">
                    <button
                      onClick={() => setGalleryFilter('all')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        galleryFilter === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setGalleryFilter('favorites')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 ${
                        galleryFilter === 'favorites'
                          ? 'bg-red-500 text-white'
                          : 'text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      Favorites
                    </button>
                  </div>
                  
                  {/* Sort and Refresh */}
                  <button
                    onClick={() => setGallerySortBy(gallerySortBy === 'newest' ? 'oldest' : 'newest')}
                    className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-white transition-colors duration-200 flex items-center gap-2"
                    title={`Sort by ${gallerySortBy === 'newest' ? 'oldest' : 'newest'} first`}
                  >
                    <SortDesc className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={loadSavedImages}
                    disabled={loadingGallery}
                    className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-white transition-colors duration-200 flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingGallery ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {loadingGallery ? (
                <div className="text-center py-16">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-lg border border-gray-200">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Gallery</h3>
                    <p className="text-gray-600">Fetching your amazing creations...</p>
                  </div>
                </div>
              ) : savedImages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 max-w-lg mx-auto shadow-lg border border-gray-200">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Gallery Awaits</h3>
                    <p className="text-gray-600 mb-6">Create your first AI masterpiece and watch your gallery come to life!</p>
                    <button
                      onClick={() => setActiveTab('generate')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Start Creating
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {savedImages
                    .filter(image => galleryFilter === 'all' || (galleryFilter === 'favorites' && image.isFavorite))
                    .sort((a, b) => {
                      const dateA = a.createdAt.toDate().getTime();
                      const dateB = b.createdAt.toDate().getTime();
                      return gallerySortBy === 'newest' ? dateB - dateA : dateA - dateB;
                    })
                    .map((image) => (
                    <div 
                      key={image.id} 
                      className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
                      onClick={() => setModalImage({
                        url: image.storageUrl,
                        prompt: image.prompt,
                        size: image.size,
                        style: image.style,
                        quality: image.quality,
                        savedImage: image
                      })}
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={image.storageUrl}
                          alt={image.prompt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Eye className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-semibold">View Details</p>
                          </div>
                        </div>

                        {/* Favorite Badge */}
                        {image.isFavorite && (
                          <div className="absolute top-3 right-3 z-10">
                            <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                              <Heart className="w-4 h-4 fill-current" />
                            </div>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(image.storageUrl, image.filename);
                              }}
                              className="bg-white/90 text-gray-900 p-2 rounded-full hover:bg-white transition-colors duration-200 shadow-lg"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(image);
                              }}
                              className={`p-2 rounded-full transition-colors duration-200 shadow-lg ${
                                image.isFavorite 
                                  ? 'bg-red-500 text-white hover:bg-red-600' 
                                  : 'bg-white/90 text-gray-900 hover:bg-white'
                              }`}
                              title={image.isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Heart className={`w-4 h-4 ${image.isFavorite ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Image Info */}
                      <div className="p-4">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                          {image.prompt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">{image.size}</span>
                          <span>{new Date(image.createdAt.toDate()).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </SignedIn>
        
        {/* Image Modal */}
        {modalImage && (
          <ImageModal
            isOpen={!!modalImage}
            onClose={() => setModalImage(null)}
            imageUrl={modalImage.url}
            prompt={modalImage.prompt}
            size={modalImage.size}
            style={modalImage.style}
            quality={modalImage.quality}
            isGenerated={modalImage.isGenerated}
            savedImage={modalImage.savedImage}
            onSave={modalImage.isGenerated ? handleSaveImageFromModal : undefined}
            onDownload={() => handleDownload(modalImage.savedImage?.storageUrl || modalImage.url, modalImage.savedImage?.filename)}
            onToggleFavorite={modalImage.savedImage ? () => handleToggleFavorite(modalImage.savedImage!) : undefined}
            onDelete={modalImage.savedImage ? () => {
              handleDeleteImage(modalImage.savedImage!);
              setModalImage(null);
            } : undefined}
            isSaving={savingImage === modalImage.url}
          />
        )}

        {/* Loading Modal for Image Generation */}
        <LoadingModal
          isOpen={isGenerating}
          onClose={() => setIsGenerating(false)}
          title="Creating Your Masterpiece"
          message="AI is painting your vision..."
          progress={75} // You can add real progress tracking later
        />
      </div>
    </div>
  );
}
