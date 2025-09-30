'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Calendar, Clock, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

  // Get note ID from URL
  const noteId = typeof window !== 'undefined' ? 
    window.location.pathname.split('/').pop() || '' : '';

  useEffect(() => {
    if (noteId) {
      fetchNote();
    }
  }, [noteId]);

  const fetchNote = async () => {
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
        window.location.href = '/notes';
      } else {
        setNote(data);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      alert('Error loading note.');
      window.location.href = '/notes';
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    window.location.href = '/notes';
  };

  const editNote = () => {
    window.location.href = `/notes/edit/${noteId}`;
  };

  const summarizeNote = async () => {
  if (!note) return; // Pastikan catatan sudah dimuat
  setIsSummarizing(true);
  setSummary(null); // Kosongkan ringkasan sebelumnya
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Note not found</h2>
          <button
            onClick={() => window.location.href = '/notes'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-colors"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Notes
            </button>
            
            <div className="flex items-center gap-4">
  <button
    onClick={editNote}
    className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all duration-300"
  >
    <Edit className="w-5 h-5" />
    Edit Note
  </button>

  {/* Tombol Ringkasan Baru */}
  <button
    onClick={summarizeNote}
    disabled={isSummarizing || !note.content} // Nonaktifkan jika sedang loading atau konten kosong
    className={`flex items-center gap-2 px-4 py-2 text-white rounded-2xl transition-all duration-300 ${
      isSummarizing
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-green-600 hover:bg-green-700'
    }`}
  >
    {isSummarizing ? (
      <>
        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
        Summarizing...
      </>
    ) : (
      <>
        <FileText className="w-5 h-5" />
        Summarize Note
      </>
    )}
  </button>

  <div className="flex items-center gap-2">
    <FileText className="w-6 h-6 text-blue-600" />
    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
      Note
    </span>
  </div>
</div>

            
          </div>
        </div>

        {/* Note Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Title Section */}
          <div className="p-8 border-b border-gray-200/50">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
              {note.title}
            </h1>
            
            {/* Note metadata */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Created: {new Date(note.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {note.updated_at !== note.created_at && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Updated: {new Date(note.updated_at).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
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
          <div className="p-8">
            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {note.content || 'This note is empty.'}
            </div>
          </div>

          {summary && (
  <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Summary</h2>
      <div
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {summary}
      </div>
    </div>
  </div>
)}

          {/* Footer */}
          <div className="p-6 bg-gray-50/50 border-t border-gray-200/50">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                {note.content.length} characters · {note.content.split(/\s+/).filter(word => word.length > 0).length} words
              </div>
              <div>
                Note ID: {note.id.slice(-8)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={goBack}
            className="px-6 py-3 bg-white/80 hover:bg-white text-gray-700 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Back to All Notes
          </button>
          <button
            onClick={editNote}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Edit This Note
          </button>
        </div>
      </div>
    </div>
  );
}