'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Pastikan path ini benar
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';

const Homepage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mendapatkan sesi pengguna
  const fetchUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      router.push('/login');
    } else {
      setUser(user);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Handler untuk logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Redirect ke landing page
  };

  // Tampilkan loading screen saat memverifikasi sesi
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Jika tidak ada user (sudah di-redirect oleh useEffect), tampilkan pesan error atau tidak ada apa-apa
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Navbar di Homepage */}
      <nav className="flex w-full items-center justify-between rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center space-x-4">
          <span className="text-2xl font-bold text-blue-600">FlowBite</span>
          <span className="text-sm text-gray-500">
            Selamat datang, {user.email?.split('@')[0]}!
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/notes/add"
            className="flex items-center space-x-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-blue-700"
          >
            <span className="text-lg">+</span>
            <span>Add Notes</span>
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition duration-300 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Dashboard */}
      <main className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Section: To Do List (Today) */}
        <div className="col-span-1 rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">To Do List (Today)</h2>
            <Link href="/todos" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Berikut adalah daftar tugas Anda untuk hari ini.
          </p>
          {/* TODO: Tampilkan list To Do */}
          <ul className="mt-4 space-y-2">
            <li className="flex items-center space-x-2 text-gray-700">
              <span className="text-sm">•</span> Mempersiapkan presentasi
            </li>
            <li className="flex items-center space-x-2 text-gray-700">
              <span className="text-sm">•</span> Meeting dengan tim
            </li>
          </ul>
        </div>

        {/* Section: Recently Notes */}
        <div className="col-span-1 rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Recently Notes</h2>
            <Link href="/notes" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Catatan terbaru yang Anda tambahkan.
          </p>
          {/* TODO: Tampilkan list Notes terbaru */}
          <ul className="mt-4 space-y-2">
            <li className="text-gray-700">
              <span className="font-semibold">Ide Aplikasi</span>: Konsep baru untuk fitur summarizer.
            </li>
            <li className="text-gray-700">
              <span className="font-semibold">Brainstorming</span>: Ide untuk marketing produk.
            </li>
          </ul>
        </div>

        {/* Section: Mood Tracker */}
        <div className="col-span-1 rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Mood Tracker</h2>
            <Link href="/mood" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Lihat mood Anda hari ini dan riwayatnya.
          </p>
          {/* TODO: Tampilkan Mood hari ini */}
          <div className="mt-4 flex flex-col items-center justify-center">
            <div className="text-6xl">😊</div>
            <p className="mt-2 text-gray-700">Mood Anda hari ini: Senang</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Homepage;