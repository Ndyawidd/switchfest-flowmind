'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const LandingPage = () => {
  const router = useRouter();

  const handleAuthRedirect = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="flex w-full items-center justify-between bg-white p-6 shadow-md">
        <div className="flex items-center">
          {/* Logo */}
          <span className="text-2xl font-bold text-blue-600">FlowMind</span>
        </div>
        <div className="space-x-4">
          <button
            onClick={() => handleAuthRedirect('auth/login')}
            className="rounded-full border border-blue-600 px-6 py-2 font-semibold text-blue-600 transition duration-300 ease-in-out hover:bg-blue-50"
          >
            Login
          </button>
          <button
            onClick={() => handleAuthRedirect('auth/register')}
            className="rounded-full bg-blue-600 px-6 py-2 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-700"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Main Content (Hero & Features) */}
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        {/* Hero Section */}
        <div className="flex w-full max-w-4xl flex-col items-center justify-between rounded-lg bg-white p-12 shadow-lg md:flex-row">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">
              Catat Pikiran, Rencanakan Hari.
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Aplikasi serbaguna untuk catatan, daftar tugas, dan pelacak
              suasana hati.
            </p>
            <button
              onClick={() => handleAuthRedirect('auth/login')}
              className="mt-8 rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Mulai Sekarang
            </button>
          </div>
          <div className="mt-8 md:mt-0 md:ml-12">
            <Image
              src="/images/placeholder-hero.png" // Tambahkan gambar ini di folder public/images
              alt="App Interface"
              width={500}
              height={400}
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 w-full max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-800">
            Fitur-Fitur Kami
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* To-Do List Feature */}
            <div className="transform cursor-pointer rounded-lg bg-white p-6 text-center shadow-md transition duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg">
              <div className="mb-4 text-4xl text-blue-500">📝</div>
              <h3 className="text-xl font-semibold text-gray-800">
                Daftar Tugas
              </h3>
              <p className="mt-2 text-gray-600">
                Kelola tugas harian dan rencanakan hari Anda dengan mudah.
              </p>
              <button
                onClick={() => handleAuthRedirect('auth/login')}
                className="mt-4 text-blue-600 hover:underline focus:outline-none"
              >
                Lihat Detail →
              </button>
            </div>

            {/* Notes Feature */}
            <div className="transform cursor-pointer rounded-lg bg-white p-6 text-center shadow-md transition duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg">
              <div className="mb-4 text-4xl text-green-500">✍️</div>
              <h3 className="text-xl font-semibold text-gray-800">Catatan</h3>
              <p className="mt-2 text-gray-600">
                Catat ide, pikiran, atau buat draf dengan fitur teks dan suara.
              </p>
              <button
                onClick={() => handleAuthRedirect('auth/login')}
                className="mt-4 text-blue-600 hover:underline focus:outline-none"
              >
                Lihat Detail →
              </button>
            </div>

            {/* Mood Tracker Feature */}
            <div className="transform cursor-pointer rounded-lg bg-white p-6 text-center shadow-md transition duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg">
              <div className="mb-4 text-4xl text-purple-500">😊</div>
              <h3 className="text-xl font-semibold text-gray-800">
                Pelacak Suasana Hati
              </h3>
              <p className="mt-2 text-gray-600">
                Lacak suasana hati Anda dan lihat ringkasan seiring waktu.
              </p>
              <button
                onClick={() => handleAuthRedirect('auth/login')}
                className="mt-4 text-blue-600 hover:underline focus:outline-none"
              >
                Lihat Detail →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;