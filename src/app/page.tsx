'use client'

import Image from 'next/image'
import Navbar from '@/components/Navbar'
import CardSwap, { Card } from './../components/react-bits/card-swap'
import { Lock, LaptopMinimalCheck, ChartLine } from 'lucide-react';
import { useRouter } from 'next/navigation'



export default function LandingPage() {
  const router = useRouter()

  const handleAuthRedirect = (path: string) => {
    router.push(path)
  }
  return (
    <div className="min-h-screen bg-gray-50 relative font-montserrat">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center pt-32 pb-20 px-50">
        {/* Floating Stats */}
        <div className="absolute top-40 left-30 space-y-10 lg:space-y-14">
          <div className="bg-white rounded-2xl shadow-xl px-10 py-6 rotate-[-6deg] transform transition-transform duration-300 hover:scale-110">
            <p className="text-4xl sm:text-2xl lg:text-5xl font-semibold text-gray-800 font-montserrat-alternates">
              10,000+
            </p>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500">
              Active Users
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 rotate-[-6deg] transform transition-transform duration-300 hover:scale-110">
            <p className="text-3xl sm:text-2xl lg:text-5xl font-semibold text-gray-800 font-montserrat-alternates">
              50K+
            </p>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500">
              Moods Tracked
            </p>
          </div>
        </div>

        <div className="absolute top-40 right-30 space-y-10 lg:space-y-14">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 rotate-[6deg] transform transition-transform duration-300 hover:scale-110">
            <p className="text-3xl sm:text-2xl lg:text-5xl font-semibold text-gray-800 font-montserrat-alternates">
              500K+
            </p>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500">
              Task Completed
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 rotate-[6deg] transform transition-transform duration-300 hover:scale-110">
            <p className="text-3xl sm:text-2xl lg:text-5xl font-semibold text-gray-800 font-montserrat-alternates">
              200K+
            </p>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500">
              Notes Created
            </p>
          </div>
        </div>


        {/* Title */}
        <h1 className="text-5xl md:text-8xl font-extrabold font-montserrat-alt">
          <span className="text-blue-600">Flow</span>{' '}
          <span className="text-gray-900">Mind</span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mt-4 font-montserrat">
          Organize, Reflect, and Grow
        </h2>
        <p className="max-w-2xl text-gray-600 mt-4">
          The all-in-one productivity app for notes, tasks, and mood tracking.
          Organize your thoughts, achieve your goals, and maintain your
          wellbeing
        </p>

        {/* CTA Button */}
        <button className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition shadow-md">
          Get Started
        </button>

        {/* Character Image */}
        <div className="mt-12">
          <Image
            src="/assets/landing-page1.png" // ganti dengan file karakter kamu
            alt="FlowMind Character"
            width={900}
            height={900}
            className="drop-shadow-lg"
          />
        </div>
      </section>

      <section className="relative flex flex-col pb-20 pr-50 pl-30">
        {/* Judul ini sebelah kanan */}
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold font-montserrat-alt">
            <span className="text-blue-600">Feature</span>{' '}
            <span className="text-gray-900">Highlights</span>
          </h1>
          <p className="max-w-2xl text-gray-600 mt-4">
            Streamline your productivity with powerful features designed to help you stay organized and focused.
          </p>
          <Image
            src="/assets/landing-page2.png" // ganti dengan file karakter kamu
            alt="FlowMind Character"
            width={500}
            height={500}
            className="drop-shadow-lg"
          />
        </div>
        {/* Card Swap (Aku pengen ini sebelah kanan) */}
        <div style={{ height: '-100px', position: 'relative' }} className="-mt-25 relative">
          <CardSwap
            cardDistance={60}
            verticalDistance={70}
            delay={5000}
            pauseOnHover={false}
          >
            <Card customClass=" backdrop-blur-lg text-gray-900 shadow-xl flex flex-col items-center justify-center p-6">
              <h3 className="text-xl font-bold mb-2">Summarizer</h3>
              <p className="text-sm text-white-700">Generate summaries instantly</p>
            </Card>

            <Card customClass="bg-white/30 backdrop-blur-lg text-gray-900 shadow-xl flex flex-col items-center justify-center p-6">
              <h3 className="text-xl font-bold mb-2">Notes</h3>
              <p className="text-sm text-white-700">Keep track of your ideas</p>
            </Card>

            <Card customClass="backdrop-blur-lg text-gray-900 shadow-xl flex flex-col items-center justify-center p-6">
              <h3 className="text-xl font-bold mb-2">To-Do-List</h3>
              <p className="text-sm text-white-700">Stay on top of your tasks</p>
            </Card>

            <Card customClass="bg-white/30 backdrop-blur-lg text-gray-900 shadow-xl flex flex-col items-center justify-center p-6">
              <h3 className="text-xl font-bold mb-2">Mood Tracker</h3>
              <p className="text-sm text-white-700">Track your daily emotions</p>
            </Card>
          </CardSwap>
        </div>
      </section>

      <section className="relative flex flex-col md:flex-row items-center justify-between gap-12 px-10 md:px-20 py-20 mt-20">
        {/* Kiri - Tab Features */}
        <div className="flex flex-col w-full md:w-1/2 text-4xl md:text-3xl">
          <div className="bg-[#0812C3] text-white font-semibold rounded-t-xl px-6 py-4 shadow-lg h-30 flex items-center gap-7">
            <Lock className="w-8 h-8" />
            <span>Secure And Private</span>
          </div>

          <div className="bg-blue-400 text-white font-semibold px-6 py-4 shadow-lg rounded-md h-30 flex items-center gap-7">
            <LaptopMinimalCheck className="w-8 h-8" />
            <span>Cross-Platform</span>
          </div>

          <div className="bg-white border border-gray-200 text-[#0812C3] font-semibold px-6 py-4 rounded-b-xl shadow-lg h-30 flex items-center gap-7">
            <ChartLine className="w-8 h-8" />
            <span>Smart Analytics</span>
          </div>
        </div>


        {/* Kanan - Title & Character */}
        <div className="flex flex-col items-center text-center md:items-center md:text-left w-full md:w-1/2 mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold font-montserrat-alt leading-tight">
            <span className="text-gray-900">Why Choose</span>{' '}
          </h1>
          <h1 className="text-4xl md:text-7xl font-extrabold font-montserrat-alt leading-tight">
            <span className="text-blue-600 mr-5">Flow</span>
            <span className="text-blue-600 ml-10">Mind</span>
          </h1>
          <img
            src="/assets/landing-page3.png"
            alt="Flowmind Character"
            className="w-72 md:w-96 drop-shadow-lg center mx-auto -mt-20"
          />
        </div>
      </section>

      <section className="bg-[#0812C3] text-white text-center py-20 ">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 font-montserrat-alt">
          Ready to Transform Your Productivity?
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-100">
          Join thousands of users who have already improved their daily workflows with FlowMind
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <button
            onClick={() => handleAuthRedirect('/auth/register')}
            className="bg-white text-[#0812C3] font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-200 transition" >
            Get Started Now
          </button>
          <button
            onClick={() => handleAuthRedirect('/auth/login')}
            className="border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-[#0812C3] transition">

            Sign In
          </button>
        </div>
      </section>

      <footer className="bg-gray-50 py-6 text-center">
        <div className="flex justify-center mb-2">
          <img src="/logo_flowmind.png" alt="FlowMind Logo" className="h-8" />
        </div>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} FlowMind. All rights reserved.
        </p>
      </footer>

    </div>
  )
}