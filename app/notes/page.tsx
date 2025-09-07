'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Mic, 
  Play, 
  Pause, 
  Square, 
  FileText, 
  Save, 
  X, 
  Search,
  Heart,
  Trash2,
  Edit3,
  Volume2,
  Languages,
  Loader2,
  Plus,
  BookOpen,
  Calendar,
  LogIn
} from 'lucide-react';
import { SavedNote, saveNote, getUserNotes, deleteNote, toggleNoteFavorite } from '@/lib/firebase-notes-service';

type Language = 'english' | 'spanish' | 'french' | 'turkish';
type NoteType = 'text' | 'voice';
type ActiveTab = 'create' | 'gallery';

const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English', flag: '🇺🇸' },
  { value: 'spanish', label: 'Español', flag: '🇪🇸' },
  { value: 'french', label: 'Français', flag: '🇫🇷' },
  { value: 'turkish', label: 'Türkçe', flag: '🇹🇷' }
];

export default function NotesPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const authLoading = !clerkLoaded;

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');
  
  // Note creation states
  const [noteType, setNoteType] = useState<NoteType>('voice');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  // Transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState('');
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false);
  
  // Save states
  const [isSaving, setIsSaving] = useState(false);
  
  // Gallery states
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'voice' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Load user's saved notes
  const loadSavedNotes = async () => {
    if (!clerkUser) return;
    
    setLoadingGallery(true);
    try {
      console.log('Loading saved notes for Clerk user ID:', clerkUser.id);
      const notes = await getUserNotes(clerkUser.id, 50);
      setSavedNotes(notes);
      console.log('Loaded notes count:', notes?.length || 0);
    } catch (error) {
      console.error('Error loading saved notes:', error);
    } finally {
      setLoadingGallery(false);
    }
  };

  // Load notes when user changes or tab switches to gallery
  useEffect(() => {
    if (clerkUser && activeTab === 'gallery') {
      loadSavedNotes();
    }
  }, [clerkUser, activeTab]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  // Play/pause audio
  const toggleAudioPlayback = () => {
    if (!audioUrl) return;

    if (currentAudio) {
      if (isPlaying) {
        currentAudio.pause();
        setIsPlaying(false);
      } else {
        currentAudio.play();
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setCurrentAudio(audio);
      setIsPlaying(true);
    }
  };

  // Transcribe audio
  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', selectedLanguage);

      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transcription failed');
      }

      const result = await response.json();
      setTranscriptionResult(result.transcription);
      setShowTranscriptionModal(true);
    } catch (error: any) {
      console.error('Transcription error:', error);
      alert('Transcription failed: ' + error.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Save note
  const handleSaveNote = async () => {
    if (!clerkUser) return;
    if (!noteTitle.trim() && !noteContent.trim()) {
      alert('Please add a title or content to your note.');
      return;
    }

    setIsSaving(true);
    try {
      await saveNote(
        clerkUser.id,
        noteTitle || 'Untitled Note',
        noteContent,
        noteType,
        selectedLanguage,
        audioUrl || undefined,
        undefined // audioPath - we'll implement audio storage later if needed
      );

      // Reset form
      setNoteTitle('');
      setNoteContent('');
      setTranscriptionResult('');
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      
      // Switch to gallery and reload notes
      setActiveTab('gallery');
      await loadSavedNotes();
      
    } catch (error: any) {
      console.error('Save note error:', error);
      alert('Save Failed: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Accept transcription and save note directly
  const handleAcceptTranscription = async () => {
    if (!clerkUser) return;
    
    setIsSaving(true);
    try {
      await saveNote(
        clerkUser.id,
        noteTitle || 'Voice Note',
        transcriptionResult,
        'voice',
        selectedLanguage,
        audioUrl || undefined,
        undefined
      );

      // Reset form and close modal
      setNoteTitle('');
      setNoteContent('');
      setTranscriptionResult('');
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      setShowTranscriptionModal(false);
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
      setIsPlaying(false);
      
      // Switch to gallery and reload notes
      setActiveTab('gallery');
      await loadSavedNotes();
      
    } catch (error: any) {
      console.error('Save note error:', error);
      alert('Save Failed: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel transcription
  const handleCancelTranscription = () => {
    setTranscriptionResult('');
    setShowTranscriptionModal(false);
  };

  // Cancel note creation
  const handleCancelNote = () => {
    setNoteTitle('');
    setNoteContent('');
    setTranscriptionResult('');
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setShowTranscriptionModal(false);
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) return;
    
    setDeletingNoteId(noteId);
    try {
      console.log('Deleting note with ID:', noteId);
      await deleteNote(noteId);
      console.log('Note deleted successfully from Firebase, refreshing gallery...');
      await loadSavedNotes();
      console.log('Gallery refreshed after deletion');
    } catch (error: any) {
      console.error('Delete note error:', error);
      alert('Delete failed: ' + error.message);
    } finally {
      setDeletingNoteId(null);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (noteId: string, currentFavorite: boolean) => {
    try {
      await toggleNoteFavorite(noteId, !currentFavorite);
      await loadSavedNotes();
    } catch (error: any) {
      alert('Failed to update favorite: ' + error.message);
    }
  };

  // Filter and sort notes
  const filteredAndSortedNotes = savedNotes
    .filter(note => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!note.title.toLowerCase().includes(query) && 
            !note.content.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Type filter
      if (filterType === 'text' && note.type !== 'text') return false;
      if (filterType === 'voice' && note.type !== 'voice') return false;
      if (filterType === 'favorites' && !note.isFavorite) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      } else if (sortBy === 'oldest') {
        return a.createdAt.toMillis() - b.createdAt.toMillis();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!clerkUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Smart Notes
              </h1>
            </div>
            
            <div className="mb-6">
              <LogIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Sign In Required</h2>
              <p className="text-gray-600 mb-6">
                Please sign in to create and manage your notes with voice-to-text transcription and AI-powered features.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mic className="w-4 h-4 text-purple-600" />
                <span>Voice-to-text transcription</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Languages className="w-4 h-4 text-purple-600" />
                <span>Multi-language support</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Smart organization & search</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-6">
              Click "Sign In" in the top navigation to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Smart Notes
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Create notes with voice-to-text transcription or traditional text input. 
            Organize your thoughts with AI-powered features.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Plus className="w-5 h-5" />
              Create Note
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              My Notes
              {savedNotes.length > 0 && (
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                  {savedNotes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Note Type Selection */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Choose Note Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setNoteType('voice')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    noteType === 'voice'
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                >
                  <Mic className={`w-8 h-8 mx-auto mb-3 ${
                    noteType === 'voice' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <h4 className="font-semibold text-gray-800 mb-2">Voice Note</h4>
                  <p className="text-sm text-gray-600">Record audio and transcribe with AI</p>
                </button>
                
                <button
                  onClick={() => setNoteType('text')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    noteType === 'text'
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                >
                  <FileText className={`w-8 h-8 mx-auto mb-3 ${
                    noteType === 'text' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <h4 className="font-semibold text-gray-800 mb-2">Text Note</h4>
                  <p className="text-sm text-gray-600">Write your note manually with text input</p>
                </button>
              </div>
            </div>

            {/* Voice Recording Section */}
            {noteType === 'voice' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Recording
                </h3>
                
                {/* Language Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Languages className="w-4 h-4 inline mr-1" />
                    Transcription Language
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => setSelectedLanguage(lang.value as Language)}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          selectedLanguage === lang.value
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-purple-300 text-gray-700'
                        }`}
                      >
                        <span className="text-lg mr-2">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="text-center space-y-4">
                  {!audioBlob && (
                    <div>
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isTranscribing}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isRecording
                            ? 'bg-red-500 hover:bg-red-600 shadow-lg scale-110'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:scale-105'
                        }`}
                      >
                        {isRecording ? (
                          <Square className="w-8 h-8 text-white" />
                        ) : (
                          <Mic className="w-8 h-8 text-white" />
                        )}
                      </button>
                      <p className="text-sm text-gray-600 mt-2">
                        {isRecording ? 'Click to stop recording' : 'Click to start recording'}
                      </p>
                      {isRecording && (
                        <div className="text-red-600 font-mono text-lg">
                          {formatTime(recordingTime)}
                        </div>
                      )}
                    </div>
                  )}

                  {audioBlob && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={toggleAudioPlayback}
                          className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-all duration-200"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <span className="text-sm text-gray-600">
                          Recording ready • {formatTime(recordingTime)}
                        </span>
                        <button
                          onClick={() => {
                            setAudioBlob(null);
                            setAudioUrl(null);
                            setRecordingTime(0);
                            setTranscriptionResult('');
                          }}
                          className="w-8 h-8 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center text-white transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={transcribeAudio}
                        disabled={isTranscribing}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 mx-auto"
                      >
                        {isTranscribing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Transcribing...
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-5 h-5" />
                            Transcribe Audio
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Note Content - Show for text notes or when there's content from voice transcription */}
            {(noteType === 'text' || noteContent.trim()) && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Note Content
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Enter note title..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder={noteType === 'voice' ? 'Transcribed text will appear here...' : 'Write your note here...'}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Show for text notes immediately or when there's content */}
            {(noteType === 'text' || noteTitle.trim() || noteContent.trim()) && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleCancelNote}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Note
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Search and Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search notes..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  >
                    <option value="all">All Notes</option>
                    <option value="text">Text Notes</option>
                    <option value="voice">Voice Notes</option>
                    <option value="favorites">Favorites</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">By Title</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes Grid */}
            {loadingGallery ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center gap-3 text-gray-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-lg">Loading your notes...</span>
                </div>
              </div>
            ) : filteredAndSortedNotes.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchQuery || filterType !== 'all' ? 'No matching notes found' : 'No notes yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || filterType !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first note to get started!'
                  }
                </p>
                {!searchQuery && filterType === 'all' && (
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Note
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 group"
                  >
                    {/* Note Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {note.type === 'voice' ? (
                          <Mic className="w-5 h-5 text-purple-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-600" />
                        )}
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {note.type} Note
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleToggleFavorite(note.id, note.isFavorite)}
                          className={`p-1 rounded-full transition-colors duration-200 ${
                            note.isFavorite 
                              ? 'text-red-500 hover:text-red-600' 
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${note.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={deletingNoteId === note.id}
                          className="p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors duration-200 disabled:opacity-50"
                        >
                          {deletingNoteId === note.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Note Title */}
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {note.title}
                    </h3>

                    {/* Note Content Preview */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {note.content}
                    </p>

                    {/* Note Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {note.createdAt.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      
                      {note.language && (
                        <div className="flex items-center gap-1">
                          <Languages className="w-3 h-3" />
                          <span className="capitalize">{note.language}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {note.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{note.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transcription Modal */}
        {showTranscriptionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Volume2 className="w-6 h-6 text-purple-600" />
                  Transcription Result
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Review the transcribed text and make any necessary edits
                </p>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter note title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transcribed Content
                  </label>
                  <textarea
                    value={transcriptionResult}
                    onChange={(e) => setTranscriptionResult(e.target.value)}
                    placeholder="Transcribed text will appear here..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  onClick={handleCancelTranscription}
                  disabled={isSaving}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleAcceptTranscription}
                  disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Note...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Note
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
