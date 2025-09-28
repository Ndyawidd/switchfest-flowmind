// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { supabase } from '@/lib/supabase';
// import ReactQuill from 'react-quill'; // Rich-text editor
// import 'react-quill/dist/quill.snow.css'; // Gaya editor
// import { IoIosMic, IoIosSave } from 'react-icons/io';

// // Tipe data untuk properti komponen
// interface NewNotePageProps {
//   // Jika kamu mau menerima props, bisa definisikan di sini
// }

// const NewNotePage: React.FC<NewNotePageProps> = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const initialMode = searchParams.get('mode') || 'text';

//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [isSaving, setIsSaving] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // Cek sesi pengguna saat halaman dimuat
//   useEffect(() => {
//     const checkUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         router.push('/login');
//       } else {
//         setLoading(false);
//       }
//     };
//     checkUser();
//   }, [router]);

//   // Handler untuk menyimpan catatan
//   const handleSaveNote = async () => {
//     setIsSaving(true);
//     const { data: { user } } = await supabase.auth.getUser();

//     if (!user) {
//       alert('Anda harus login untuk menyimpan catatan.');
//       setIsSaving(false);
//       return;
//     }

//     const { data, error } = await supabase
//       .from('notes')
//       .insert({
//         title: title || 'Untitled',
//         content,
//         user_id: user.id,
//       })
//       .single();

//     if (error) {
//       console.error('Error saving note:', error);
//       alert('Gagal menyimpan catatan. Silakan coba lagi.');
//     } else {
//       alert('Catatan berhasil disimpan!');
//       router.push('/notes');
//     }
//     setIsSaving(false);
//   };

//   // Logika Speech-to-Text (akan kita implementasikan nanti)
//   // Untuk saat ini, kita akan buat logikanya di sini
//   const startListening = () => {
//     setIsListening(true);
//     alert('Fungsionalitas Voice-to-Text akan diimplementasikan di sini.');
//     // TODO: Implementasi integrasi Hugging Face Inference API
//     // Contoh: Kirim audio ke API, dapatkan teks, dan perbarui state `content`
//     // const transcript = await transcribeAudio();
//     // setContent(prevContent => prevContent + ' ' + transcript);
//   };

//   const stopListening = () => {
//     setIsListening(false);
//     alert('Perekaman dihentikan.');
//   };

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-100">
//         <p className="text-gray-600">Memuat editor...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
//         <div className="flex justify-between items-center mb-6">
//           <input
//             type="text"
//             placeholder="Judul Catatan..."
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full text-3xl font-bold text-gray-800 focus:outline-none placeholder-gray-400"
//           />
//           <button
//             onClick={handleSaveNote}
//             disabled={isSaving}
//             className={`flex items-center space-x-2 px-6 py-2 rounded-full font-semibold text-white transition-colors ${
//               isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
//             }`}
//           >
//             <IoIosSave size={20} />
//             <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
//           </button>
//         </div>

//         {/* Editor Rich-Text */}
//         <div className="bg-white p-2 border border-gray-300 rounded-md">
//           <ReactQuill
//             theme="snow"
//             value={content}
//             onChange={setContent}
//             placeholder="Mulai menulis di sini..."
//             className="h-80 mb-12"
//           />
//         </div>

//         {/* Tombol Mic dan Summarize */}
//         <div className="mt-8 flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={isListening ? stopListening : startListening}
//               className={`p-4 rounded-full transition-colors ${
//                 isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
//               }`}
//             >
//               <IoIosMic size={24} />
//             </button>
//             <span className="text-gray-600">{isListening ? 'Mendengarkan...' : 'Klik untuk merekam suara'}</span>
//           </div>
//           <button
//             onClick={() => alert('Fungsionalitas summarize akan diimplementasikan.')}
//             className="px-6 py-2 rounded-full bg-purple-600 font-semibold text-white hover:bg-purple-700 transition-colors"
//           >
//             Summarize
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NewNotePage;