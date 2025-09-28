'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Note } from '@/lib/types'; 
import Link from 'next/link';
import Modal from '@/components/modal'; 
import { IoIosMic, IoMdText } from 'react-icons/io';

const NotesPage = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
      } else {
        setNotes(data || []);
      }
      setLoading(false);
    };
    fetchNotes();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Memuat catatan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Catatan Saya</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 rounded-full bg-blue-600 px-6 py-2 font-semibold text-white transition duration-300 hover:bg-blue-700"
        >
          <span>Add Note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.length === 0 ? (
          <p className="text-gray-500 italic">Belum ada catatan. Tambahkan yang pertama!</p>
        ) : (
          notes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`} className="block">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-800 truncate">{note.title || "Untitled"}</h2>
                <p className="text-sm text-gray-500 mt-2 line-clamp-3">{note.content}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-6">Pilih Metode Input</h3>
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => router.push('/notes/new?mode=text')}
                className="flex flex-col items-center p-8 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <IoMdText size={48} className="text-blue-600" />
                <span className="mt-2 text-lg font-semibold">Teks Manual</span>
              </button>
              <button
                onClick={() => router.push('/notes/new?mode=voice')}
                className="flex flex-col items-center p-8 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <IoIosMic size={48} className="text-green-600" />
                <span className="mt-2 text-lg font-semibold">Suara</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NotesPage;