'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Save, 
  Heart, 
  Tag, 
  Calendar, 
  Settings, 
  Sparkles,
  Loader2,
  Copy,
  Check,
  Brain,
  Globe
} from 'lucide-react';
import { SavedImage } from '@/lib/firebase-image-service';
import { ImageSize, ImageStyle, ImageQuality } from '@/lib/ai-image-generator';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt: string;
  size: ImageSize;
  style: ImageStyle;
  quality: ImageQuality;
  isGenerated?: boolean;
  savedImage?: SavedImage;
  onSave?: () => void;
  onDownload?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
}

export default function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  prompt,
  size,
  style,
  quality,
  isGenerated = false,
  savedImage,
  onSave,
  onDownload,
  onToggleFavorite,
  onDelete,
  isSaving = false
}: ImageModalProps) {
  const [copied, setCopied] = useState(false);
  const [funFact, setFunFact] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>('');

  const languages = [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'spanish', name: 'Español', flag: '🇪🇸' },
    { code: 'turkish', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'russian', name: 'Русский', flag: '🇷🇺' }
  ];

  // Analyze image when modal opens or language changes
  useEffect(() => {
    if (isOpen) {
      analyzeImage();
    }
  }, [isOpen, selectedLanguage]);

  const analyzeImage = async () => {
    if (!imageUrl) return;
    
    setIsAnalyzing(true);
    setAnalysisError('');
    setFunFact('');

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: savedImage?.storageUrl || imageUrl,
          language: selectedLanguage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      setFunFact(data.funFact);
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      setAnalysisError(error.message || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  if (!isOpen) return null;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateTitle = (prompt: string) => {
    const words = prompt.split(' ').slice(0, 4);
    return words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const generateTags = (prompt: string) => {
    const words = prompt.toLowerCase().split(/\s+/);
    const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return words
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 6)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isGenerated ? generateTitle(prompt) : savedImage?.prompt ? generateTitle(savedImage.prompt) : 'Generated Image'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isGenerated ? 'Generated just now' : savedImage ? formatDate(savedImage.createdAt.toDate()) : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Image Section */}
          <div className="flex-1 bg-gray-50 flex items-center justify-center p-6">
            <div className="relative max-w-full max-h-full">
              <img
                src={savedImage?.storageUrl || imageUrl}
                alt={prompt}
                className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-lg"
              />
              {savedImage?.isFavorite && (
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-[480px] p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Prompt */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Prompt
                  </h3>
                  <button
                    onClick={copyPrompt}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-1"
                    title="Copy prompt"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl leading-relaxed">
                  {savedImage?.prompt || prompt}
                </p>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-600" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(savedImage?.tags || generateTags(prompt)).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Category</h3>
                <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-xl font-medium">
                  {savedImage?.category || 'Generated'}
                </span>
              </div>

              {/* Technical Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Size</span>
                    <span className="font-medium text-gray-900">{savedImage?.size || size}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Style</span>
                    <span className="font-medium text-gray-900 capitalize">{savedImage?.style || style}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Quality</span>
                    <span className="font-medium text-gray-900 uppercase">{savedImage?.quality || quality}</span>
                  </div>
                </div>
              </div>

              {/* Creation Date for Saved Images */}
              {savedImage && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Created
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {formatDate(savedImage.createdAt.toDate())}
                  </p>
                </div>
              )}

              {/* AI Analysis Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Analysis
                  </h3>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <div className="flex gap-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`px-2 py-1 text-xs rounded-md transition-colors duration-200 flex items-center gap-1 ${
                            selectedLanguage === lang.code
                              ? 'bg-purple-100 text-purple-700 font-medium'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={lang.name}
                        >
                          <span className="text-xs">{lang.flag}</span>
                          <span className="hidden sm:inline">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-600 mr-2" />
                      <span className="text-purple-700">Analyzing image...</span>
                    </div>
                  ) : analysisError ? (
                    <div className="text-red-600 text-sm">
                      <p className="font-medium">Analysis unavailable</p>
                      <p className="text-xs mt-1">{analysisError}</p>
                    </div>
                  ) : funFact ? (
                    <div>
                      <p className="text-gray-800 leading-relaxed">{funFact}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-200">
                        <span className="text-xs text-purple-600 font-medium">
                          ✨ Generated by AI Vision
                        </span>
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          {languages.find(l => l.code === selectedLanguage)?.flag}
                          <span>{languages.find(l => l.code === selectedLanguage)?.name}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-2">
                      <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Click a language to analyze this image</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                {isGenerated ? (
                  /* Generated Image Actions */
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                    >
                      Close
                    </button>
                    <button
                      onClick={onSave}
                      disabled={isSaving}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {isSaving ? 'Saving...' : 'Save to Library'}
                    </button>
                  </div>
                ) : (
                  /* Saved Image Actions */
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={onDownload}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download
                      </button>
                      <button
                        onClick={onToggleFavorite}
                        className={`flex-1 py-3 px-4 rounded-xl transition-colors duration-200 font-medium flex items-center justify-center gap-2 ${
                          savedImage?.isFavorite
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${savedImage?.isFavorite ? 'fill-current' : ''}`} />
                        {savedImage?.isFavorite ? 'Unfavorite' : 'Favorite'}
                      </button>
                    </div>
                    {onDelete && (
                      <button
                        onClick={onDelete}
                        className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-xl hover:bg-red-200 transition-colors duration-200 font-medium"
                      >
                        Delete Image
                      </button>
                    )}
                  </div>
                )}

                {/* Download for Generated Images */}
                {isGenerated && onDownload && (
                  <button
                    onClick={onDownload}
                    className="w-full bg-blue-100 text-blue-700 py-3 px-4 rounded-xl hover:bg-blue-200 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Image
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
