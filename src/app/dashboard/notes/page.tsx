'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Mic, Calendar, Search, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Note {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  user_id?: string;
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth and fetch notes
  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  async function checkAuthAndFetch() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchNotes(user.id);
  }

  async function fetchNotes(userId: string) {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error.message);
      } else {
        setNotes(data || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNote = () => {
    setShowAddModal(false);
    window.location.href = `/dashboard/notes/new`;
  };

  const handleEditNote = (id: string) => {
    window.location.href = `/dashboard/notes/edit/${id}`;
  };

  const handleViewNote = (id: string) => {
    window.location.href = `/dashboard/notes/view/${id}`;
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting note:', error.message);
          alert('Failed to delete note. Please try again.');
        } else {
          setNotes(notes.filter(note => note.id !== id));
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center my-8">
            <h1 className="text-5xl md:text-6xl font-extrabold font-montserrat-alt text-center mb-5">
              <span className="text-blue-600">My</span>{' '}
              <span className="text-gray-900">Notes</span>
            </h1>
          
        </div>

        {/* Top Bar with Search and Add Button */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl mb-8 border border-white/20">
          <div className="text-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
              />
            </div>

            {/* Add Note Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Note
            </button>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No notes yet</h3>
              <p className="text-gray-500 mb-6">Start capturing your thoughts and ideas!</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl items-center gap-2"
              >
                Create Your First Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
                >
                  {/* Note Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        Text Note
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleViewNote(note.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        title="View Note"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleEditNote(note.id)}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                        title="Edit Note"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        title="Delete Note"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Note Content */}
                  <div className="cursor-pointer" onClick={() => handleViewNote(note.id)}>
                    <h3 className="font-bold text-gray-800 mb-2 text-lg leading-snug hover:text-blue-600 transition-colors">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {truncateText(note.content)}
                    </p>
                  </div>

                  {/* Note Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(note.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {note.content.length} characters
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Ready to create a new note?
            </h2>

            <div className="space-y-4">
              {/* Create Note Button */}
              <button
                onClick={handleAddNote}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Create New Note</h3>
                    <p className="text-blue-100 text-sm">Write with keyboard or use voice input</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(false)}
              className="w-full mt-6 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}