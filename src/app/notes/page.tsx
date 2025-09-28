// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Plus, FileText, Calendar, Search } from 'lucide-react';

// interface Note {
//   id: string;
//   title: string;
//   content: string;
//   created_at: string;
//   updated_at: string;
//   user_id: string;
// }

// export default function NotesPage() {
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const router = useRouter();
//   const supabase = createClientComponentClient();

//   useEffect(() => {
//     fetchNotes();
//   }, []);

//   const fetchNotes = async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         router.push('/auth/login');
//         return;
//       }

//       const { data, error } = await supabase
//         .from('notes')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('updated_at', { ascending: false });

//       if (error) throw error;
//       setNotes(data || []);
//     } catch (error) {
//       console.error('Error fetching notes:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAddNote = (method: 'text' | 'voice') => {
//   setShowModal(false);
//   router.push(`/notes/new?method=${method}`);
// };

// const handleNoteClick = (noteId: string) => {
//   router.push(`/notes/edit/${noteId}`);
// };

//   const filteredNotes = notes.filter(note =>
//     note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     note.content.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('id-ID', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const truncateContent = (content: string, maxLength: number = 150) => {
//     if (content.length <= maxLength) return content;
//     return content.substring(0, maxLength) + '...';
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading notes...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
//               <p className="text-gray-600">Manage your notes and ideas</p>
//             </div>
//             <button
//               onClick={() => setShowModal(true)}
//               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//             >
//               <Plus size={20} />
//               Add Note
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//           <input
//             type="text"
//             placeholder="Search notes..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           />
//         </div>
//       </div>

//       {/* Notes Grid */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
//         {filteredNotes.length === 0 ? (
//           <div className="text-center py-12">
//             <FileText size={48} className="mx-auto text-gray-400 mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               {searchTerm ? 'No notes found' : 'No notes yet'}
//             </h3>
//             <p className="text-gray-600 mb-6">
//               {searchTerm 
//                 ? 'Try adjusting your search terms'
//                 : 'Start by creating your first note'
//               }
//             </p>
//             {!searchTerm && (
//               <button
//                 onClick={() => setShowModal(true)}
//                 className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Create Note
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredNotes.map((note) => (
//               <div
//                 key={note.id}
//                 onClick={() => handleNoteClick(note.id)}
//                 className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
//               >
//                 <div className="flex items-start justify-between mb-3">
//                   <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
//                     {note.title || 'Untitled Note'}
//                   </h3>
//                   <FileText size={20} className="text-gray-400 flex-shrink-0 ml-2" />
//                 </div>
                
//                 <p className="text-gray-600 text-sm mb-4 line-clamp-3">
//                   {truncateContent(note.content)}
//                 </p>
                
//                 <div className="flex items-center text-xs text-gray-500">
//                   <Calendar size={14} className="mr-1" />
//                   {formatDate(note.updated_at)}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Modal for Add Note Method Selection */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4">
//               Create New Note
//             </h2>
//             <p className="text-gray-600 mb-6">
//               Choose how you'd like to create your note:
//             </p>
            
//             <div className="space-y-3">
//               <button
//                 onClick={() => handleAddNote('text')}
//                 className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
//               >
//                 <div className="flex items-center">
//                   <div className="bg-blue-100 p-2 rounded-lg mr-3">
//                     <FileText size={20} className="text-blue-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-gray-900">Text Note</h3>
//                     <p className="text-sm text-gray-600">Type your note manually</p>
//                   </div>
//                 </div>
//               </button>
              
//               <button
//                 onClick={() => handleAddNote('voice')}
//                 className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
//               >
//                 <div className="flex items-center">
//                   <div className="bg-green-100 p-2 rounded-lg mr-3">
//                     <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-gray-900">Voice Note</h3>
//                     <p className="text-sm text-gray-600">Record and transcribe speech</p>
//                   </div>
//                 </div>
//               </button>
//             </div>
            
//             <div className="flex justify-end mt-6">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Plus, FileText, Calendar, Search } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  user_id: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = (method: 'text' | 'voice') => {
    setShowModal(false)
    router.push(`/notes/new?method=${method}`)
  }

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/edit/${noteId}`)
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
              <p className="text-gray-600">Manage your notes and ideas</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Start by creating your first note'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <FileText
                    size={20}
                    className="text-gray-400 flex-shrink-0 ml-2"
                  />
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {truncateContent(note.content)}
                </p>

                <div className="flex items-center text-xs text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(note.updated_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Add Note Method Selection */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Note
            </h2>
            <p className="text-gray-600 mb-6">
              Choose how you'd like to create your note:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleAddNote('text')}
                className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Text Note</h3>
                    <p className="text-sm text-gray-600">
                      Type your note manually
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleAddNote('voice')}
                className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Voice Note</h3>
                    <p className="text-sm text-gray-600">
                      Record and transcribe speech
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
