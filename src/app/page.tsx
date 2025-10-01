'use client'

import Image from 'next/image'
import Navbar from '@/components/Navbar'
import CardSwap, { Card } from './../components/react-bits/card-swap'
import { Lock, LaptopMinimalCheck, ChartLine } from 'lucide-react';
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion';

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
        <motion.div
          className="absolute top-40 left-30 space-y-10 lg:space-y-14"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-white rounded-2xl shadow-xl px-10 py-6 rotate-[-6deg]"
          >
            <p className="text-4xl lg:text-5xl font-semibold text-gray-800 font-montserrat-alternates">
              10,000+
            </p>
            <p className="text-base lg:text-xl text-gray-500">Active Users</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-white rounded-2xl shadow-xl px-8 py-6 rotate-[-6deg]"
          >
            <p className="text-3xl lg:text-5xl font-semibold text-gray-800 font-montserrat-alternates">
              50K+
            </p>
            <p className="text-base lg:text-xl text-gray-500">Moods Tracked</p>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute top-40 right-30 space-y-10 lg:space-y-14"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-white rounded-2xl shadow-xl px-8 py-6 rotate-[6deg]"
          >
            <p className="text-3xl lg:text-5xl font-semibold text-gray-800 font-montserrat-alternates">
              500K+
            </p>
            <p className="text-base lg:text-xl text-gray-500">Task Completed</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-white rounded-2xl shadow-xl px-8 py-6 rotate-[6deg]"
          >
            <p className="text-3xl lg:text-5xl font-semibold text-gray-800 font-montserrat-alternates">
              200K+
            </p>
            <p className="text-base lg:text-xl text-gray-500">Notes Created</p>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-8xl font-extrabold font-montserrat-alt"
        >
          <span className="text-blue-600">Flow</span>{' '}
          <span className="text-gray-900">Mind</span>
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-semibold text-gray-800 mt-4 font-montserrat"
        >
          Organize, Reflect, and Grow
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl text-gray-600 mt-4"
        >
          The all-in-one productivity app for notes, tasks, and mood tracking.
          Organize your thoughts, achieve your goals, and maintain your wellbeing
        </motion.p>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition shadow-md"
        >
          Get Started
        </motion.button>

        {/* Character Image */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-12"
        >
          <Image
            src="/assets/landing-page1.png"
            alt="FlowMind Character"
            width={900}
            height={900}
            className="drop-shadow-lg"
          />
        </motion.div>
      </section>

      {/* Feature Highlights */}
      <section className="relative flex flex-col pb-20 pr-50 pl-30">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold font-montserrat-alt">
            <span className="text-blue-600">Feature</span>{' '}
            <span className="text-gray-900">Highlights</span>
          </h1>
          <p className="max-w-2xl text-gray-600 mt-4">
            Streamline your productivity with powerful features designed to help you stay organized and focused.
          </p>
          <Image
            src="/assets/landing-page2.png"
            alt="FlowMind Character"
            width={500}
            height={500}
            className="drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="-mt-25 relative"
        >
          <CardSwap cardDistance={60} verticalDistance={70} delay={5000} pauseOnHover={false}>
            <Card customClass="backdrop-blur-lg text-gray-900 shadow-xl flex flex-col items-center justify-center p-6">
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
        </motion.div>
      </section>

      {/* Why Choose FlowMind */}
      <section className="relative flex flex-col md:flex-row items-center justify-between gap-12 px-10 md:px-20 py-20 mt-20">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex flex-col w-full md:w-1/2 text-4xl md:text-3xl"
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center text-center md:items-center md:text-left w-full md:w-1/2 mx-auto"
        >
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
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="bg-[#0812C3] text-white text-center py-20 "
      >
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 font-montserrat-alt">
          Ready to Transform Your Productivity?
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-100">
          Join thousands of users who have already improved their daily workflows with FlowMind
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAuthRedirect('/auth/register')}
            className="bg-white text-[#0812C3] font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-200 transition"
          >
            Get Started Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAuthRedirect('/auth/login')}
            className="border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-[#0812C3] transition"
          >
            Sign In
          </motion.button>
        </div>
      </motion.section>

      {/* Footer */}
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
