'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Calendar, Clock, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';

interface Note {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  user_id?: string;
}

export default function ViewNotePage() {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const params = useParams(); 
  const router = useRouter(); 
  const noteId = params.id as string;

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) {
        alert('Note ID not found');
        router.push('/dashboard/notes');
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', noteId)
          .single();

        if (error) {
          console.error('Error fetching note:', error.message);
          alert('Note not found or error loading note.');
          router.push('/dashboard/notes');
        } else {
          setNote(data);
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        alert('Error loading note.');
        router.push('/dashboard/notes');
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      fetchNote();
    }
  }, [noteId, router]);

  const goBack = () => {
    router.push('/dashboard/notes');
  };

  const editNote = () => {
    router.push(`/dashboard/notes/edit/${noteId}`);
  };

  const summarizeNote = async () => {
    if (!note) return;
    setIsSummarizing(true);
    setSummary(null);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: note.content }),
      });

      const data = await response.json();
      if (response.ok) {
        setSummary(data.summary);
      } else {
        alert(data.error || 'Failed to generate summary.');
      }
    } catch (error) {
      console.error('Error summarizing:', error);
      alert('An unexpected error occurred while summarizing the note.');
    } finally {
      setIsSummarizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4">Note not found</h2>
          <button
            onClick={() => window.location.href = '/dashboard/notes'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-colors text-sm sm:text-base"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl mb-4 sm:mb-6 border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl sm:rounded-2xl transition-all duration-300 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="hidden sm:inline">Back to Notes</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={editNote}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl sm:rounded-2xl transition-all duration-300 flex-1 sm:flex-initial text-sm sm:text-base"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Edit Note</span>
                <span className="sm:hidden">Edit</span>
              </button>

              <button
                onClick={summarizeNote}
                disabled={isSummarizing || !note.content}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-white rounded-xl sm:rounded-2xl transition-all duration-300 flex-1 sm:flex-initial text-sm sm:text-base ${
                  isSummarizing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSummarizing ? (
                  <>
                    <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span className="hidden sm:inline">Summarizing...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Summarize</span>
                    <span className="sm:hidden">Sum</span>
                  </>
                )}
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  Note
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Note Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Title Section */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200/50">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight break-words">
              {note.title}
            </h1>
            
            {/* Note metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="break-words">
                  <span className="hidden sm:inline">Created: </span>
                  {new Date(note.created_at).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {note.updated_at !== note.created_at && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="break-words">
                    <span className="hidden sm:inline">Updated: </span>
                    {new Date(note.updated_at).toLocaleDateString('id-ID', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div 
              className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap break-words"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {note.content || 'This note is empty.'}
            </div>
          </div>

          {/* Summary Section */}
          {summary && (
            <div className="p-4 sm:p-6 lg:p-8 bg-blue-50/50 border-t border-gray-200/50">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                Summary
              </h2>
              <div
                className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap break-words"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {summary}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-200/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-500">
              <div>
                {note.content.length} characters · {note.content.split(/\s+/).filter(word => word.length > 0).length} words
              </div>
              <div className="text-[10px] sm:text-xs">
                Note ID: {note.id.slice(-8)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={goBack}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white/80 hover:bg-white text-gray-700 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            Back to All Notes
          </button>
          <button
            onClick={editNote}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
          >
            Edit This Note
          </button>
        </div>
      </div>
    </div>
  );
}